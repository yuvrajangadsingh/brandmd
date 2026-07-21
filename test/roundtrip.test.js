// Generate -> parse -> diff round-trip harness for brandmd v0.14.
//
// Locks the codex audit's F-03 (lossy/corrupting round trip) and F-24 (dark
// output drops overrides + duplicate section numbering). See
// .notes/codex-audit-v013.md. These encode v0.14 TARGET behavior and fail
// against v0.13 src on purpose.
//
// Findings locked here:
//   F-03  every emitted field survives parse; sourceUrl; multi-word roles;
//         last component (the `\z` truncation) — dark bullets don't fold into light
//   F-24  dark section is distinct and uniquely numbered
//   Invariant: diff of a file against itself is empty (reflexive diff)
//
// Plus codex v0.14 grade blockers (round-trip shapes the friendly tests missed):
//   grade blocker 6   a change to a YAML components token is visible after
//                     parseDesign and in brandmd diff (machine layer, not prose)
//   grade blocker 10  CRLF line endings parse identically to LF
//   grade blocker 22  multi-page sources round-trip through parseDesign
//   grade blocker 25  frontmatter and prose hexes normalize to one casing
//   grade blocker 17  empty cards/inputs subsections are OMITTED (no page-level
//                     fallback prose); Buttons required only with evidence

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { analyze } from "../src/analyze.js";
import { generate } from "../src/generate.js";
import { parseDesign } from "../src/parse-design.js";
import { diffDesigns } from "../src/diff.js";

const here = dirname(fileURLToPath(import.meta.url));
const rawVercel = JSON.parse(readFileSync(join(here, "fixtures/raw-vercel.json"), "utf-8"));

// Real token object, augmented to exercise every emitted field the round trip
// has historically lost: a last component ending in "Font size", multi-word
// font roles, a single source URL, and a separate dark palette.
function buildTokens() {
  const t = analyze(rawVercel);
  t.sources = null; // single-source path -> "Extracted from [url](url)"
  // Force the multi-word role lines "Display / hero" and "Buttons / nav".
  t.typography.headingFonts = ["Inter"];
  t.typography.displayFonts = ["Manrope"];
  t.typography.bodyFonts = ["Inter"];
  t.typography.buttonFonts = ["Satoshi"];
  // Inputs is the LAST component; its last emitted field is "Font size". This is
  // the `\z` truncation case from the audit.
  t.components.inputs = {
    bg: "rgb(255, 255, 255)",
    border: "1px solid rgb(235, 235, 235)",
    radius: "6px",
    padding: "8px 12px",
    fontSize: "16px",
  };
  // Dark-only sentinel hexes that never appear in the light vercel palette.
  t.dark = {
    atmosphere: "Dark, high contrast",
    palette: [
      { name: "Ink", hex: "#0A0A0A", role: "Dark background / footer" },
      { name: "Signal", hex: "#C0FFEE", role: "Accent background" },
    ],
  };
  return t;
}

test("F-03: the source URL round-trips (Extracted from ...)", () => {
  const p = parseDesign(generate(buildTokens()));
  assert.ok(p.sourceUrl, "sourceUrl must not be null after parse");
  assert.match(p.sourceUrl, /vercel\.com/, "sourceUrl matches the emitted url");
});

test("F-03: the last component keeps its final field (Font size)", () => {
  const p = parseDesign(generate(buildTokens()));
  // Case-insensitive over the parsed component keys/fields so we lock the
  // behavior (final field survives) without pinning heading casing.
  const comps = Object.values(p.components);
  const hasFontSize = comps.some((props) =>
    Object.entries(props || {}).some(
      ([k, v]) => /font\s*size/i.test(k) && /16\s*px/i.test(String(v))
    )
  );
  assert.ok(hasFontSize, "the last component's `Font size: 16px` must not be truncated");
});

test("F-03/blocker 17: components with evidence round-trip; empty ones are omitted", () => {
  // buildTokens has real button evidence (vercel) and injected input evidence,
  // but zero card evidence. Per grade blocker 17 the empty subsection must be
  // OMITTED, not fabricated from page-level shadow/radius fallbacks.
  const md = generate(buildTokens());
  const p = parseDesign(md);
  const names = Object.keys(p.components).map((n) => n.toLowerCase());
  assert.ok(
    names.some((n) => n.includes("button")),
    `buttons must round-trip when button evidence exists (got: ${names.join(", ") || "none"})`
  );
  assert.ok(
    names.some((n) => n.includes("input")),
    `inputs must round-trip when input evidence exists (got: ${names.join(", ") || "none"})`
  );
  assert.ok(
    !names.some((n) => n.includes("card")),
    "cards must be omitted when the fixture has zero card evidence"
  );
  assert.doesNotMatch(md, /^### Cards\s*$/m, "no Cards heading may be fabricated");
});

test("blocker 17: empty cards/inputs subsections are omitted and parse cleanly", () => {
  // Plain Vercel fixture: cards [] and inputs []. The generator must not
  // invent those subsections from global tokens, and parseDesign must handle
  // their absence without fabricating entries.
  const t = analyze(rawVercel);
  t.sources = null;
  const md = generate(t);
  assert.doesNotMatch(md, /^### Cards\s*$/m, "empty card evidence must omit the Cards heading");
  assert.doesNotMatch(md, /^### Inputs\s*$/m, "empty input evidence must omit the Inputs heading");

  const p = parseDesign(md);
  const names = Object.keys(p.components).map((n) => n.toLowerCase());
  assert.ok(
    names.some((n) => n.includes("button")),
    "buttons still parse (the fixture has real button evidence)"
  );
  assert.ok(
    !names.some((n) => n.includes("card")) && !names.some((n) => n.includes("input")),
    "parseDesign must reflect the omission instead of inventing components"
  );
});

test("F-03: multi-word font roles are parsed (Display / hero, Buttons / nav)", () => {
  const p = parseDesign(generate(buildTokens()));
  const roleValues = Object.values(p.typography.byRole || {}).join(" | ");
  assert.match(roleValues, /Manrope/, "the 'Display / hero' role value must round-trip");
  assert.match(roleValues, /Satoshi/, "the 'Buttons / nav' role value must round-trip");
});

test("F-03/F-24: dark palette does not fold into the light palette", () => {
  const p = parseDesign(generate(buildTokens()));
  const lightHexes = p.colors.map((c) => c.hex.toUpperCase());
  assert.ok(
    !lightHexes.includes("#0A0A0A"),
    "a dark-only color must not appear in the light palette"
  );
  assert.ok(
    !lightHexes.includes("#C0FFEE"),
    "a dark-only color must not appear in the light palette"
  );
});

test("F-24: no two sections share the same number", () => {
  const md = generate(buildTokens());
  const numbers = [...md.matchAll(/^## (\d+)\./gm)].map((m) => m[1]);
  const dupes = numbers.filter((n, i) => numbers.indexOf(n) !== i);
  assert.deepEqual(dupes, [], `duplicate section numbers: ${dupes.join(", ") || "none"}`);
});

test("diff of a generated file against itself is empty", () => {
  const md = generate(buildTokens());
  const dir = mkdtempSync(join(tmpdir(), "brandmd-rt-"));
  const file = join(dir, "DESIGN.md");
  const out = join(dir, "DIFF.md");
  writeFileSync(file, md);
  const r = diffDesigns(file, file, out);
  assert.equal(r.aOnly, 0, "no colors should be unique to side A");
  assert.equal(r.bOnly, 0, "no colors should be unique to side B");
  const diffMd = readFileSync(out, "utf-8");
  assert.doesNotMatch(diffMd, /properties differ/, "no component should differ from itself");
});

// --- grade blocker 6: YAML component tokens are diff-visible -----------------
// Codex changed only YAML components.button-primary.backgroundColor and the
// diff said Buttons matched: parseDesign rebuilds components from prose only.
// The machine layer is normative, so a normative change must be visible.

function specDoc(buttonBg) {
  return [
    "---",
    "name: TokenDiff",
    "colors:",
    '  primary: "#635BFF"',
    '  neutral: "#FFFFFF"',
    "typography:",
    "  body-md:",
    "    fontFamily: Inter",
    "    fontSize: 16px",
    "components:",
    "  button-primary:",
    `    backgroundColor: "${buttonBg}"`,
    '    textColor: "{colors.neutral}"',
    "---",
    "",
    "## Overview",
    "",
    "Token diff fixture.",
    "",
    "## Colors",
    "",
    "- **Purple** (`#635BFF`): Accent background",
    "",
    "## Components",
    "",
    "### Buttons",
    "",
    "- Background: `#635BFF`",
    "- Text color: `#FFFFFF`",
    "",
  ].join("\n");
}

test("blocker 6: a YAML components token change is visible after parseDesign", () => {
  const a = parseDesign(specDoc("{colors.primary}"));
  const b = parseDesign(specDoc("#FF0000"));
  assert.notDeepEqual(
    a.components,
    b.components,
    "changing YAML backgroundColor must change the parsed components (prose is unchanged)"
  );
});

test("blocker 6: a YAML components token change surfaces in brandmd diff output", () => {
  const dir = mkdtempSync(join(tmpdir(), "brandmd-rt-"));
  const aFile = join(dir, "a.md");
  const bFile = join(dir, "b.md");
  const out = join(dir, "DIFF.md");
  writeFileSync(aFile, specDoc("{colors.primary}"));
  writeFileSync(bFile, specDoc("#FF0000"));
  diffDesigns(aFile, bFile, out);
  const diffMd = readFileSync(out, "utf-8");
  assert.match(diffMd, /#ff0000/i, "the changed normative value must appear in the diff");
});

// --- grade blocker 10: CRLF parses identically to LF -------------------------

test("blocker 10: a CRLF copy of a generated file parses identically to LF", () => {
  const md = generate(analyze(rawVercel));
  const crlf = md.replace(/\n/g, "\r\n");
  assert.deepEqual(
    parseDesign(crlf),
    parseDesign(md),
    "Windows line endings must not change any parsed field"
  );
});

// --- grade blocker 22: multi-page sources round-trip -------------------------

test("blocker 22: multi-page sources survive generate -> parseDesign", () => {
  const t = analyze(rawVercel);
  t.sources = ["https://example.test/", "https://example.test/pricing"];
  const md = generate(t);
  assert.match(md, /example\.test\/pricing/, "generation must emit every source");

  const p = parseDesign(md);
  // Contract: multi-page files expose all their sources, not null/first-only.
  assert.ok(Array.isArray(p.sources), "parseDesign must expose a sources array");
  assert.ok(
    p.sources.includes("https://example.test/") &&
      p.sources.includes("https://example.test/pricing"),
    `both sources must round-trip, got: ${JSON.stringify(p.sources)}`
  );
});

// --- grade blocker 25: one hex casing across frontmatter and prose -----------

test("blocker 25: frontmatter and prose hexes normalize to one casing", () => {
  // v0.14 frontmatter emits lowercase hexes while legacy prose parses to
  // uppercase; a v0.13-vs-v0.14 diff then reports identical colors as unique.
  // Contract: every hex parseDesign returns is uppercase (the established
  // convention diff compares with), regardless of which layer it came from.
  const doc = [
    "---",
    "name: CaseMix",
    "colors:",
    '  background: "#fafafa"',
    '  primary: "#4d4d4d"',
    "typography:",
    "  body-md:",
    "    fontFamily: Inter",
    "    fontSize: 16px",
    "---",
    "",
    "## Overview",
    "",
    "Casing fixture.",
    "",
    "## Colors",
    "",
    "- **Off-white** (`#FAFAFA`): Page background",
    "- **Ink** (`#4D4D4D`): Primary text",
    "- **Border** (`#ebebeb`): Divider / border",
    "",
  ].join("\n");

  const p = parseDesign(doc);
  assert.ok(p.colors.length > 0, "colors parse");
  for (const c of p.colors) {
    assert.equal(c.hex, c.hex.toUpperCase(), `hex ${c.hex} must be normalized to uppercase`);
  }
  const distinct = new Set(p.colors.map((c) => c.hex));
  const distinctFolded = new Set(p.colors.map((c) => c.hex.toLowerCase()));
  assert.equal(
    distinct.size,
    distinctFolded.size,
    "no color may appear twice differing only by case"
  );
});
