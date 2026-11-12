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

test("mcp: a real extraction of a local page returns its DESIGN.md", async (t) => {
  try {
    await (await chromium.launch({ headless: true })).close();
  } catch (err) {
    if (process.env.BRANDMD_REQUIRE_BROWSER) throw err;
    t.skip(`chromium not available: ${err.message.split("\n")[0]}`);
    return;
  }
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
