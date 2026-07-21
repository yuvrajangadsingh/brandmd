// Spec-conformance harness for brandmd v0.14.
//
// The v0.14 release contract is that DESIGN.md conforms to the official Google
// DESIGN.md spec (github.com/google-labs-code/design.md): YAML frontmatter with
// the machine-readable token layer + canonical sections in canonical order.
// The official linter (`@google/design.md`) is the arbiter (plan P0 item 7).
//
// Findings locked here (.notes/codex-audit-v013.md + the codex v0.14 grade):
//   grade blocker 2   the linter gate must be fail-closed: if the linter runs
//                     but its output is unparseable, the test FAILS. A skip is
//                     allowed only when the package cannot be resolved at all
//                     (fully offline first run), and BRANDMD_REQUIRE_LINT=1
//                     (set in CI) turns even that skip into a failure.
//   grade blocker 8   a gradient CTA keeps both stops and its real 0px radius
//                     in prose AND in the YAML component tokens (F-20 slice).
//   grade blocker 9   with zero action evidence, YAML must not sell the primary
//                     text ink as colors.primary nor invent button-primary.
//   grade blocker 14  a hostile page title with embedded newlines/headings must
//                     not corrupt canonical sections: exactly one Do's and
//                     Don'ts section, no injected guideline, linter still clean.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { analyze } from "../src/analyze.js";
import { generate } from "../src/generate.js";
import { parseDesign } from "../src/parse-design.js";

// Keep in lockstep with .github/workflows/ci.yml (cache key + warm step).
const LINTER_PKG = "@google/design.md@0.3.0";
const REQUIRE_ENV = "BRANDMD_REQUIRE_LINT";

const here = dirname(fileURLToPath(import.meta.url));
const rawVercel = JSON.parse(readFileSync(join(here, "fixtures/raw-vercel.json"), "utf-8"));
const rawGradient = JSON.parse(readFileSync(join(here, "fixtures/raw-gradient.json"), "utf-8"));
const rawHostileTitle = JSON.parse(readFileSync(join(here, "fixtures/raw-hostile-title.json"), "utf-8"));

function writeDesign(raw) {
  const md = generate(analyze(raw));
  const dir = mkdtempSync(join(tmpdir(), "brandmd-spec-"));
  const file = join(dir, "DESIGN.md");
  writeFileSync(file, md);
  return { md, file };
}

// ---------------------------------------------------------------------------
// Official linter runner (grade blocker 2: fail-closed).
//
// Strategy: `npx --offline` first, so a cached linter never touches the
// network (a blocked registry probe once stalled ~70s and the old test then
// skipped — the exact fail-open codex flagged). Only on a cold cache do we
// allow one online install attempt. Classification:
//   - stdout parses to a {findings, summary} report -> return it (the caller
//     asserts on it; a nonzero linter exit just means errors>0, which the
//     summary assertion then surfaces with the findings attached)
//   - no report + a package-resolution failure signature -> skip, UNLESS
//     BRANDMD_REQUIRE_LINT is set (CI), which makes it a failure
//   - no report + anything else (garbage stdout, crash, timeout) -> FAIL
// ---------------------------------------------------------------------------

const RESOLUTION_FAILURE_RE =
  /ENOTCACHED|ENOTFOUND|ETIMEDOUT|ECONNREFUSED|ECONNRESET|EAI_AGAIN|E404|EOFFLINE|fetch failed|request to https?:\/\/registry\.npmjs\.org\S* failed/i;

function extractJsonObject(stdout) {
  const start = stdout.indexOf("{");
  const end = stdout.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(stdout.slice(start, end + 1));
  } catch {
    return null;
  }
}

function spawnLint(file, { offline, timeout }) {
  const npxArgs = ["-y"];
  if (offline) npxArgs.push("--offline");
  return spawnSync("npx", [...npxArgs, LINTER_PKG, "lint", "--format", "json", file], {
    encoding: "utf-8",
    timeout,
  });
}

// Returns the linter report, or null after skipping the test. Never returns
// null without skipping; unparseable output from a resolvable linter FAILS.
function lintReport(t, file) {
  // Cache hit: fast, fully offline.
  let res = spawnLint(file, { offline: true, timeout: 60000 });
  let report = res.error ? null : extractJsonObject(res.stdout || "");

  if (!report || !report.summary) {
    // Cold cache: one online install attempt.
    res = spawnLint(file, { offline: false, timeout: 240000 });
    report = res.error ? null : extractJsonObject(res.stdout || "");
  }

  if (report && report.summary) return report;

  const detail = [
    `spawn error: ${res.error ? `${res.error.code || ""} ${res.error.message}` : "none"}`,
    `exit: ${res.status}, signal: ${res.signal}`,
    `stdout (first 400): ${JSON.stringify((res.stdout || "").slice(0, 400))}`,
    `stderr (first 400): ${JSON.stringify((res.stderr || "").slice(0, 400))}`,
  ].join("\n");

  const unresolvable =
    (res.error && res.error.code === "ENOENT") || // npx itself not on PATH
    RESOLUTION_FAILURE_RE.test(`${res.stderr || ""}\n${res.stdout || ""}`);

  if (unresolvable && !process.env[REQUIRE_ENV]) {
    t.skip(
      `design.md linter package could not be resolved (offline first run?). ` +
      `CI sets ${REQUIRE_ENV}=1 so this can never skip there. Warm the cache with: ` +
      `npx -y ${LINTER_PKG} lint --help\n${detail}`
    );
    return null;
  }

  assert.fail(
    `official design.md linter did not produce a JSON report — the conformance ` +
    `gate is fail-closed and must not be skipped when the linter is present ` +
    `(grade blocker 2).\n${detail}`
  );
}

function assertLintClean(t, file) {
  const report = lintReport(t, file);
  if (!report) return; // skipped (package unresolvable, local only)
  const findings = JSON.stringify(report.findings || [], null, 2);
  assert.equal(report.summary.errors, 0, `lint errors must be 0. Findings:\n${findings}`);
  assert.equal(report.summary.warnings, 0, `lint warnings must be 0. Findings:\n${findings}`);
}

// ---------------------------------------------------------------------------
// Frontmatter helpers (no deps).
// ---------------------------------------------------------------------------

function frontmatterText(md) {
  const m = md.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return m ? m[1] : null;
}

// Minimal YAML-subset parser: top-level scalars + indentation-nested maps.
// Enough for the spec frontmatter shape; list items ("- x") are skipped, so
// list-valued fields are asserted via yamlSection() text instead.
function parseFrontmatter(md) {
  const text = frontmatterText(md);
  if (text == null) return null;
  const root = {};
  const stack = [{ indent: -1, obj: root }];
  for (const rawLine of text.split("\n")) {
    if (!rawLine.trim() || rawLine.trimStart().startsWith("#")) continue;
    const indent = rawLine.length - rawLine.trimStart().length;
    const kv = rawLine.trim().match(/^([^:]+):\s*(.*)$/);
    if (!kv) continue;
    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) stack.pop();
    const parent = stack[stack.length - 1].obj;
    const key = kv[1].trim();
    const val = kv[2].trim();
    if (val === "") {
      const child = {};
      parent[key] = child;
      stack.push({ indent, obj: child });
    } else {
      parent[key] = val.replace(/^["']|["']$/g, "");
    }
  }
  return root;
}

// Raw text of one top-level frontmatter section (e.g. "components").
function yamlSection(md, key) {
  const text = frontmatterText(md);
  if (text == null) return null;
  const lines = text.split("\n");
  const start = lines.findIndex((l) => l === `${key}:` || l.startsWith(`${key}:`));
  if (start === -1) return null;
  const body = [];
  for (let i = start + 1; i < lines.length; i++) {
    if (lines[i].trim() && !/^\s/.test(lines[i])) break; // next top-level key
    body.push(lines[i]);
  }
  return body.join("\n");
}

// Body slice of one canonical section (heading to next ## heading).
function bodySection(md, heading) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = md.split(new RegExp(`^## ${escaped}\\s*$`, "m"));
  if (parts.length < 2) return null;
  return parts[1].split(/^## /m)[0];
}

// Minimal complete raw-capture skeleton (same shape as fixtures/raw-vercel.json).
function rawSkeleton(overrides = {}) {
  return {
    colors: { background: {}, text: {}, border: {} },
    fonts: {},
    fontsByRole: { heading: {}, body: {}, button: {}, display: {} },
    fontSizes: {},
    fontWeights: {},
    lineHeights: {},
    letterSpacings: {},
    spacings: {},
    radii: {},
    shadows: {},
    cssVars: {},
    components: { buttons: [], cards: [], inputs: [] },
    motion: { canvas: false, webgl: false, lottie: false, inlineRaf: false },
    bodyTextLength: 500,
    title: "Test",
    url: "https://test.example",
    vision: null,
    blockLikely: false,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Core conformance
// ---------------------------------------------------------------------------

test("generated DESIGN.md carries a parseable YAML token layer", () => {
  const { md } = writeDesign(rawVercel);
  const fm = parseFrontmatter(md);
  assert.ok(fm, "frontmatter (--- ... ---) must be present");
  assert.equal(typeof fm.name, "string", "frontmatter must declare a name");
  assert.ok(fm.name.length > 0, "name must be non-empty");
  assert.ok(
    fm.colors && typeof fm.colors === "object" && Object.keys(fm.colors).length > 0,
    "frontmatter must define colors tokens"
  );
  assert.ok(
    fm.typography && typeof fm.typography === "object" && Object.keys(fm.typography).length > 0,
    "frontmatter must define typography tokens"
  );
});

test("generated DESIGN.md passes @google/design.md lint with zero errors/warnings", (t) => {
  const { file } = writeDesign(rawVercel);
  assertLintClean(t, file);
});

// ---------------------------------------------------------------------------
// Grade blocker 8 — gradient CTA keeps both stops + its real 0px radius
// ---------------------------------------------------------------------------

test("blocker 8 (F-20): gradient CTA keeps both stops in the Components prose", () => {
  const md = generate(analyze(rawGradient));
  const comp = bodySection(md, "Components");
  assert.ok(comp, "Components section must exist");
  assert.match(comp, /#ff0000/i, "first gradient stop must appear in component prose");
  assert.match(
    comp,
    /#0000ff/i,
    "second gradient stop must appear in component prose, not just the global palette"
  );
});

test("blocker 8 (F-20): gradient CTA prose states its real 0px radius", () => {
  const md = generate(analyze(rawGradient));
  const comp = bodySection(md, "Components");
  assert.ok(comp, "Components section must exist");
  const radiusLine = comp.split("\n").find((l) => /radius/i.test(l));
  assert.ok(radiusLine, "the button prose must state a corner radius");
  assert.match(radiusLine, /\b0(?:px)?\b/, "the stated radius must be the real 0px, not omitted");
});

test("blocker 8 (F-20): YAML button tokens keep both stops and an honest radius", () => {
  const md = generate(analyze(rawGradient));
  const compYaml = yamlSection(md, "components");
  assert.ok(compYaml, "frontmatter must have a components section");
  assert.match(compYaml, /#ff0000/i, "YAML component tokens must carry the first stop");
  assert.match(compYaml, /#0000ff/i, "YAML component tokens must carry the second stop");

  // The page's dominant 3px radius is a trap: the square 0px CTA must not be
  // mapped onto it (codex observed nearestRounded -> rounded.sm: 3px).
  const fm = parseFrontmatter(md);
  const rounded = fm.rounded || {};
  const buttons = Object.entries(fm.components || {}).filter(([k]) => /button/i.test(k));
  assert.ok(buttons.length > 0, "YAML must define at least one button component");
  const isZero = (v) => v === "none" || parseFloat(v) === 0;
  for (const [name, props] of buttons) {
    const r = props.rounded;
    if (r === undefined) continue; // omitting is honest; lying is not
    const ref = /^\{rounded\.([^}]+)\}$/.exec(r);
    const value = ref ? rounded[ref[1]] : r;
    assert.ok(
      value !== undefined && isZero(String(value)),
      `${name}.rounded must resolve to the real 0px, got ${r} -> ${value}`
    );
  }
});

// ---------------------------------------------------------------------------
// Grade blocker 9 — no action evidence: YAML stays honest
// ---------------------------------------------------------------------------

test("blocker 9 (F-04): YAML never sells the text ink as colors.primary without action evidence", () => {
  // Rich page: white bg, #111111 primary text, supported Inter, ZERO buttons,
  // zero accent colors. Prose already omits the CTA line; the machine layer
  // must be equally honest.
  const md = generate(analyze(rawSkeleton({
    colors: {
      background: { "rgb(255, 255, 255)": 1000 },
      text: { "rgb(17, 17, 17)": 500, "rgb(102, 102, 102)": 60 },
      border: { "rgb(230, 230, 230)": 40 },
    },
    fonts: { Inter: 300 },
    fontsByRole: { heading: { Inter: 20 }, body: { Inter: 250 }, button: {}, display: {} },
    fontSizes: { "16px": 200, "32px": 20 },
    fontWeights: { "400": 250, "600": 30 },
    bodyTextLength: 2000,
  })));
  const fm = parseFrontmatter(md);
  assert.ok(fm, "frontmatter must be present");

  if (fm.colors && fm.colors.primary !== undefined) {
    assert.notEqual(
      String(fm.colors.primary).toLowerCase(),
      "#111111",
      "colors.primary must not be the primary text ink when no action evidence exists"
    );
  }
  const buttonKeys = Object.keys(fm.components || {}).filter((k) => /button/i.test(k));
  assert.deepEqual(
    buttonKeys,
    [],
    "no button component may be invented for a page with zero observed buttons"
  );
});

// ---------------------------------------------------------------------------
// Grade blocker 14 — hostile title cannot corrupt canonical sections
// ---------------------------------------------------------------------------

test("blocker 14: a title with embedded newlines/headings yields exactly one Do's and Don'ts", () => {
  const md = generate(analyze(rawHostileTitle));
  const dodonts = md.match(/^## Do's and Don'ts\s*$/gm) || [];
  assert.equal(dodonts.length, 1, "exactly one Do's and Don'ts section");

  const p = parseDesign(md);
  const allGuidelines = [...(p.guidelines?.dos || []), ...(p.guidelines?.donts || [])].join(" | ");
  assert.doesNotMatch(
    allGuidelines,
    /trust injected title text/i,
    "the injected title line must never surface as a real guideline"
  );
  assert.ok(p.title, "title still parses");
  assert.doesNotMatch(p.title, /\n/, "parsed title is a single line");
});

test("blocker 14: hostile-title output still lints clean (no unclosed-quote warning)", (t) => {
  const { file } = writeDesign(rawHostileTitle);
  assertLintClean(t, file);
});
