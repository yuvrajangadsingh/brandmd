// CLI contract harness for brandmd v0.14 (child_process, offline).
//
// Locks the exit-code + fail-closed contract from improvement-plan.md P0 item 5
// and the codex audit (.notes/codex-audit-v013.md):
//   exit 0 = success, 1 = operational/validation error, 2 = refused
//   (block page / insufficient evidence). --allow-blocked is the escape hatch.
//
// Findings locked here:
//   F-22  reject non-HTTP(S) schemes; reject non-finite --cf-wait-ms
//   F-11  block pages fail closed in ALL formats (md/css/tailwind/html), no
//         artifact written; --allow-blocked writes an artifact with a marker
//   F-21  empty/thin page refuses (exit 2), no artifact
//
// Plus codex v0.14 grade blockers (shapes the friendly tests missed):
//   grade blocker 4   --allow-blocked provenance marker must exist in the css,
//                     tailwind, AND html artifacts, not only default markdown
//   grade blocker 11  zero rendered text + a 2-color palette still refuses
//                     (the all-empty fixture was a test-shape bypass)
//   grade blocker 13  filesystem-like paths (/tmp/x) are rejected exit 1;
//                     https:///tmp/x normalizing to host "tmp" is not validation
//
// Block/empty cases use the BRANDMD_RAW_FILE offline seam (defined below) so
// they run with no browser and no network. They fail against v0.13 on purpose:
// v0.13 has no seam and no exit-2 refusal, so it exits 1 here — that is the
// expected-red state until the v0.14 CLI lands.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const BIN = join(here, "..", "bin", "brandmd.js");
const BLOCK_FIXTURE = join(here, "fixtures/raw-block.json");
const EMPTY_FIXTURE = join(here, "fixtures/raw-empty.json");
const THIN_FIXTURE = join(here, "fixtures/raw-thin.json");

// v0.14 offline test seam: when BRANDMD_RAW_FILE is set the CLI must load that
// JSON raw-capture (same shape as fixtures/raw-vercel.json) as the extracted
// `light` page and skip live extraction (so it must NOT print "Extracting
// from ..."). PLAYWRIGHT_BROWSERS_PATH points at a browser-less path so any
// accidental live extraction fails instantly instead of hanging.
const RAW_SEAM_ENV = "BRANDMD_RAW_FILE";
function runCLI(args, { cwd, rawFile, timeoutMs = 20000 } = {}) {
  const env = { ...process.env, PLAYWRIGHT_BROWSERS_PATH: "/nonexistent-brandmd-test" };
  if (rawFile) env[RAW_SEAM_ENV] = rawFile;
  const res = spawnSync(process.execPath, [BIN, ...args], {
    cwd, env, encoding: "utf-8", timeout: timeoutMs,
  });
  const stdout = res.stdout || "";
  const stderr = res.stderr || "";
  return { status: res.status, stdout, stderr, out: stdout + stderr };
}

function tmp() {
  return mkdtempSync(join(tmpdir(), "brandmd-cli-"));
}

// A deliberate block-provenance marker phrase. Must NOT be satisfiable by
// incidental artifact content: the fixture title "Access Denied", the fixture
// URL, or HTML's own `display:block` CSS.
const BLOCK_MARKER_RE = /likely a block|block[ -]?(page|source|run)|blocked (page|source|run)|bot[ -]?protection|--allow-blocked/i;

// --- Argument validation (no browser needed) --------------------------------

test("no arguments exits 1", () => {
  const r = runCLI([]);
  assert.equal(r.status, 1);
});

test("conflicting format flags exit 1", () => {
  const r = runCLI(["https://example.com", "--css", "--json"]);
  assert.equal(r.status, 1);
  assert.match(r.out, /only one output format/i);
});

test("F-22: a non-HTTP(S) scheme (ftp://) is rejected before extraction", () => {
  const r = runCLI(["ftp://example.com", "--json"]);
  assert.notEqual(r.status, 0, "must not succeed on an ftp:// URL");
  // The tell that v0.13 proceeded anyway is the live-extraction status line.
  assert.doesNotMatch(
    r.out,
    /Extracting from/i,
    "must reject the scheme before starting extraction (no https:// coercion)"
  );
});

test("F-22: a non-finite --cf-wait-ms value is rejected", () => {
  const r = runCLI(["https://example.com", "--cf-wait-ms", "nope", "--json"]);
  assert.notEqual(r.status, 0, "must reject a non-numeric wait value");
  assert.doesNotMatch(
    r.out,
    /Extracting from/i,
    "must reject the bad value before starting extraction (no NaN wait)"
  );
});

test("blocker 13 (F-22): a filesystem-like path (/tmp/x) is rejected before extraction", () => {
  // `new URL("https:///tmp/x")` normalizes to hostname "tmp", so a bare
  // hostname check accepts it and the CLI printed "Extracting from
  // https:///tmp/x...". A path is not a URL; reject it as a validation error.
  const r = runCLI(["/tmp/x", "--json"]);
  assert.equal(r.status, 1, "a filesystem path must be a validation error (exit 1)");
  assert.doesNotMatch(
    r.out,
    /Extracting from/i,
    "must reject the path before starting extraction (no https:// coercion)"
  );
});

// --- Block-page fail-closed across every format (F-11) ----------------------

for (const [flag, outName] of [
  [null, "DESIGN.md"],
  ["--css", "theme.css"],
  ["--tailwind", "theme.css"],
  ["--html", "brand-guide.html"],
]) {
  const label = flag || "--md (default)";
  test(`F-11: a block page refuses with exit 2 and writes no artifact (${label})`, () => {
    const dir = tmp();
    const outFile = join(dir, outName);
    const args = ["https://denied.test"];
    if (flag) args.push(flag);
    args.push("-o", outFile);

    const r = runCLI(args, { cwd: dir, rawFile: BLOCK_FIXTURE });
    assert.equal(r.status, 2, `block page must exit 2 (refused), got ${r.status}`);
    assert.ok(!existsSync(outFile), `no artifact must be written on refusal (${outName})`);
  });
}

test("F-11: --allow-blocked writes an artifact carrying a block provenance marker", () => {
  const dir = tmp();
  const outFile = join(dir, "DESIGN.md");
  const r = runCLI(["https://denied.test", "--allow-blocked", "-o", outFile], {
    cwd: dir,
    rawFile: BLOCK_FIXTURE,
  });
  assert.equal(r.status, 0, `--allow-blocked must succeed, got ${r.status}`);
  assert.ok(existsSync(outFile), "the escape hatch must write the artifact");
  const body = readFileSync(outFile, "utf-8");
  assert.match(body, BLOCK_MARKER_RE, "the artifact must record that the source was a block page");
});

// Grade blocker 4: the marker must exist in EVERY forced format, not only md.
// Marker matching is deliberately phrase-level: the fixture title "Access
// Denied" echoes into artifacts, and HTML's internal CSS contains
// `display:block`, so bare /denied/ or /block/ would false-pass. Only a
// deliberate provenance sentence counts (CSS/Tailwind as a comment, HTML as a
// visible warning).
for (const [flag, outName] of [
  ["--css", "theme.css"],
  ["--tailwind", "theme.css"],
  ["--html", "brand-guide.html"],
]) {
  test(`blocker 4 (F-11): --allow-blocked ${flag} artifact carries a block provenance marker`, () => {
    const dir = tmp();
    const outFile = join(dir, outName);
    const r = runCLI(["https://denied.test", flag, "--allow-blocked", "-o", outFile], {
      cwd: dir,
      rawFile: BLOCK_FIXTURE,
    });
    assert.equal(r.status, 0, `--allow-blocked ${flag} must succeed, got ${r.status}`);
    assert.ok(existsSync(outFile), `the escape hatch must write the ${flag} artifact`);
    const body = readFileSync(outFile, "utf-8");
    assert.match(
      body,
      BLOCK_MARKER_RE,
      `the forced ${flag} artifact must carry a block provenance marker (title/CSS echoes don't count)`
    );
  });
}

// --- Empty / insufficient-evidence refusal (F-21) ---------------------------

test("F-21: an empty page refuses with exit 2 and writes no artifact", () => {
  const dir = tmp();
  const outFile = join(dir, "DESIGN.md");
  const r = runCLI(["https://empty.test", "-o", outFile], {
    cwd: dir,
    rawFile: EMPTY_FIXTURE,
  });
  assert.equal(r.status, 2, `empty page must exit 2 (insufficient evidence), got ${r.status}`);
  assert.ok(!existsSync(outFile), "no artifact must be written for an empty page");
});

test("blocker 11 (F-21): zero rendered text with a 2-color palette still refuses exit 2", () => {
  // Codex's bypass of the all-empty fixture: bodyTextLength 0 but two one-use
  // backgrounds and a count-1 font defeat both detectBlockLikely and the
  // fontCount===0 fatal check, so the CLI wrote a confident artifact. A page
  // with no rendered text has no design system to document; refuse.
  const dir = tmp();
  const outFile = join(dir, "DESIGN.md");
  const r = runCLI(["https://thin.test", "-o", outFile], {
    cwd: dir,
    rawFile: THIN_FIXTURE,
  });
  assert.equal(
    r.status,
    2,
    `a zero-text page must exit 2 (insufficient evidence) even with a small palette, got ${r.status}`
  );
  assert.ok(!existsSync(outFile), "no artifact must be written for a zero-text page");
});

// Documents the seam these tests rely on, so a red run points at the fix.
test(`the CLI honors the ${RAW_SEAM_ENV} offline seam`, () => {
  const dir = tmp();
  const outFile = join(dir, "DESIGN.md");
  const r = runCLI(["https://vercel.com", "-o", outFile], {
    cwd: dir,
    rawFile: join(here, "fixtures/raw-vercel.json"),
  });
  assert.equal(r.status, 0, `a valid raw capture via ${RAW_SEAM_ENV} must generate successfully`);
  assert.doesNotMatch(
    r.out,
    /Extracting from/i,
    `${RAW_SEAM_ENV} must bypass live extraction`
  );
  assert.ok(existsSync(outFile), "a valid capture must write DESIGN.md");
});

// --- `check` exit contract (v0.15) ------------------------------------------
//
// check adds a FOURTH exit code. 1 and 2 already mean "the tool failed" and
// "the tool refused"; a CI job needs to tell those apart from "the design
// actually changed", which is the only one a human should read a diff for.
//   0 = matches spec, 1 = error, 2 = refused, 3 = drift
const SPEC = join(here, "..", "examples", "stripe.md");
const VERCEL_FIXTURE = join(here, "fixtures/raw-vercel.json");

test("check: missing --against exits 1", () => {
  const r = runCLI(["check", "https://example.com"]);
  assert.equal(r.status, 1);
});

test("check: unreadable spec file exits 1", () => {
  const r = runCLI(["check", "https://example.com", "--against", "/nonexistent/DESIGN.md"]);
  assert.equal(r.status, 1);
  assert.match(r.out, /could not read/i);
});

test("check: invalid --fail-on exits 1 without launching a browser", () => {
  const r = runCLI(["check", "https://example.com", "--against", SPEC, "--fail-on", "sometimes"]);
  assert.equal(r.status, 1);
  assert.match(r.out, /--fail-on must be/i);
});

test("check: a block page refuses with exit 2, not drift", () => {
  const r = runCLI(["check", "https://example.com", "--against", SPEC], {
    rawFile: BLOCK_FIXTURE,
  });
  assert.equal(r.status, 2, "a blocked page must not be reported as total drift");
  assert.match(r.out, /refus/i);
});

test("check: a thin page refuses with exit 2", () => {
  const r = runCLI(["check", "https://example.com", "--against", SPEC], {
    rawFile: THIN_FIXTURE,
  });
  assert.equal(r.status, 2);
});

test("check: a different site against the spec is drift (exit 3)", () => {
  const r = runCLI(["check", "https://vercel.com", "--against", SPEC], {
    rawFile: VERCEL_FIXTURE,
  });
  assert.equal(r.status, 3, "drift gets its own code, distinct from 1 and 2");
  assert.match(r.stdout, /Design drift:/);
  assert.match(r.stdout, /major/);
});

test("check: --fail-on none reports drift but exits 0", () => {
  const r = runCLI(["check", "https://vercel.com", "--against", SPEC, "--fail-on", "none"], {
    rawFile: VERCEL_FIXTURE,
  });
  assert.equal(r.status, 0);
  assert.match(r.stdout, /Design drift:/, "still reports, just does not fail");
});

test("check: --report writes machine-readable drift", () => {
  const dir = tmp();
  const out = join(dir, "drift.json");
  const r = runCLI(["check", "https://vercel.com", "--against", SPEC, "--report", out], {
    rawFile: VERCEL_FIXTURE,
  });
  assert.equal(r.status, 3);
  assert.ok(existsSync(out), "expected a JSON report");
  const report = JSON.parse(readFileSync(out, "utf-8"));
  assert.ok(Array.isArray(report.drifts) && report.drifts.length > 0);
  assert.ok(report.counts.major > 0);
  assert.equal(report.spec, SPEC);
});

test("check: the offline seam skips live extraction", () => {
  const r = runCLI(["check", "https://vercel.com", "--against", SPEC], {
    rawFile: VERCEL_FIXTURE,
  });
  assert.doesNotMatch(r.out, /Checking https:\/\/vercel\.com against/,
    "must not announce a live run when the seam is set");
});

test("check: an empty baseline exits 1 instead of passing green", () => {
  const r = runCLI(["check", "https://vercel.com", "--against", "/dev/null"], {
    rawFile: VERCEL_FIXTURE,
  });
  assert.equal(r.status, 1, "a gate must never fail open on a blank spec");
  assert.match(r.out, /nothing to check against/i);
});

test("check: a truncated baseline exits 1", () => {
  const dir = tmp();
  const spec = join(dir, "DESIGN.md");
  const full = readFileSync(SPEC, "utf-8").split("\n").slice(0, 5).join("\n");
  writeFileSync(spec, full);
  const r = runCLI(["check", "https://vercel.com", "--against", spec], {
    rawFile: VERCEL_FIXTURE,
  });
  assert.equal(r.status, 1);
});

// Capture flags are declared on BOTH the root program and `check`. commander
// hands a same-named option to the ROOT in that situation, so without an
// explicit fallback the flag renders in `check --help` and silently does
// nothing. These lock the fallback.
test("check: an invalid --viewport exits 1 before doing any work", () => {
  const r = runCLI(["check", "https://vercel.com", "--against", SPEC, "--viewport", "nonsense"], {
    rawFile: VERCEL_FIXTURE,
  });
  assert.equal(r.status, 1);
  assert.match(r.out, /--viewport must look like/);
});

test("check: a valid --viewport is accepted, not ignored", () => {
  const r = runCLI(["check", "https://vercel.com", "--against", SPEC, "--viewport", "1440x900"], {
    rawFile: VERCEL_FIXTURE,
  });
  assert.equal(r.status, 3, "should still reach the comparison");
});

test("extract: an invalid --viewport exits 1", () => {
  const r = runCLI(["https://example.com", "--viewport", "12"]);
  assert.equal(r.status, 1);
  assert.match(r.out, /--viewport must look like/);
});
