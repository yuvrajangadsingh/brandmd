import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { analyze } from "../src/analyze.js";
import { generate } from "../src/generate.js";
import { generateCSS } from "../src/generate-css.js";
import { generateTailwind } from "../src/generate-tailwind.js";
import { detectBlockLikely } from "../src/extract.js";

const here = dirname(fileURLToPath(import.meta.url));
const rawVercel = JSON.parse(readFileSync(join(here, "fixtures/raw-vercel.json"), "utf-8"));

// --- Regression: analyze -> generate over a real captured extraction ---
// Locks in the token-quality fixes from v0.12 (scientific-notation radii,
// empty palette/fonts, unclustered scale) so they can't silently regress.

test("analyze produces a well-formed token object", () => {
  const t = analyze(rawVercel);
  assert.ok(t.palette.length > 0, "palette should not be empty");
  assert.ok(t.typography.primary && t.typography.primary.length > 0, "primary font present");
  assert.ok(Array.isArray(t.radii), "radii is a list");
  assert.ok(t.spacing.length > 0, "spacing scale present");
});

test("generated DESIGN.md has the canonical spec sections and clean values", () => {
  const md = generate(analyze(rawVercel));
  // v0.14 emits the official DESIGN.md section names, in canonical order.
  for (const name of ["Overview", "Colors", "Typography", "Layout", "Elevation & Depth", "Shapes", "Components", "Do's and Don'ts"]) {
    assert.match(md, new RegExp(`^## ${name.replace(/[.*+?^${}()|[\]\\&]/g, "\\$&")}\\s*$`, "m"), `section "${name}" present`);
  }
  // No scientific-notation numbers leaking into radii/spacing (the v0.12 bug)
  assert.doesNotMatch(md, /\d+e[+-]\d+/i, "no scientific-notation values in output");
  // Title rendered, not the hostname fallback
  assert.match(md, /# Design System: .*Vercel/);
});

// --- Motion (issue #6): detect-only, rendered when present, skipped when absent ---

test("motion line renders when an animation surface is present", () => {
  const md = generate(analyze(rawVercel));
  // vercel fixture has inlineRaf: true
  assert.match(md, /\*\*Motion:\*\*/, "motion line should render");
  assert.match(md, /requestAnimationFrame/);
});

test("motion section is omitted entirely when nothing is detected", () => {
  const noMotion = { ...rawVercel, motion: { canvas: false, webgl: false, lottie: false, inlineRaf: false } };
  const md = generate(analyze(noMotion));
  assert.doesNotMatch(md, /\*\*Motion:\*\*/, "no motion line when no surfaces");
});

test("webgl outranks plain canvas in the motion description", () => {
  const webglRaw = { ...rawVercel, motion: { canvas: true, webgl: true, lottie: false, inlineRaf: false } };
  const md = generate(analyze(webglRaw));
  assert.match(md, /WebGL/);
  assert.doesNotMatch(md, /canvas rendering/, "webgl label supersedes canvas label");
});

// --- Block detection (issue #7): pure heuristic ---

test("detectBlockLikely flags an Akamai-style access-denied page", () => {
  assert.equal(
    detectBlockLikely({ title: "Access Denied", httpStatus: 403, bodyTextLength: 90, colors: { background: { "#ffffff": 1 } }, fonts: { Arial: 1 } }),
    true
  );
});

test("detectBlockLikely does not flag a real, rich page", () => {
  const t = analyze(rawVercel);
  assert.equal(t.blockLikely, false, "real vercel extraction is not a block page");
  assert.equal(
    detectBlockLikely({ title: "Home | Stripe", httpStatus: 200, bodyTextLength: 8000, colors: { background: { "#fff": 1, "#f6f9fc": 1, "#0a2540": 1 } }, fonts: { "sohne-var": 1, Camphor: 1 } }),
    false
  );
});

test("detectBlockLikely does not flag a minimal-but-real landing page", () => {
  // one weak signal (bare-ish) must not be enough on its own
  assert.equal(
    detectBlockLikely({ title: "Welcome", httpStatus: 200, bodyTextLength: 350, colors: { background: { "#fff": 1, "#111": 1 } }, fonts: { Inter: 1 } }),
    false
  );
});

test("generated DESIGN.md shows a block warning when flagged", () => {
  const blocked = { ...rawVercel, blockLikely: true };
  const md = generate(analyze(blocked));
  assert.match(md, /Likely a block/, "block warning rendered");
});

// --- --css and --tailwind radius names ---
// Radii were named by position in the list, so on this capture --radius-sm was
// "0px 0px 0px 1px" and --radius-full was "9999px 6px 6px 9999px". They now take
// the same names as the DESIGN.md rounded tokens: uniform radii by size, full
// for a real pill.
test("--css and --tailwind name radii by size, like the rounded tokens", () => {
  const tokens = analyze(rawVercel);
  const want = ["--radius-sm: 2px", "--radius-md: 6px", "--radius-full: 9999px"];
  assert.deepEqual(generateTailwind(tokens).match(/--radius-[\w-]+: [^;]+/g), want);
  assert.deepEqual(generateCSS(tokens).match(/--radius-[\w-]+: [^;]+/g), want);
  const rounded = generate(tokens).match(/^rounded:\n((?:  .+\n)+)/m)[1];
  assert.equal(rounded, "  sm: 2px\n  md: 6px\n  full: 9999px\n");

  // DESIGN.md stops at six names. --css and --tailwind used to write every
  // radius, so they keep going rather than drop the two largest.
  tokens.radii = [2, 4, 6, 8, 12, 16, 24, 32].map((px) => ({ val: `${px}px`, freq: 1 }));
  const all = ["sm: 2px", "md: 4px", "lg: 6px", "xl: 8px", "2xl: 12px", "3xl: 16px", "4xl: 24px", "5xl: 32px"].map((r) => `--radius-${r}`);
  assert.deepEqual(generateTailwind(tokens).match(/--radius-[\w-]+: [^;]+/g), all);
  assert.deepEqual(generateCSS(tokens).match(/--radius-[\w-]+: [^;]+/g), all);
  assert.match(generate(tokens), /^  3xl: 16px\n(?!  [45]xl)/m);
});

// --- --tailwind spacing ---
// Tailwind v4 reads a --spacing-<n> key as the value behind p-<n>, m-<n> and
// gap-<n>. Numbering the observed values wrote --spacing-4: 6px on this
// capture, which turns p-4 into 6px.
test("--tailwind writes no --spacing-* key", () => {
  const css = generateTailwind(analyze(rawVercel));
  assert.doesNotMatch(css, /^\s*--spacing[\w-]*\s*:/m);
  assert.match(css, /Spacing observed: 2px, 3px, 4px, 6px, 8px, 12px, 20px, 24px\./);
});
