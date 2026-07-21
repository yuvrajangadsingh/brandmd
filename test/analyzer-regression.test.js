// Analyzer regression harness for brandmd v0.14.
//
// Locks the codex audit's deterministic offline repros (.notes/codex-audit-v013.md).
// Each test names the finding it pins. These encode v0.14 TARGET behavior, so
// several fail against v0.13 src on purpose — they define done.
//
// Findings locked here:
//   F-02  color clustering order-independence            (v0.15 scope -> todo)
//   F-07  alpha-aware clustering (scrim never eats brand) (v0.15 scope -> todo)
//   F-19  filter-before-truncate; no fake base-grid claim (v0.14)
//   F-21  empty raw maps -> no invented design system     (v0.14)
//   F-04  CTA names the accent, never the primary text    (v0.14)
//   min-support: a count-1 font can never be Primary      (v0.14)
//
// Plus codex v0.14 grade blockers (adversarial shapes the friendly tests missed):
//   grade blocker 1   count-1 font as the ONLY font still never becomes Primary
//   grade blocker 20  the 80% grid threshold is computed over the FULL weighted
//                     evidence, not after top-N truncation
//   grade blocker 12  sparse captures tag Components and Do's and Don'ts with a
//                     low-confidence qualifier (or omit them)

import { test } from "node:test";
import assert from "node:assert/strict";
import { analyze } from "../src/analyze.js";
import { generate } from "../src/generate.js";

// Minimal complete raw-capture skeleton (same shape as fixtures/raw-vercel.json).
// Spread overrides on top so each case states only what it exercises.
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

// --- F-02: clustering is order-independent (v0.15 scope) --------------------
// Same frequency map, permuted key insertion order, must yield the same palette.
// Today clusterColors keeps the first-seen representative, so #F0F0F0 (freq 1)
// wins over #FFFFFF (freq 1000) purely on DOM order. Marked todo: the stable
// alpha-aware rewrite is P1/v0.15 in the plan.
test(
  "F-02: permuting color key order yields an identical palette",
  { todo: "clustering rewrite is v0.15 (P1) scope per improvement-plan.md" },
  () => {
    const a = analyze(rawSkeleton({
      colors: { background: { "#f0f0f0": 1, "#ffffff": 1000 }, text: {}, border: {} },
    }));
    const b = analyze(rawSkeleton({
      colors: { background: { "#ffffff": 1000, "#f0f0f0": 1 }, text: {}, border: {} },
    }));
    assert.deepEqual(
      a.palette.map((c) => c.hex),
      b.palette.map((c) => c.hex),
      "palette order/representatives must not depend on key insertion order"
    );
    // The 1000-use color must be the representative, not the 1-use one.
    assert.equal(a.palette[0].hex, "#FFFFFF");
  }
);

// --- F-07: alpha-aware clustering (v0.15 scope) -----------------------------
// A 1-use translucent scrim must not absorb a 100-use opaque brand color.
// Today chroma.deltaE ignores alpha, so rgba(255,0,0,.1) eats rgb(255,0,0).
// Marked todo: alpha-band separation is P1/v0.15 in the plan.
test(
  "F-07: a 1-use rgba scrim never absorbs a 100-use opaque color",
  { todo: "alpha-aware clustering is v0.15 (P1) scope per improvement-plan.md" },
  () => {
    const t = analyze(rawSkeleton({
      colors: {
        background: { "rgba(255, 0, 0, 0.1)": 1, "rgb(255, 0, 0)": 100 },
        text: {},
        border: {},
      },
    }));
    const opaqueRed = t.palette.find((c) => c.hex === "#FF0000");
    assert.ok(opaqueRed, "the opaque 100-use red must survive as its own token");
    assert.ok(opaqueRed.freq >= 100, "opaque red keeps its real frequency");
    assert.ok(
      !t.palette.some((c) => c.hex === "#FF00001A"),
      "the near-transparent scrim must not be the representative"
    );
  }
);

// --- F-19: filter-before-truncate, no invented base grid --------------------

test("F-19: a real 48px heading survives a crowd of noisy ~16px sizes", () => {
  // 30 distinct sizes in 15.5-16.4px at frequency 2, plus one 48px heading at 1.
  // v0.13 truncates to the top 30 raw strings BEFORE clustering, so the heading
  // ranks 31st and vanishes. v0.14 must cluster/filter first so it survives.
  const fontSizes = {};
  for (let i = 0; i < 30; i++) {
    fontSizes[`${(15.5 + i * 0.03).toFixed(2)}px`] = 2;
  }
  fontSizes["48px"] = 1;
  const t = analyze(rawSkeleton({
    fontSizes,
    fonts: { Inter: 100 },
    fontsByRole: { heading: {}, body: { Inter: 100 }, button: {}, display: {} },
  }));
  assert.ok(
    t.typography.sizes.some((s) => s.px >= 40),
    "the 48px heading must not be truncated away by noisy body sizes"
  );
});

test("F-19: spacing junk is filtered before the top-N truncation", () => {
  // 20 invalid (negative) spacings out-rank a real 8px at position 21. v0.13
  // truncates to 20 THEN filters, dropping every valid value. v0.14 must filter
  // invalid/out-of-range values first so 8px survives.
  const spacings = {};
  for (let i = 0; i < 20; i++) spacings[`${-(i + 1)}px`] = 100 - i;
  spacings["8px"] = 1;
  const t = analyze(rawSkeleton({ spacings }));
  assert.ok(
    t.spacing.some((s) => s.px === 8),
    "a valid 8px value must not be crowded out by invalid spacings"
  );
});

test("F-19: no base-grid claim when the values are not mostly multiples", () => {
  // 4, 7, 13, 19: only one of four is a multiple of 4. v0.13 asserts a 4px grid
  // because a single 4 appears. v0.14 must not claim a grid below the coverage
  // threshold.
  const md = generate(analyze(rawSkeleton({
    spacings: { "4px": 10, "7px": 9, "13px": 8, "19px": 7 },
  })));
  assert.doesNotMatch(md, /\d+px grid/i, "must not invent a px grid");
  assert.doesNotMatch(md, /multiples of \d/i, "must not claim multiples that don't hold");
});

// --- F-21: empty input must not become a confident invented design system ---

test("F-21: empty raw maps never produce 'Balanced and professional' guidance", () => {
  const t = analyze(rawSkeleton({ bodyTextLength: 0, url: "https://empty.example" }));

  // Refusal may surface as a throw or as a marked-insufficient document; accept
  // either, but the fabricated prose must never appear.
  let md = null;
  try {
    md = generate(t);
  } catch {
    return; // throwing on no-evidence is a valid refusal
  }
  assert.doesNotMatch(md, /Balanced and professional/i, "no invented atmosphere");
  assert.doesNotMatch(md, /\bsystem-ui\b/, "no invented primary font");
  assert.doesNotMatch(md, /Stick to 0 font weights/i, "no zero-weight instruction");
});

// --- F-04: the CTA guideline names the accent, not the primary text ---------

test("F-04: CTA line names the accent background, never the primary text", () => {
  // #635BFF is the accent background; #111111 is primary text. Dominant-first
  // sorting puts the black text ahead of the accent, and the v0.13 substring
  // match on "Primary" promotes the text color. v0.14 must exclude text roles.
  const md = generate(analyze(rawSkeleton({
    colors: {
      background: { "rgb(255, 255, 255)": 1000, "rgb(99, 91, 255)": 50 },
      text: { "rgb(17, 17, 17)": 500 },
      border: {},
    },
    fonts: { Inter: 100 },
    fontsByRole: { heading: {}, body: { Inter: 100 }, button: {}, display: {} },
  })));

  const cta = md.match(/Use `?(#[0-9A-Fa-f]{3,6})`? for primary actions/i);
  if (cta) {
    assert.equal(cta[1].toUpperCase(), "#635BFF", "CTA must be the accent color");
    assert.notEqual(cta[1].toUpperCase(), "#111111", "CTA must not be primary text");
  } else {
    // Omitting the line when only text evidence exists is also acceptable, but
    // here real accent evidence exists, so the line should name it.
    assert.match(md, /#635BFF/i, "accent color should be recommended for CTAs");
  }
  assert.doesNotMatch(
    md,
    /Use `?#111111`? for primary actions/i,
    "the primary text color must never be sold as the CTA color"
  );
});

// --- min-support: a count-1 font can never be Primary -----------------------

test("min-support: a font used exactly once is never chosen as Primary", () => {
  // Poolsuite regression: a stray count-1 display font ("Ishmeria") flipped the
  // primary font between runs. v0.14 must gate Primary on minimum support.
  const t = analyze(rawSkeleton({
    fonts: { Inter: 500, Ishmeria: 1 },
    fontsByRole: { heading: {}, body: { Inter: 480 }, button: {}, display: { Ishmeria: 1 } },
  }));
  assert.notEqual(t.typography.primary, "Ishmeria", "a count-1 font can't be Primary");
  assert.equal(t.typography.primary, "Inter", "the well-supported font wins");
});

test("blocker 1: a count-1 font that is the ONLY font still never becomes Primary", () => {
  // Codex's adversarial shape: no supported alternative exists, and the final
  // frequency fallback (fontList[0] || "system-ui") hands Primary right back to
  // the count-1 font. The invariant is absolute: below minimum support a font
  // can NEVER be Primary — degrade honestly (null / generic marked low
  // confidence) instead of resurrecting the unsupported candidate.
  const t = analyze(rawSkeleton({
    fonts: { Ishmeria: 1 },
    fontsByRole: { heading: {}, body: {}, button: {}, display: { Ishmeria: 1 } },
    fontSizes: { "16px": 1 },
    bodyTextLength: 400,
  }));
  assert.notEqual(
    t.typography.primary,
    "Ishmeria",
    "a count-1 font must not become Primary even when it is the only candidate"
  );
});

test("blocker 20: no grid claim when off-grid weight dominates after truncation", () => {
  // 12 grid-aligned values (multiples of 8) at frequency 10 = 120 weight, plus
  // 100 distinct odd values at frequency 9 = 900 weight. Only ~11.8% of the
  // full weighted evidence is on-grid, but top-N truncation discards the
  // off-grid values first, so the claim threshold sees only aligned survivors.
  // The 80% coverage must be computed over the FULL weighted candidate set.
  const spacings = {};
  for (let i = 1; i <= 12; i++) spacings[`${i * 8}px`] = 10;
  for (let v = 1, added = 0; added < 100; v += 2) {
    spacings[`${v}px`] = 9; // odd values are never multiples of 4/8/16
    added++;
  }
  const md = generate(analyze(rawSkeleton({ spacings })));
  assert.doesNotMatch(md, /\d+px grid/i, "must not claim a grid the full evidence contradicts");
  assert.doesNotMatch(md, /multiples of \d/i, "must not claim multiples below the coverage threshold");
});

// --- grade blocker 12: per-section confidence on sparse evidence -------------

// Body slice of one canonical section (heading to next ## heading), or null.
function bodySection(md, heading) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = md.split(new RegExp(`^## ${escaped}\\s*$`, "m"));
  if (parts.length < 2) return null;
  return parts[1].split(/^## /m)[0];
}

test("blocker 12: sparse capture tags Components and Do's and Don'ts low-confidence (or omits them)", () => {
  // Same shape as fixtures/raw-thin.json (zero rendered text, two 1-use
  // backgrounds, one count-1 font), pushed through the direct generate path
  // (the CLI refuses this capture; the forced/direct document is what still
  // carried confident Components + Do/Don't rules in codex's replay).
  // Typography/Layout/Elevation/Shapes already carry low-confidence tags; the
  // remaining two sections must be tagged too, or omitted entirely.
  const md = generate(analyze(rawSkeleton({
    colors: {
      background: { "rgb(255, 255, 255)": 1, "rgb(240, 240, 240)": 1 },
      text: {},
      border: {},
    },
    fonts: { Inter: 1 },
    fontsByRole: { heading: {}, body: { Inter: 1 }, button: {}, display: {} },
    fontSizes: { "16px": 1 },
    fontWeights: { "400": 1 },
    bodyTextLength: 0,
    title: "Thin",
    url: "https://thin.test/",
  })));

  const LOW_CONF_RE = /low[ -]?confidence/i;
  const components = bodySection(md, "Components");
  if (components !== null) {
    assert.match(
      components,
      LOW_CONF_RE,
      "a Components section built from sparse evidence must carry a low-confidence qualifier"
    );
  }
  const dosDonts = bodySection(md, "Do's and Don'ts");
  if (dosDonts !== null) {
    assert.match(
      dosDonts,
      LOW_CONF_RE,
      "Do's and Don'ts rules from sparse evidence must carry a low-confidence qualifier"
    );
  }
});
