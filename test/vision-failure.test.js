// A failed --vision step must not look like success. The CSS-only DESIGN.md is
// still written, but the run exits 1 and says why. Before this, the CLI printed
// a warning and exited 0, so a retired Gemini model went unnoticed for months.
//
// Offline: BRANDMD_RAW_FILE skips the browser, BRANDMD_GEMINI_BASE_URL points
// the Gemini SDK at a local server that always answers 400 and records hits.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const BIN = join(here, "..", "bin", "brandmd.js");
const RAW = join(here, "fixtures/raw-vercel.json"); // its `vision` is null

// 1x1 transparent PNG; the fake server never looks at it.
const PNG_1X1 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

async function fakeGemini() {
  const hits = [];
  const server = createServer((req, res) => {
    hits.push(req.url);
    // Any 4xx works: the SDK retries nothing unless retryOptions is set.
    res.writeHead(400, { "content-type": "application/json" });
    res.end('{"error":{"message":"simulated Gemini rejection"}}');
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  return { server, hits, port: server.address().port };
}

// spawn, not spawnSync: the fake server lives in this process and cannot
// answer while a sync spawn blocks the event loop.
function runVision(rawFile, out, port) {
  const env = {
    ...process.env,
    PLAYWRIGHT_BROWSERS_PATH: "/nonexistent-brandmd-test",
    BRANDMD_RAW_FILE: rawFile,
    GEMINI_API_KEY: "test-key-not-real",
    BRANDMD_GEMINI_BASE_URL: `http://127.0.0.1:${port}`,
  };
  delete env.BRANDMD_VISION_MODEL; // the test pins the default model
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [BIN, "https://vercel.com", "--vision", "-o", out], { timeout: 30000, env });
    let stderr = "";
    child.stderr.on("data", (d) => (stderr += d));
    child.on("close", (status) => resolve({ status, stderr }));
  });
}

function assertCssOnlyDesign(out) {
  assert.ok(existsSync(out), "DESIGN.md still written");
  const md = readFileSync(out, "utf-8");
  assert.ok(md.length > 500, "DESIGN.md has content");
  assert.doesNotMatch(md, /## Visual Identity Beyond CSS/);
}

test("--vision: a failed Gemini call writes CSS-only DESIGN.md and exits 1", async () => {
  const { server, hits, port } = await fakeGemini();
  const dir = mkdtempSync(join(tmpdir(), "brandmd-vision-"));
  const out = join(dir, "DESIGN.md");
  // The CLI only calls Gemini when the capture has a vision block; give it one.
  const raw = JSON.parse(readFileSync(RAW, "utf-8"));
  raw.vision = {
    screenshotBase64: PNG_1X1,
    toneSnippets: { h1: ["Build and deploy"], h2: [], hero_text: [], buttons: ["Start"] },
  };
  const rawWithVision = join(dir, "raw.json");
  writeFileSync(rawWithVision, JSON.stringify(raw));
  try {
    const res = await runVision(rawWithVision, out, port);
    assert.equal(res.status, 1, `exit code\n${res.stderr}`);
    assert.match(res.stderr, /vision extraction failed/i);
    assert.equal(hits.length, 1, `gemini requests: ${hits.join(", ")}`);
    assert.match(hits[0], /\/gemini-3\.8-flash:generateContent/, "calls the pinned live model");
    assertCssOnlyDesign(out);
  } finally {
    server.close();
  }
});

test("--vision: a capture with no screenshot skips Gemini and exits 1", async () => {
  const { server, hits, port } = await fakeGemini();
  const out = join(mkdtempSync(join(tmpdir(), "brandmd-vision-")), "DESIGN.md");
  try {
    const res = await runVision(RAW, out, port);
    assert.equal(res.status, 1, `exit code\n${res.stderr}`);
    assert.match(res.stderr, /no screenshot was captured/i);
    assert.equal(hits.length, 0, `gemini requests: ${hits.join(", ")}`);
    assertCssOnlyDesign(out);
  } finally {
    server.close();
  }
});
