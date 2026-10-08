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
import { mergeRaw } from "../src/extract.js";
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

// --- The CTA guideline names the observed primary button -------------------
// pickPrimaryAccent ranks a link, accent or focus colour above the rendered
// button, so 21 of 29 examples told an agent to paint CTAs in a colour no
// button on the page used.
const ctaLine = (md) => md.match(/^- Do use (.*) for primary actions and CTAs$/m)?.[1] ?? null;
const accentRaw = (buttons) => rawSkeleton({
  colors: { background: { "rgb(255, 255, 255)": 1000, "rgb(99, 91, 255)": 50 }, text: { "rgb(17, 17, 17)": 500 }, border: {} },
  fonts: { Inter: 100 },
  fontsByRole: { heading: {}, body: { Inter: 100 }, button: {}, display: {} },
  components: { buttons, cards: [], inputs: [] },
});
const btn = (bg, extra = {}) => ({ bg, color: "rgb(255, 255, 255)", radius: "8px", padding: "8px 16px 8px 16px", fontSize: "14px", fontWeight: "500", height: "40px", ...extra });

test("the CTA guideline names the observed primary button, the accent only without one", () => {
  assert.equal(ctaLine(generate(analyze(accentRaw([btn("rgb(192, 133, 50)")])))), "`#c08532`", "chromatic button");
  assert.equal(ctaLine(generate(analyze(accentRaw([btn("rgb(17, 17, 17)")])))), "`#111111`", "neutral button");
  assert.equal(ctaLine(generate(analyze(accentRaw([btn("rgba(0, 0, 0, 0.5)")])))), "`#00000080`", "a translucent button keeps its alpha");
  assert.equal(ctaLine(generate(analyze(accentRaw([])))), "`#635bff`", "no button: the accent");
  assert.equal(ctaLine(generate(analyze(accentRaw([btn("rgb(255, 255, 255)")])))), "`#635bff`", "a button in the page's own colour is not action evidence");
  const g = ctaLine(generate(analyze(accentRaw([btn("rgb(255, 0, 0)", { gradient: ["#ff0000", "#0000ff"], gradientRaw: "linear-gradient(#ff0000, #0000ff)" })]))));
  assert.match(g, /button-primary.*gradient/, "gradient button: the treatment, not its first stop");
  assert.doesNotMatch(g, /#ff0000/);
  const one = ctaLine(generate(analyze(accentRaw([btn("rgb(255, 0, 0)", { gradient: ["#ff0000"], gradientRaw: "linear-gradient(#ff0000, oklch(0.5 0.2 260))" })]))));
  assert.match(one, /button-primary.*gradient/, "one readable stop is still a gradient");
});

// --- Type levels follow size --------------------------------------------------
// With no heading at 32px or more, the largest one was named headline-lg and the
// second largest then overwrote it, so the biggest size never reached the tokens.
// The second body size was always called body-lg, even when it was the smaller
// of the two.
test("type levels: the largest heading is kept and the names follow size", () => {
  const levels = (fontSizes) => {
    const md = generate(analyze(rawSkeleton({
      fonts: { Inter: 500 },
      fontsByRole: { heading: {}, body: { Inter: 480 }, button: {}, display: {} },
      fontSizes,
    })));
    return [...md.matchAll(/^  ([a-z-]+):\n    fontFamily: .*\n    fontSize: (\d+)px/gm)].map((m) => [m[1], Number(m[2])]);
  };
  assert.deepEqual(levels({ "28px": 5, "24px": 8, "16px": 50, "14px": 20, "12px": 9 }), [
    ["headline-lg", 28],
    ["headline-md", 24],
    ["body-md", 16],
    ["body-sm", 14],
    ["label-sm", 12],
  ]);
  // Two heading names for three sizes under 32px: the largest two get them.
  // (This used to export 28 and 24 and leave 30 out.)
  assert.deepEqual(levels({ "30px": 4, "28px": 5, "24px": 8, "16px": 50 }), [
    ["headline-lg", 30],
    ["headline-md", 28],
    ["body-md", 16],
  ]);
  assert.deepEqual(levels({ "40px": 3, "18px": 20, "16px": 50 }), [
    ["display", 40],
    ["body-lg", 18],
    ["body-md", 16],
  ]);
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

// --- Zero-alpha shadow layers -----------------------------------------------
// Tailwind pads box-shadow with ring and offset placeholders, so a computed
// value is mostly "rgba(0, 0, 0, 0) 0px 0px 0px 0px" layers that paint nothing.
// They are not part of the shadow: values that differ only in padding are one
// shadow, and a value with no painting layer is no shadow at all.
test("zero-alpha shadow layers are dropped and what is left is merged", () => {
  const pad = "rgba(0, 0, 0, 0) 0px 0px 0px 0px";
  const real = "rgba(0, 0, 0, 0.1) 0px 1px 3px 0px";
  const tokens = analyze(rawSkeleton({
    shadows: {
      [`${pad}, ${pad}, ${real}`]: 2,
      [`${pad}, ${real}`]: 3,
      [`${pad}, ${pad}`]: 9,
      "oklab(0.2 0 0 / 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.08) 0px 5px 15px 0px": 1,
    },
    components: {
      buttons: [],
      cards: [{ bg: "rgb(255, 255, 255)", radius: "8px", shadow: `${pad}, ${real}`, padding: "16px 16px 16px 16px" }],
      inputs: [],
    },
  }));
  assert.deepEqual(tokens.shadows, [
    { val: real, freq: 5 },
    { val: "rgba(0, 0, 0, 0.08) 0px 5px 15px 0px", freq: 1 },
  ]);
  assert.equal(tokens.components.cards.shadow, real);
  assert.doesNotMatch(generate(tokens), /rgba\(0, 0, 0, 0\) 0px/);

  // Only a fourth argument is an alpha: an opaque three-argument rgba() paints.
  const opaque = analyze(rawSkeleton({
    shadows: { "rgba(255, 0, 0) 0px 1px 2px, RGBA(0, 0, 0, 0%) 0px 0px 0px 0px, hsla(0, 0%, 0%, 0 ) 0px 0px 0px 0px": 2 },
  }));
  assert.deepEqual(opaque.shadows, [{ val: "rgba(255, 0, 0) 0px 1px 2px", freq: 2 }]);

  // A capture with nothing but placeholders has no shadows and no shadow evidence.
  const flat = analyze(rawSkeleton({
    shadows: { [`${pad}, ${pad}`]: 9, "rgb(0 0 0 / none) 0px 0px 0px 0px": 1, "transparent 0px 0px 0px 0px": 1 },
  }));
  assert.deepEqual(flat.shadows, []);
  assert.equal(flat.evidence.shadowObs, 0);
});

test("colours that paint nothing never reach the palette", () => {
  const tokens = analyze(rawSkeleton({
    colors: {
      background: { "rgb(0, 0, 0)": 100, "rgba(56, 189, 248, 0)": 400, "transparent": 30 },
      text: { "rgb(255, 255, 255)": 80 },
      border: { "rgba(19, 19, 22, 0)": 50, "rgb(38, 42, 45)": 10 },
    },
  }));
  assert.ok(!tokens.palette.some((c) => /^#[0-9a-f]{6}00$/i.test(c.hex)), "no zero-alpha entry in the palette");
  assert.notEqual(tokens.primaryColor?.hex, "#38bdf800");
  const md = generate(tokens);
  assert.doesNotMatch(md, /#[0-9a-f]{6}00\b/i);
  assert.match(md, /^  outline: "#262a2d"$/m);
  assert.doesNotMatch(md, /38bdf8/);
});

test("toHex keeps the alpha of a colour chroma cannot parse", () => {
  // Four-argument rgb() goes through the manual fallback; it used to come back opaque.
  const tokens = analyze(rawSkeleton({
    colors: { background: { "rgb(255, 255, 255)": 100 }, text: { "rgb(0, 0, 0)": 50 }, border: { "rgb(255, 0, 0, 0)": 80, "rgb(200, 200, 200)": 5 } },
  }));
  assert.ok(!tokens.palette.some((c) => c.hex.startsWith("#ff0000")), "an invisible red is not a border token");
  assert.match(generate(tokens), /^  outline: "#c8c8c8"$/m);
});
test("a translucent colour never absorbs the solid colour under it", () => {
  // Insertion order puts the 10% scrim first; deltaE ignores alpha and used to
  // fold the 100-use solid black into it, leaving no solid background at all.
  const tokens = analyze(rawSkeleton({
    colors: { background: { "rgba(0, 0, 0, 0.1)": 1, "rgb(0, 0, 0)": 100 }, text: { "rgb(255, 255, 255)": 50 }, border: {} },
  }));
  const black = tokens.palette.find((c) => c.hex === "#000000");
  assert.ok(black && black.freq >= 100, "the solid black keeps its own entry and frequency");
  assert.match(generate(tokens), /^  background: "#000000"$/m);
});

test("role tokens take solid colours only; translucent ones stay prose", () => {
  const tokens = analyze(rawSkeleton({
    colors: {
      background: { "rgb(0, 0, 0)": 100, "rgba(34, 255, 153, 0.12)": 400 },
      text: { "rgb(255, 255, 255)": 80 },
      // A tinted red, not black: a translucent black still absorbs a dark grey at
      // the cluster step (F-07, open), which is a different bug from this one.
      border: { "rgba(255, 0, 0, 0.2)": 50, "rgb(38, 42, 45)": 10 },
    },
  }));
  assert.notEqual(tokens.primaryColor?.hex, "#22ff991f", "a 12% scrim is not the accent");
  const md = generate(tokens);
  assert.match(md, /^  background: "#000000"$/m);
  assert.match(md, /^  outline: "#262a2d"$/m);
  assert.doesNotMatch(md, /^  (background|on-background|surface|on-surface-variant|primary|secondary): "#[0-9a-f]{6}[0-7][0-9a-f]"$/m, "no fill, text or accent token under 50% alpha");
  assert.match(md, /`#22ff991f`\): Overlay \/ scrim/, "the scrim is still reported as what it is");
  assert.match(md, /No explicit accent or action color was observed/);

  // A translucent divider is how most sites draw one; it stays the outline.
  const divider = generate(analyze(rawSkeleton({
    colors: { background: { "rgb(255, 255, 255)": 100 }, text: { "rgb(0, 0, 0)": 50 }, border: { "rgba(0, 0, 0, 0.1)": 40 } },
  })));
  assert.match(divider, /^  outline: "#0000001a"$/m);
});


test("the captured page background beats the lightest and the most frequent fill", () => {
  const colors = {
    background: { "rgb(255, 255, 255)": 26, "rgb(191, 219, 254)": 30, "rgb(0, 0, 0)": 20 },
    text: { "rgb(255, 255, 255)": 10 },
    border: {},
  };
  const dark = analyze(rawSkeleton({ colors, pageBackground: { surface: "rgb(0, 0, 0)", canvas: "rgb(255, 255, 255)" } }));
  assert.equal(dark.pageBackground, "#000000");
  const md = generate(dark);
  assert.match(md, /^  background: "#000000"$/m);
  assert.match(md, /\*\*Visual character:\*\* Dark.*black background dominates/);

  // No covering surface: the canvas is the page background, however many cards there are.
  const canvas = generate(analyze(rawSkeleton({
    colors: { background: { "rgb(30, 30, 30)": 40, "rgb(255, 255, 255)": 5 }, text: { "rgb(0, 0, 0)": 10 }, border: {} },
    pageBackground: { surface: null, canvas: "rgb(255, 255, 255)" },
  })));
  assert.match(canvas, /^  background: "#ffffff"$/m);

  // A surface that is not among the top fills is still the background, and the prose says so.
  const synth = generate(analyze(rawSkeleton({
    colors: { background: { "rgb(255, 255, 255)": 50 }, text: { "rgb(0, 0, 0)": 10 }, border: {} },
    pageBackground: { surface: "rgb(10, 20, 30)", canvas: null },
  })));
  assert.match(synth, /^  background: "#0a141e"$/m);
  assert.match(synth, /surface that fills the viewport/);

  // Nothing resolved: the old rule, and no note.
  const none = generate(analyze(rawSkeleton({ colors, pageBackground: { surface: null, canvas: null } })));
  const legacy = generate(analyze(rawSkeleton({ colors })));
  assert.equal(none, legacy);
  assert.equal("pageBackground" in analyze(rawSkeleton({ colors })), false, "captures without the field keep the legacy token shape");
});

test("dark mode overrides list the captured page background when it differs", () => {
  const colors = { background: { "rgb(255, 255, 255)": 50 }, text: { "rgb(0, 0, 0)": 10 }, border: {} };
  const light = analyze(rawSkeleton({ colors, pageBackground: { surface: "rgb(255, 255, 255)", canvas: null } }));
  light.dark = analyze(rawSkeleton({
    colors: { background: { "rgb(0, 0, 0)": 50 }, text: { "rgb(255, 255, 255)": 10 }, border: {} },
    pageBackground: { surface: "rgb(0, 0, 0)", canvas: null },
  }));
  const dark = light.dark.palette.find((c) => c.hex.toLowerCase() === "#000000");
  assert.ok(dark);
  dark.role = "Page background"; // the luminance guess must not add a second line
  const lines = generate(light).match(/^- Page background:.*$/gm);
  assert.deepEqual(lines, ["- Page background: `#ffffff` → `#000000`"]);
});

test("text roles come from contrast on the captured background, not luminance", () => {
  const t = analyze(rawSkeleton({
    colors: { background: { "rgb(0, 0, 0)": 50 }, text: { "rgb(0, 0, 0)": 100, "rgb(255, 255, 255)": 10 }, border: {} },
    pageBackground: { surface: "rgb(0, 0, 0)", canvas: null },
  }));
  assert.equal(t.textRoles.onBackground, "#ffffff");
  const md = generate(t);
  assert.match(md, /^  on-background: "#ffffff"$/m);
  assert.match(md, /white text/);
});

test("a text colour whose hex a fill already took still becomes on-background", () => {
  const t = analyze(rawSkeleton({
    colors: { background: { "rgb(0, 0, 0)": 50, "rgb(255, 255, 255)": 40 }, text: { "rgb(255, 255, 255)": 30 }, border: {} },
    pageBackground: { surface: "rgb(0, 0, 0)", canvas: null },
  }));
  assert.ok(!t.palette.some((c) => c.type === "text"), "the palette dedup dropped the white text");
  assert.match(generate(t), /^  on-background: "#ffffff"$/m);
});

test("alpha is composited before contrast; nothing readable omits on-background and says so", () => {
  const t = analyze(rawSkeleton({
    colors: { background: { "rgb(255, 255, 255)": 50 }, text: { "rgba(0, 0, 0, 0.5)": 100 }, border: {} },
    pageBackground: { surface: "rgb(255, 255, 255)", canvas: null },
  }));
  assert.equal(t.textRoles.onBackground, null);
  const md = generate(t);
  assert.doesNotMatch(md, /^  on-background:/m);
  assert.doesNotMatch(md, /^  on-surface-variant:/m);
  assert.match(md, /No text colour reads at 4\.5:1 on the page background `#ffffff`; the closest is `#00000080` at 4:1, so `on-background` is omitted/);
});

test("on-surface-variant must read on the background and on the surface", () => {
  const t = analyze(rawSkeleton({
    colors: {
      background: { "rgb(255, 255, 255)": 50, "rgb(170, 170, 170)": 20 },
      text: { "rgb(0, 0, 0)": 100, "rgb(118, 118, 118)": 50, "rgb(26, 26, 110)": 30 },
      border: {},
    },
    pageBackground: { surface: "rgb(255, 255, 255)", canvas: null },
  }));
  const md = generate(t);
  assert.match(md, /^  on-background: "#000000"$/m);
  assert.match(md, /^  surface: "#aaaaaa"$/m);
  assert.match(md, /^  on-surface-variant: "#1a1a6e"$/m, "#767676 reads on white (4.54:1) but not on the surface (1.96:1)");
});

test("the 4.5:1 gate uses the alpha byte the token carries, not chroma's rounded alpha", () => {
  // rgba(132,132,132,.88) on black emits #848484e0: 224/255 composites to 4.49:1, .88 to 4.50:1
  const t = analyze(rawSkeleton({
    colors: { background: { "rgb(0, 0, 0)": 50 }, text: { "rgba(132, 132, 132, 0.88)": 100 }, border: {} },
    pageBackground: { surface: "rgb(0, 0, 0)", canvas: null },
  }));
  assert.equal(t.textRoles.onBackground, null);
  assert.match(generate(t), /the closest is `#848484e0` at 4\.49:1/);
});

test("on-surface-variant distinctness is judged on the composited colours", () => {
  const white = analyze(rawSkeleton({
    colors: { background: { "rgb(255, 255, 255)": 50 }, text: { "rgba(0, 0, 0, 0.6)": 100, "rgb(102, 102, 102)": 50 }, border: {} },
    pageBackground: { surface: "rgb(255, 255, 255)", canvas: null },
  }));
  const w = generate(white);
  assert.match(w, /^  on-background: "#00000099"$/m);
  assert.doesNotMatch(w, /^  on-surface-variant:/m, "#666666 is the same grey as 60% black on white");
  const black = analyze(rawSkeleton({
    colors: { background: { "rgb(0, 0, 0)": 50 }, text: { "rgb(255, 255, 255)": 100, "rgba(255, 255, 255, 0.6)": 50 }, border: {} },
    pageBackground: { surface: "rgb(0, 0, 0)", canvas: null },
  }));
  assert.match(generate(black), /^  on-surface-variant: "#ffffff99"$/m, "60% white on black is a distinct grey");
});

test("on-background is emitted with the alpha byte the gate checked", async () => {
  // rgba(228,228,228,.514) on black is #e4e4e483 at 4.56:1; reparsed through chroma it comes out #e4e4e482 at 4.49:1
  const t = analyze(rawSkeleton({
    colors: { background: { "rgb(0, 0, 0)": 50 }, text: { "rgba(228, 228, 228, 0.514)": 100 }, border: {} },
    pageBackground: { surface: "rgb(0, 0, 0)", canvas: null },
  }));
  assert.match(generate(t), /^  on-background: "#e4e4e483"$/m);
  const { contrastOn } = await import("../src/analyze.js");
  assert.equal(contrastOn("#000a", "#999999"), contrastOn("#000000aa", "#999999"), "a 4-digit hex carries the same alpha byte");
});

test("the omission prose never rounds a rejected ratio up to 4.5:1", () => {
  const t = analyze(rawSkeleton({
    colors: { background: { "rgb(255, 255, 255)": 50 }, text: { "rgb(14, 135, 100)": 100 }, border: {} },
    pageBackground: { surface: "rgb(255, 255, 255)", canvas: null },
  }));
  assert.equal(t.textRoles.onBackground, null, "#0e8764 on white is 4.498:1");
  assert.match(generate(t), /the closest is `#0e8764` at 4\.49:1/);
});

test("a translucent primary still excludes itself from secondary", () => {
  // the palette byte (#ff000083) and a chroma reparse (#ff000082) must compare equal, or the primary displaces the blue
  const t = analyze(rawSkeleton({
    colors: { background: { "rgb(255, 255, 255)": 50, "rgba(255, 0, 0, 0.514)": 40, "rgb(0, 0, 255)": 20 }, text: { "rgb(0, 0, 0)": 100 }, border: {} },
    pageBackground: { surface: "rgb(255, 255, 255)", canvas: null },
  }));
  const md = generate(t);
  assert.match(md, /^  primary: "#ff000083"$/m);
  assert.match(md, /^  secondary: "#0000ff"$/m);
});

test("captures without a page background keep the luminance text roles", () => {
  // Black text on a near-black page: the luminance rule calls it Primary text and
  // the new rule would pick white. Without the field the old output stands.
  const colors = { background: { "rgb(20, 20, 20)": 50 }, text: { "rgb(0, 0, 0)": 100, "rgb(255, 255, 255)": 10 }, border: {} };
  const legacy = analyze(rawSkeleton({ colors }));
  assert.equal(legacy.textRoles, undefined);
  assert.match(generate(legacy), /^  on-background: "#000000"$/m);
  const captured = analyze(rawSkeleton({ colors, pageBackground: { surface: "rgb(20, 20, 20)", canvas: null } }));
  assert.match(generate(captured), /^  on-background: "#ffffff"$/m);
});

test("multi-page text evidence anchors to the page that gave the background", () => {
  const dark = rawSkeleton({
    colors: { background: { "rgb(0, 0, 0)": 50 }, text: { "rgb(255, 255, 255)": 10 }, border: {} },
    pageBackground: { surface: "rgb(0, 0, 0)", canvas: null },
  });
  const light = rawSkeleton({
    colors: { background: { "rgb(255, 255, 255)": 50 }, text: { "rgb(200, 200, 200)": 100 }, border: {} },
    pageBackground: { surface: "rgb(255, 255, 255)", canvas: null },
  });
  const merged = mergeRaw([dark, light]);
  assert.deepEqual(merged.textOnPage, { "rgb(255, 255, 255)": 10 });
  const md = generate(analyze(merged));
  assert.match(md, /^  background: "#000000"$/m);
  assert.match(md, /^  on-background: "#ffffff"$/m, "the light page's 100-use grey reads on black too, but it is not this page's text");
  assert.equal("textOnPage" in mergeRaw([dark]), false, "a single page carries no separate text evidence");

  // Nothing readable on the first page: the character line names its closest
  // candidate, not the other page's text the YAML omits.
  const unreadable = rawSkeleton({
    colors: { background: { "rgb(0, 0, 0)": 50 }, text: { "rgb(68, 0, 0)": 10 }, border: {} },
    pageBackground: { surface: "rgb(0, 0, 0)", canvas: null },
  });
  const md2 = generate(analyze(mergeRaw([unreadable, light])));
  assert.doesNotMatch(md2, /^  on-background:/m);
  assert.match(md2, /\*\*Visual character:\*\* Dark, soft contrast; black background dominates with dark red text/);
});

test("a one-use translucent black does not absorb a hundred-use black on its way to the gate", () => {
  const t = analyze(rawSkeleton({
    colors: { background: { "rgb(255, 255, 255)": 50 }, text: { "rgba(0, 0, 0, 0.5)": 1, "rgb(0, 0, 0)": 100 }, border: {} },
    pageBackground: { surface: "rgb(255, 255, 255)", canvas: null },
  }));
  assert.equal(t.textRoles.onBackground, "#000000");
});

test("equally frequent text candidates resolve the same whatever order the capture listed them", () => {
  const pick = (text) => analyze(rawSkeleton({
    colors: { background: { "rgb(255, 255, 255)": 50 }, text, border: {} },
    pageBackground: { surface: "rgb(255, 255, 255)", canvas: null },
  })).textRoles.onBackground;
  assert.equal(pick({ "rgb(153, 0, 0)": 10, "rgb(0, 0, 153)": 10 }), "#000099");
  assert.equal(pick({ "rgb(0, 0, 153)": 10, "rgb(153, 0, 0)": 10 }), "#000099");
});

test("an input takes on-background only where it reads on the input's own surface", () => {
  const md = generate(analyze(rawSkeleton({
    colors: { background: { "rgb(0, 0, 0)": 50, "rgb(102, 102, 102)": 10 }, text: { "rgb(17, 17, 17)": 100, "rgba(255, 255, 255, 0.5)": 50 }, border: {} },
    pageBackground: { surface: "rgb(0, 0, 0)", canvas: null },
    components: {
      buttons: [],
      cards: [{ bg: "rgb(102, 102, 102)", radius: "4px", padding: "16px 16px 16px 16px", shadow: "none" }],
      inputs: [{ bg: "rgb(102, 102, 102)", radius: "4px", padding: "8px 8px 8px 8px" }],
    },
  })));
  assert.match(md, /^  on-background: "#ffffff80"$/m);
  assert.match(md, /^  surface: "#666666"$/m);
  assert.match(md, /^  input:\n(?:    .*\n)*?    backgroundColor: "\{colors\.surface\}"$/m);
  assert.doesNotMatch(md, /textColor: "\{colors\.on-background\}"/, "50% white over #666666 over black is 2.7:1");
});

test("dark mode overrides list the resolved text pair, not the luminance guesses", () => {
  const colors = { background: { "rgb(255, 255, 255)": 50, "rgb(0, 0, 0)": 40 }, text: { "rgb(0, 0, 0)": 100, "rgb(255, 255, 255)": 60 }, border: {} };
  const light = analyze(rawSkeleton({ colors, pageBackground: { surface: "rgb(255, 255, 255)", canvas: null } }));
  light.dark = analyze(rawSkeleton({ colors, pageBackground: { surface: "rgb(0, 0, 0)", canvas: null } }));
  const md = generate(light);
  assert.match(md, /^- Text on background: `#000000` → `#ffffff`$/m);
  assert.doesNotMatch(md, /^- (Primary text|Light text \(on dark\)|Secondary text|Muted text):/m);
});
