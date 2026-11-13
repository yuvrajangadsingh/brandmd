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
  // Cloudflare's JS-detections loader rides on normal pages (discord.com);
  // its challenge page loads the orchestrate script instead.
  "/cf-jsd": `<!doctype html><title>Acme</title>${BODY}<script src="/cdn-cgi/challenge-platform/scripts/jsd/main.js?ray=1"></script>`,
  "/cf-orchestrate": `<!doctype html><title>Just a moment...</title>${BODY}<script src="/cdn-cgi/challenge-platform/h/g/orchestrate/chl_page/v1?ray=1"></script>`,
  // An app that routes itself to sign-in 3 s in: after the CLI's 2 s settle,
  // while it scrolls the 20 screens.
  "/routes-late": `<!doctype html><title>Acme</title>${BODY}<div style="height:2000vh"></div>
<script>setTimeout(() => {
  history.replaceState(null, "", "/signin");
  document.title = "Sign in | Acme";
}, 3000);</script>`,
  // A challenge that clears after 4 s onto a sign-in route (pushState, so the
  // page and its context survive; the CLI's own settle wait is 2 s).
  "/cf-clears": `<!doctype html><title>Just a moment...</title>${BODY}<div id="cf-challenge-running"></div>
<script>setTimeout(() => {
  history.replaceState(null, "", "/signin");
  document.title = "Sign in | Acme";
  document.querySelector("[id^=cf-chall]").remove(); // the full id here would be a marker too
}, 4000);</script>`,
  "/narrow": `<!doctype html><title>Acme</title>${BODY}
<script>if (innerWidth < 800) document.body.replaceChildren();</script>`,
  // Real type and colour, almost no text: thin, but not a block page.
  "/thin": `<!doctype html><title>Acme</title><body style="background:#0b1020;color:#e6e9f2;font-family:Georgia,serif"><div style="background:#1e293b">Soon.</div>`,
  // Fine in light; under prefers-color-scheme: dark the page renders nothing.
  "/dark-empty": `<!doctype html><title>Acme</title>${BODY}
<script>if (matchMedia("(prefers-color-scheme: dark)").matches) document.body.replaceChildren();</script>`,
  // Login evidence: what a wall looks like, and what a normal page carries.
  "/hidden-password": `<!doctype html><title>Acme</title>${BODY}
<div style="display:none"><form><input type="password"></form></div>`,
  "/offscreen-password": `<!doctype html><title>Acme</title>${BODY}
<div style="position:fixed;top:0;left:100vw;width:300px"><form><input type="password"></form></div>`,
  "/landing": `<!doctype html><title>Sign up free | Acme</title>${BODY}`,
  "/canonical": { redirect: "/canonical/" },
  "/canonical/": `<!doctype html><title>Sign up free | Acme</title>${BODY}`,
  "/app": { redirect: "/signin" },
  "/signin": `<!doctype html><title>Sign in | Acme</title>${BODY}`,
  "/login": `<!doctype html><title>Log in | Acme</title>${BODY}`,
  "/users/sign_in": `<!doctype html><title>Sign in | Acme</title>${BODY}`,
  // A single-page app that routes itself to #/login.
  "/spa": `<!doctype html><title>Sign in | Acme</title>${BODY}<script>location.hash = "#/login";</script>`,
  // The same server under another host name, like a redirect to an SSO host.
  "/sso": { redirect: () => `${base.replace("127.0.0.1", "localhost")}/welcome` },
  "/welcome": `<!doctype html><title>Sign in | Acme</title>${BODY}`,
  "/visible-password": `<!doctype html><title>Acme</title>${BODY}<form><input type="password"></form>`,
};

let base;
const server = createServer((req, res) => {
  const page = PAGES[req.url];
  if (page === undefined) return (res.statusCode = 404), res.end();
  if (page.redirect) {
    const location = typeof page.redirect === "function" ? page.redirect() : page.redirect;
    return res.writeHead(302, { location }), res.end();
  }
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

test("Cloudflare's detections loader on a real page is no challenge; its orchestrate script is", { timeout: 120000 }, async (t) => {
  if (!(await browserOk(t))) return;
  let r = await run(t, [`${base}/cf-jsd`, "--cf-wait-ms", "0"]);
  assert.equal(r.status, 0, r.stderr);
  assert.doesNotMatch(r.stderr, /Cloudflare challenge/);
  r = await run(t, [`${base}/cf-orchestrate`, "--cf-wait-ms", "0"]);
  assert.equal(r.status, 2, r.stderr);
  assert.match(r.stderr, /Cloudflare challenge still active/);
});

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
  assert.match(r.stdout, /Refused source, written under `--allow-blocked`/, "the forced artifact carries the marker");

  r = await run(t, ["check", url, "--against", SPEC, "--cf-wait-ms", "0"]);
  assert.equal(r.status, 2, r.stderr);
  assert.match(r.stderr, /Refusing to report drift/);
  assert.match(r.stderr, /after 0ms/, "check waited the time it was given");

  // Before the subcommand, too: a default on check used to win over it.
  r = await run(t, ["--cf-wait-ms", "0", "check", url, "--against", SPEC]);
  assert.equal(r.status, 2, r.stderr);
  assert.match(r.stderr, /after 0ms/);
});

test("the challenge wait is the one given, and the page it clears onto is what gets judged", { timeout: 180000 }, async (t) => {
  if (!(await browserOk(t))) return;
  const url = `${base}/cf-clears`;
  // Waiting long enough: the challenge clears onto a sign-in page.
  let r = await run(t, [url, "--cf-wait-ms", "10000"]);
  assert.equal(r.status, 2, r.stderr);
  assert.match(r.stderr, /login \/ sign-in wall \(\S+\/signin\)/);
  // Not waiting, wherever the flag sits: still a challenge, so a block page.
  // A wait that ignored the flag (or fell back to 20000) would clear instead.
  for (const args of [
    ["check", url, "--against", SPEC, "--cf-wait-ms", "0"],
    ["--cf-wait-ms", "0", "check", url, "--against", SPEC],
  ]) {
    r = await run(t, args);
    assert.equal(r.status, 2, r.stderr);
    assert.match(r.stderr, /looks like a block/, args.join(" "));
  }
});

test("an app that routes to sign-in while the page scrolls is judged where it landed", { timeout: 120000 }, async (t) => {
  if (!(await browserOk(t))) return;
  const r = await run(t, [`${base}/routes-late`]);
  assert.equal(r.status, 2, r.stderr);
  assert.match(r.stderr, /login \/ sign-in wall \(\S+\/signin\)/);
});

test("check renders at the --viewport it is given", { timeout: 120000 }, async (t) => {
  if (!(await browserOk(t))) return;
  // /narrow is empty below 800px, so only a 400px-wide render refuses.
  const r = await run(t, ["check", `${base}/narrow`, "--against", SPEC, "--viewport", "400x800"]);
  assert.equal(r.status, 2, r.stderr);
  assert.match(r.stderr, /insufficient evidence/);
});

test("a multi-page run names the page that was blocked, not the first one", { timeout: 120000 }, async (t) => {
  if (!(await browserOk(t))) return;
  const r = await run(t, [`${base}/ok`, `${base}/challenge`, "--cf-wait-ms", "0"]);
  assert.equal(r.status, 2, r.stderr);
  assert.match(r.stderr, /Refusing to write an artifact: \S+\/challenge looks like a block/);
});

test("a thin page refuses a multi-page run even when another page is rich", { timeout: 120000 }, async (t) => {
  if (!(await browserOk(t))) return;
  const r = await run(t, [`${base}/ok`, `${base}/thin`]);
  assert.equal(r.status, 2, r.stderr);
  assert.match(r.stderr, /Refusing to write an artifact: insufficient evidence \(\S+\/thin: /);
  assert.equal(r.stdout, "");
});

test("a dark capture that fails the gate refuses the run", { timeout: 120000 }, async (t) => {
  if (!(await browserOk(t))) return;
  const r = await run(t, [`${base}/dark-empty`, "--dark"]);
  assert.equal(r.status, 2, r.stderr);
  assert.match(r.stderr, /Refusing to write an artifact: the dark capture: insufficient evidence/);
  assert.equal(r.stdout, "");
});

test("login walls need on-screen or auth-URL evidence", { timeout: 240000 }, async (t) => {
  if (!(await browserOk(t))) return;
  const wrong = [];
  for (const [path, status] of [
    ["/hidden-password", 0], // a password input nobody can see
    ["/offscreen-password", 0], // one parked past the right edge
    ["/landing", 0], // sign-up copy on the page that was asked for
    ["/canonical", 0], // the same, behind a trailing-slash redirect
    ["/app", 2], // sent to a sign-in page
    ["/login", 2], // asked for a sign-in page with no password field yet
    ["/users/sign_in", 2], // the same, Rails-style
    ["/spa", 2], // a hash route to #/login
    [`${base.replace("127.0.0.1", "auth.localhost")}/welcome`, 2], // an auth. host, asked for directly
    ["/sso", 2], // sent to another host that says sign in
    ["/visible-password", 2], // a password field on screen
  ]) {
    const r = await run(t, [path.startsWith("http") ? path : `${base}${path}`]);
    if (r.status !== status) wrong.push(`${path}: exit ${r.status}, want ${status}\n${r.stderr}`);
    else if (status && !/login \/ sign-in wall/.test(r.stderr)) wrong.push(`${path}: refused for another reason\n${r.stderr}`);
  }
  assert.deepEqual(wrong, []);
});
