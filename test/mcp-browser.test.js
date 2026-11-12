// One real extraction through `brandmd mcp`: a local page over HTTP, a real headless Chromium.
// Skips without a browser, unless BRANDMD_REQUIRE_BROWSER is set (CI sets it).
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { createInterface } from "node:readline";
import { once } from "node:events";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const BIN = fileURLToPath(new URL("../bin/brandmd.js", import.meta.url));
const PAGE = `<!doctype html><title>Acme</title>
<body style="margin:0;background:#0b1020;color:#e6e9f2;font-family:Georgia,serif">
<h1 style="font-size:48px">Acme ships design systems</h1>
<p style="font-size:16px">A small local page with enough text, colour and type for brandmd to accept it.</p>
<a href="#" class="btn" style="display:inline-block;background:#3b82f6;color:#fff;padding:12px 20px;border-radius:8px">Get started</a>`;

async function browserOk(t) {
  try {
    await (await chromium.launch({ headless: true })).close();
    return true;
  } catch (err) {
    if (process.env.BRANDMD_REQUIRE_BROWSER) throw err;
    t.skip(`chromium not available: ${err.message.split("\n")[0]}`);
    return false;
  }
}

test("mcp: a real extraction of a local page returns its DESIGN.md", async (t) => {
  if (!(await browserOk(t))) return;
  const server = createServer((_, res) => res.end(PAGE)).listen(0, "127.0.0.1");
  await once(server, "listening");
  const env = { ...process.env };
  delete env.BRANDMD_RAW_FILE;
  const child = spawn(process.execPath, [BIN, "mcp"], { env });
  try {
    const url = `http://127.0.0.1:${server.address().port}/`;
    child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "t", version: "0" } } }) + "\n");
    child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "extract_design_md", arguments: { urls: [url] } } }) + "\n");
    const reply = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("no reply to the tool call in 90 s")), 90000);
      createInterface({ input: child.stdout }).on("line", (line) => {
        try {
          const m = JSON.parse(line);
          if (m.id === 2) { clearTimeout(timer); resolve(m); }
        } catch (err) { clearTimeout(timer); reject(err); }
      });
    });
    const text = reply.result.content.map((c) => c.text).join("\n");
    assert.ok(!reply.result.isError, text);
    assert.match(text, /^---\n/, "starts with the YAML front matter");
    assert.match(text, /#3b82f6/, "the button fill reached the DESIGN.md");
  } finally {
    child.stdin.end();
    server.close();
  }
});

// A cancel or a deadline sends the CLI run SIGTERM. Playwright's debug log
// names the browser it launched (the last launch, as it relaunches once on a
// glibc race), so the test needs no process listing: it signals only the CLI it
// spawned and probes that browser's process group with signal 0, which fails
// once no member lives. While an exited member awaits reaping, macOS answers
// EPERM rather than ESRCH; Linux counts the zombie, so there the test needs an
// init that reaps, as Playwright's Docker guide asks for anyway. The log's own
// account is not asserted: as the CLI exits, Playwright SIGKILLs the group, and
// when the browser has exited a moment before, macOS answers EPERM, which
// Playwright logs and ignores. The 10 s bound sits well under the 45 s
// page-load timeout, which would otherwise end the run on its own.
test("a CLI run sent SIGTERM mid page load closes its browser", { skip: process.platform === "win32", timeout: 60000 }, async (t) => {
  if (!(await browserOk(t))) return;
  let reached;
  const navigating = new Promise((r) => (reached = r));
  const server = createServer(() => reached()).listen(0, "127.0.0.1"); // never answers, so the page load hangs
  t.after(() => (server.closeAllConnections(), server.close()));
  await once(server, "listening");
  const env = { ...process.env, DEBUG: "pw:browser" };
  delete env.BRANDMD_RAW_FILE;
  const cli = spawn(process.execPath, [BIN, `http://127.0.0.1:${server.address().port}/`], { env, stdio: ["ignore", "ignore", "pipe"] });
  t.after(() => cli.kill("SIGTERM")); // a no-op once it has exited
  let log = "";
  cli.stderr.setEncoding("utf8").on("data", (d) => (log += d));
  const closed = once(cli, "close");
  await Promise.race([navigating, closed.then(() => assert.fail(`the CLI exited before loading the page:\n${log}`))]);
  const pid = Number([...log.matchAll(/<launched> pid=(\d+)/g)].at(-1)?.[1]);
  assert.ok(pid, "Playwright logged the browser it launched");
  const groupLives = () => {
    try {
      process.kill(-pid, 0);
      return true;
    } catch (err) {
      if (err.code === "ESRCH" || (err.code === "EPERM" && process.platform === "darwin")) return false;
      throw err;
    }
  };
  assert.ok(groupLives(), "the probe sees the running browser");
  cli.kill("SIGTERM");
  const late = new Promise((r) => setTimeout(r, 10000, "late").unref());
  const exit = await Promise.race([closed, late]);
  assert.notEqual(exit, "late", "the CLI must exit within 10 s of SIGTERM");
  assert.deepEqual(exit, [1, null], "a run cut short exits with the CLI's error code");
  for (let i = 0; i < 50 && groupLives(); i++) await new Promise((r) => setTimeout(r, 100));
  assert.ok(!groupLives(), "nothing in the browser's process group outlives the CLI");
});
