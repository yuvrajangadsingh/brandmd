// Refusals that need a real page. Local pages over HTTP, a real headless
// Chromium, the CLI as users run it. Skips without a browser, unless
// BRANDMD_REQUIRE_BROWSER is set (CI sets it).
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { once } from "node:events";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const BIN = fileURLToPath(new URL("../bin/brandmd.js", import.meta.url));
const SPEC = fileURLToPath(new URL("../examples/stripe.md", import.meta.url));
const BODY = `<body style="margin:0;background:#0b1020;color:#e6e9f2;font-family:Georgia,serif">
<h1 style="font-size:48px">Acme ships design systems</h1>
<p style="font-size:16px">A small local page with enough text, colour and type for brandmd to accept it.</p>
<a href="#" class="btn" style="display:inline-block;background:#3b82f6;color:#fff;padding:12px 20px;border-radius:8px">Get started</a>`;
const PAGES = {
  // A Cloudflare marker that never goes away, on an otherwise real page.
  "/challenge": `<!doctype html><title>Just a moment...</title>${BODY}<div id="cf-challenge-running"></div>`,
  "/ok": `<!doctype html><title>Acme</title>${BODY}`,
  // Fine in light; under prefers-color-scheme: dark the page renders nothing.
  "/dark-empty": `<!doctype html><title>Acme</title>${BODY}
<script>if (matchMedia("(prefers-color-scheme: dark)").matches) document.body.replaceChildren();</script>`,
};

let base;
const server = createServer((req, res) => {
  const page = PAGES[req.url];
  if (page === undefined) return (res.statusCode = 404), res.end();
  res.setHeader("content-type", "text/html");
  res.end(page);
});
before(async () => {
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());

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

// Async, not spawnSync: the pages are served from this process.
function run(t, args) {
  const env = { ...process.env };
  delete env.BRANDMD_RAW_FILE;
  const child = spawn(process.execPath, [BIN, ...args], { env });
  t.after(() => child.kill("SIGTERM")); // a no-op once it has exited
  let stdout = "";
  let stderr = "";
  child.stdout.setEncoding("utf8").on("data", (d) => (stdout += d));
  child.stderr.setEncoding("utf8").on("data", (d) => (stderr += d));
  return once(child, "close").then(([status]) => ({ status, stdout, stderr }));
}

test("a Cloudflare challenge that never clears is refused (exit 2), in extraction and check", { timeout: 120000 }, async (t) => {
  if (!(await browserOk(t))) return;
  const url = `${base}/challenge`;
  let r = await run(t, [url, "--cf-wait-ms", "0"]);
  assert.equal(r.status, 2, r.stderr);
  assert.match(r.stderr, /Cloudflare challenge still active/);
  assert.match(r.stderr, /Refusing to write an artifact/);
  assert.equal(r.stdout, "");

  r = await run(t, [url, "--cf-wait-ms", "0", "--allow-blocked"]);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /Likely a block/, "the forced artifact carries the block marker");

  r = await run(t, ["check", url, "--against", SPEC, "--cf-wait-ms", "0"]);
  assert.equal(r.status, 2, r.stderr);
  assert.match(r.stderr, /Refusing to report drift/);
});

test("a multi-page run names the page that was blocked, not the first one", { timeout: 120000 }, async (t) => {
  if (!(await browserOk(t))) return;
  const r = await run(t, [`${base}/ok`, `${base}/challenge`, "--cf-wait-ms", "0"]);
  assert.equal(r.status, 2, r.stderr);
  assert.match(r.stderr, /Refusing to write an artifact: \S+\/challenge looks like a block/);
});

test("a dark capture that fails the gate refuses the run", { timeout: 120000 }, async (t) => {
  if (!(await browserOk(t))) return;
  const r = await run(t, [`${base}/dark-empty`, "--dark"]);
  assert.equal(r.status, 2, r.stderr);
  assert.match(r.stderr, /Refusing to write an artifact: the dark capture: insufficient evidence/);
  assert.equal(r.stdout, "");
});
