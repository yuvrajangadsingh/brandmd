// `brandmd mcp` speaks MCP over stdio. Tool calls run the real CLI through the
// BRANDMD_RAW_FILE seam, so these need no browser and no network.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { constants, closeSync, existsSync, mkdtempSync, openSync, readFileSync, writeSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createInterface } from "node:readline";
import { once } from "node:events";

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
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const cancel = (requestId) => ({ jsonrpc: "2.0", method: "notifications/cancelled", params: { requestId, reason: "test" } });

// A server that stays up until end(), so a test can look at it between replies.
function live(t, env) {
  const child = spawn(process.execPath, [BIN, "mcp"], { env: { ...process.env, ...env } });
  t.after(() => child.kill("SIGTERM")); // a no-op once it has exited; its own shutdown halts its runs
  const closed = once(child, "close");
  const replies = new Map();
  createInterface({ input: child.stdout }).on("line", (l) => {
    const m = JSON.parse(l);
    replies.set(m.id, m);
  });
  return {
    send: (...msgs) => child.stdin.write(msgs.map((m) => `${JSON.stringify(m)}\n`).join("")),
    async reply(id, ms = 5000) {
      for (const until = Date.now() + ms; !replies.has(id) && Date.now() < until; ) await sleep(50);
      return replies.get(id);
    },
    // SIGTERM is the server's own shutdown path, so its CLI runs go with it.
    async end() {
      child.stdin.end();
      const late = new Promise((r) => setTimeout(r, 10000, "late").unref());
      if ((await Promise.race([closed, late])) === "late") {
        child.kill("SIGTERM");
        assert.fail("the server did not exit within 10 s of stdin closing");
      }
    },
  };
}

// The CLI reads BRANDMD_RAW_FILE with a blocking read, so a FIFO nobody writes
// keeps every call running until something stops it.
function fifo() {
  const path = join(mkdtempSync(join(tmpdir(), "brandmd-mcp-")), "raw.fifo");
  assert.equal(spawnSync("mkfifo", [path]).status, 0);
  return path;
}

// A non-blocking open for writing fails with ENXIO only if no CLI is left
// reading the FIFO. If any are, writing and closing releases them all.
function cliStillReading(path) {
  let fd;
  try {
    fd = openSync(path, constants.O_WRONLY | constants.O_NONBLOCK);
  } catch (e) {
    assert.equal(e.code, "ENXIO");
    return false;
  }
  writeSync(fd, "{}");
  closeSync(fd);
  return true;
}

// Wait until a CLI has the FIFO open, and hold the write end so it stays
// blocked: a test that then stops it knows it was really running.
async function holdReader(t, path) {
  for (const until = Date.now() + 10000; Date.now() < until; await sleep(50)) {
    try {
      const fd = openSync(path, constants.O_WRONLY | constants.O_NONBLOCK);
      t.after(() => closeSync(fd));
      return fd;
    } catch (e) {
      assert.equal(e.code, "ENXIO");
    }
  }
  assert.fail("no CLI opened the FIFO within 10 s");
}

// With the write end held, a write fails with EPIPE once no reader is left.
async function readerGone(fd, ms = 5000) {
  for (const until = Date.now() + ms; Date.now() < until; await sleep(100)) {
    try {
      writeSync(fd, " ");
    } catch (e) {
      assert.equal(e.code, "EPIPE");
      return true;
    }
  }
  return false;
}

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

test("mcp: closing stdin stops running extractions", { skip: process.platform === "win32" }, async (t) => {
  const raw = fifo();
  const s = live(t, { BRANDMD_RAW_FILE: raw });
  s.send(call(1, { urls: ["vercel.com"] }), call(2, { urls: ["vercel.com"] }));
  await sleep(1500);
  await s.end();
  await sleep(1500);
  assert.equal(cliStillReading(raw), false, "a CLI run outlived the server");
});

test("mcp: a call past BRANDMD_MCP_TIMEOUT answers with a tool error and its CLI run is stopped", { skip: process.platform === "win32" }, async (t) => {
  const raw = fifo();
  const s = live(t, { BRANDMD_RAW_FILE: raw, BRANDMD_MCP_TIMEOUT: "3" });
  s.send(call(1, { urls: ["vercel.com"] }));
  const fd = await holdReader(t, raw);
  const r = await s.reply(1);
  const gone = await readerGone(fd); // stdin is still open, so only the deadline can have stopped it
  await s.end();
  assert.equal(r?.result.isError, true, "the call must answer, not hang");
  assert.match(r.result.content[0].text, /stopped after 3s/);
  assert.equal(gone, true, "the deadline must stop the CLI run, not only answer");
});

test("mcp: an out-of-range BRANDMD_MCP_TIMEOUT falls back to 180 s", { skip: process.platform === "win32" }, async (t) => {
  const raw = fifo();
  const s = live(t, { BRANDMD_RAW_FILE: raw, BRANDMD_MCP_TIMEOUT: "2147484" });
  s.send({ jsonrpc: "2.0", id: 2, method: "ping" });
  assert.ok(await s.reply(2), "the server is up before the window starts");
  s.send(call(1, { urls: ["vercel.com"] }));
  const early = await s.reply(1, 1500);
  await s.end();
  assert.equal(early, undefined, "2147484 s overflows Node's timer, which would stop the call at once");
});

test("mcp: notifications/cancelled stops that call's CLI run and sends no reply", { skip: process.platform === "win32" }, async (t) => {
  const raw = fifo();
  const s = live(t, { BRANDMD_RAW_FILE: raw });
  s.send(call(1, { urls: ["vercel.com"] }));
  const fd = await holdReader(t, raw);
  s.send(cancel(1));
  const gone = await readerGone(fd);
  s.send({ jsonrpc: "2.0", id: 2, method: "ping" });
  const pong = await s.reply(2);
  const late = await s.reply(1, 500);
  await s.end();
  assert.ok(pong, "the server keeps serving");
  assert.equal(gone, true, "the cancelled call's CLI run must be gone");
  assert.equal(late, undefined, "a cancelled call gets no reply");
});
