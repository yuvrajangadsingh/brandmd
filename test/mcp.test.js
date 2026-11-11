// `brandmd mcp` speaks MCP over stdio. Tool calls run the real CLI through the
// BRANDMD_RAW_FILE seam, so these need no browser and no network.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { constants, closeSync, existsSync, mkdtempSync, openSync, readFileSync, writeSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const BIN = join(here, "..", "bin", "brandmd.js");
const pkg = JSON.parse(readFileSync(join(here, "..", "package.json"), "utf8"));

// Send each message as one line, wait for `expect` reply lines (closing stdin
// stops the server and any running call), then collect them.
function session(messages, env, expect) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [BIN, "mcp"], { env: { ...process.env, ...env } });
    let out = "";
    child.stdout.on("data", (d) => {
      out += d;
      // Count newline-terminated replies; a reply split across chunks isn't done yet.
      if ((out.match(/\n/g) || []).length >= expect) child.stdin.end();
    });
    setTimeout(() => child.stdin.end(), 20000).unref();
    child.on("error", reject);
    child.on("close", () => {
      const replies = out.split("\n").filter(Boolean).map((l) => JSON.parse(l));
      const byId = Object.fromEntries(replies.filter((r) => !Array.isArray(r)).map((r) => [r.id, r]));
      resolve(Object.assign(byId, { batches: replies.filter(Array.isArray) }));
    });
    for (const m of messages) child.stdin.write(`${typeof m === "string" ? m : JSON.stringify(m)}\n`);
  });
}

const call = (id, args) => ({ jsonrpc: "2.0", id, method: "tools/call", params: { name: "extract_design_md", arguments: args } });

test("mcp: handshake, tool list, and unknown methods", async () => {
  const r = await session([
    { jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-03-26", capabilities: {}, clientInfo: { name: "t", version: "0" } } },
    { jsonrpc: "2.0", method: "notifications/initialized" },
    { jsonrpc: "2.0", id: 2, method: "tools/list" },
    { jsonrpc: "2.0", id: 3, method: "resources/list" },
    { jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "nope", arguments: {} } },
    "{not json",
  ], {}, 5);
  assert.equal(r[1].result.protocolVersion, "2025-03-26");
  assert.deepEqual(r[1].result.serverInfo, { name: "brandmd", version: pkg.version });
  assert.deepEqual(r[2].result.tools.map((t) => t.name), ["extract_design_md"]);
  assert.equal(r[3].error.code, -32601);
  assert.equal(r[4].error.code, -32602);
  assert.equal(r.null.error.code, -32700);
  assert.equal(Object.keys(r).length, 6, "the notification must not get a reply");
});

test("mcp: batches and malformed envelopes", async () => {
  const r = await session([
    [{ jsonrpc: "2.0", id: 7, method: "ping" }, { jsonrpc: "2.0", method: "notifications/initialized" }, { jsonrpc: "2.0", id: 8, method: "tools/list" }],
    { jsonrpc: "2.0", id: {}, method: "ping" },
    { jsonrpc: "1.0", id: 9, method: "ping" },
    { jsonrpc: "2.0", id: 10, method: "tools/call", params: { name: "extract_design_md", arguments: null } },
    [{ jsonrpc: "1.0", method: "ping" }, { jsonrpc: "2.0", id: null, method: "ping" }, { jsonrpc: "2.0", id: 11, result: {} }],
    call(12, { urls: ["https://example.com/\u0000"] }),
  ], {}, 6);
  // Batches reply in whatever order they finish, so find each by content.
  const good = r.batches.find((b) => b.some((x) => x.id === 7));
  const bad = r.batches.find((b) => b !== good);
  assert.equal(r.batches.length, 2);
  assert.deepEqual(good.map((x) => [x.id, !!x.result]), [[7, true], [8, true]]);
  assert.deepEqual(bad.map((x) => [x.id, x.error.code]), [[null, -32600], [null, -32600]], "a bad notification and a null id are invalid; a client response gets no reply");
  assert.equal(r[12].result.isError, true, "a NUL in a URL is a tool error, not a crash");
  assert.equal(r.null.error.code, -32600, "an object id is not a valid id");
  assert.equal(r[9].error.code, -32600);
  assert.equal(r[10].result.isError, true);
});

test("mcp: extract_design_md returns the CLI's DESIGN.md", async () => {
  const r = await session([call(1, { urls: ["vercel.com"] })], { BRANDMD_RAW_FILE: join(here, "fixtures/raw-vercel.json") }, 1);
  assert.equal(r[1].result.isError, undefined);
  assert.match(r[1].result.content[0].text, /^---\nversion: alpha\n/);
});

test("mcp: a refused page comes back as a tool error with the reason", async () => {
  const r = await session([call(1, { urls: ["https://example.com"] })], { BRANDMD_RAW_FILE: join(here, "fixtures/raw-block.json") }, 1);
  assert.equal(r[1].result.isError, true);
  assert.match(r[1].result.content[0].text, /Refusing to write an artifact/);
});

test("mcp: a URL can never become a CLI flag, a subcommand, or bad input", async () => {
  const dir = mkdtempSync(join(tmpdir(), "brandmd-mcp-"));
  const target = join(dir, "pwned.md");
  const r = await session(
    [
      call(1, { urls: ["vercel.com", `--output=${target}`] }),
      call(2, { urls: [] }),
      call(3, { urls: "stripe.com" }),
      call(4, { urls: ["diff", "a.md", "b.md"] }),
      call(5, { urls: ["mailto:person@example.com"] }),
      call(6, { urls: ["vercel.com"], dark: "true" }),
    ],
    { BRANDMD_RAW_FILE: join(here, "fixtures/raw-vercel.json") },
    6
  );
  assert.equal(existsSync(target), false, "--output in a URL must not write a file");
  for (const id of [1, 2, 3, 4, 5, 6]) assert.equal(r[id].result.isError, true, `call ${id}`);
  assert.match(r[4].result.content[0].text, /is not a URL/, "diff must not reach the diff subcommand");
  assert.match(r[5].result.content[0].text, /unsupported URL scheme/, "the CLI's own check must see the URL unchanged");
});

// The CLI reads BRANDMD_RAW_FILE with a blocking read, so a FIFO nobody writes
// keeps every call running. After the client hangs up, a non-blocking open for
// writing fails with ENXIO only if no CLI is left holding the FIFO.
test("mcp: closing stdin stops running extractions", { skip: process.platform === "win32" }, async () => {
  const fifo = join(mkdtempSync(join(tmpdir(), "brandmd-mcp-")), "raw.fifo");
  assert.equal(spawnSync("mkfifo", [fifo]).status, 0);
  const server = spawn(process.execPath, [BIN, "mcp"], { env: { ...process.env, BRANDMD_RAW_FILE: fifo }, stdio: ["pipe", "ignore", "ignore"] });
  server.stdin.write(`${JSON.stringify(call(1, { urls: ["vercel.com"] }))}\n${JSON.stringify(call(2, { urls: ["vercel.com"] }))}\n`);
  await new Promise((r) => setTimeout(r, 1500));
  server.stdin.end();
  await new Promise((r) => server.on("close", r));
  await new Promise((r) => setTimeout(r, 1500));
  let fd;
  try {
    fd = openSync(fifo, constants.O_WRONLY | constants.O_NONBLOCK);
  } catch (e) {
    assert.equal(e.code, "ENXIO");
    return;
  }
  writeSync(fd, "{}"); // let the orphans exit before failing
  closeSync(fd);
  assert.fail("a CLI run outlived the server");
});
