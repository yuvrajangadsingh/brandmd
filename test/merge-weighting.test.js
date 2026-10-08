import { test } from "node:test";
import assert from "node:assert/strict";
import { analyze } from "../src/analyze.js";
import { mergeRaw } from "../src/extract.js";
import { generate } from "../src/generate.js";

/**
 * A long page must not decide the brand's ghost button by sheer volume.
 *
 * Every frequency map in mergeRaw is normalized count/total per page, but
 * components were concatenated raw, so a docs page contributing 50 buttons
 * outvoted a homepage contributing 3. Components now carry _pageWeight
 * (1 / that page's component count) and the ghost picker sums weights.
 */
function raw(buttons) {
  return {
    colors: { background: { "#ffffff": 10 }, text: { "#000000": 10 }, border: {} },
    fonts: { Inter: 10 },
    fontsByRole: { heading: {}, body: {}, button: {}, display: {} },
    fontSizes: { "16px": 10 },
    fontWeights: { 400: 10 },
    lineHeights: {},
    letterSpacings: {},
    typeSamples: {},
    spacings: { "8px": 5 },
    radii: { "4px": 5 },
    shadows: {},
    cssVars: {},
    components: { buttons, cards: [], inputs: [] },
    title: "t",
    url: "https://example.com",
    bodyTextLength: 4000,
  };
}

const ghost = (color, radius, weight) => ({
  bg: "rgba(0, 0, 0, 0)",
  color,
  radius,
  ...(weight === undefined ? {} : { _pageWeight: weight }),
});

/**
 * Normalization gives every page exactly 1.0 of vote, spread across whatever
 * it contributed. So the thing it decides is "on how many pages does this
 * pattern appear", not "how many times does it appear anywhere" — which is
 * what you want from a *brand* pattern.
 */
test("a pattern used across pages beats one page repeating itself", () => {
  // home + pricing each use the same ghost (2 each -> 0.5 apiece -> 1.0/page).
  const home = Array.from({ length: 2 }, () => ghost("#111111", "8px", 1 / 2));
  const pricing = Array.from({ length: 2 }, () => ghost("#111111", "8px", 1 / 2));
  // docs repeats its own variant 20 times, but that is still one page -> 1.0.
  const docs = Array.from({ length: 20 }, () => ghost("#999999", "0px", 1 / 20));
  const out = analyze(raw([...docs, ...home, ...pricing]));
  assert.equal(
    out.components.ghostButton.color,
    "#111111",
    "2.0 (two pages) must beat 1.0 (one loud page)"
  );
});

test("raw occurrence counting would have picked the loud page", () => {
  // Guards the test itself: strip the weights and the old behaviour returns,
  // 24 occurrences beating 4.
  const home = Array.from({ length: 2 }, () => ghost("#111111", "8px"));
  const pricing = Array.from({ length: 2 }, () => ghost("#111111", "8px"));
  const docs = Array.from({ length: 20 }, () => ghost("#999999", "0px"));
  const out = analyze(raw([...docs, ...home, ...pricing]));
  assert.equal(out.components.ghostButton.color, "#999999");
});

test("single-page runs are unchanged (no weights present)", () => {
  const only = [ghost("#111111", "8px"), ghost("#111111", "8px"), ghost("#222222", "0px")];
  const out = analyze(raw(only));
  assert.equal(out.components.ghostButton.color, "#111111", "plain counting still applies");
});

test("shadow placeholders do not eat a page's share of the merge", () => {
  // Each page gets 1.0 to spread over its shadows. Counted before the
  // placeholders were dropped, 90 of them left this page's one real shadow 0.1.
  const pad = "rgba(0, 0, 0, 0) 0px 0px 0px 0px";
  const soft = "rgba(0, 0, 0, 0.1) 0px 1px 3px 0px";
  const deep = "rgba(0, 0, 0, 0.2) 0px 4px 8px 0px";
  const merged = mergeRaw([
    { ...raw([]), shadows: { [pad]: 90, [`${pad}, ${soft}`]: 10 } },
    { ...raw([]), shadows: { [deep]: 10 } },
  ]);
  assert.deepEqual(merged.shadows, { [soft]: 1, [deep]: 1 });
});

// --- A button candidate is a box a hand can hit: 16px to 100px tall. ---------
// The selector also matches a 2px "expand image" control (docs.replit.com) and
// 76x480 testimonial cards with role=button (supabase.com); both became the
// primary button, the first by document order, the second on HSL saturation.
const solid = (bg, height, color = "rgb(255, 255, 255)") => ({
  bg, color, radius: "8px", padding: "8px 16px 8px 16px", fontSize: "14px", fontWeight: "500",
  ...(height === undefined ? {} : { height }),
});

test("a 2px box never becomes the primary button (docs.replit.com)", () => {
  const out = analyze(raw([
    solid("rgba(255, 255, 255, 0.55)", "2px", "rgb(23, 23, 23)"),
    solid("rgba(255, 255, 255, 0.5)", "34px", "rgb(87, 81, 79)"),
  ]));
  assert.equal(out.components.buttons.height, "34px");
});

test("a 480px card with role=button never beats a 38px CTA (supabase.com)", () => {
  const out = analyze(raw([solid("rgb(0, 37, 51)", "480px", "rgb(3, 3, 3)"), solid("rgb(62, 207, 142)", "38px")]));
  assert.equal(out.components.buttons.height, "38px");
});

test("the gate is inclusive at 16px and 100px, and a missing height is kept", () => {
  for (const [h, kept] of [["15px", false], ["16px", true], ["100px", true], ["101px", false], [undefined, true]]) {
    const out = analyze(raw([solid("rgb(255, 0, 0)", h)]));
    assert.equal(out.components.buttons !== null, kept, `height ${h}`);
  }
});

test("when every candidate is rejected the DESIGN.md has no button at all", () => {
  const md = generate(analyze(raw([solid("rgb(255, 0, 0)", "2px"), { ...ghost("#111111", "8px"), height: "480px" }])));
  assert.doesNotMatch(md, /button-primary|button-secondary|### Buttons/);
});

test("a rejected box does not dilute its page's vote in the merge", () => {
  const card = { ...ghost("#999999", "0px"), height: "480px" };
  const merged = mergeRaw([
    raw([ghost("#111111", "8px")]),
    raw([ghost("#222222", "0px"), card, card, card]),
    raw([ghost("#222222", "0px"), card, card, card]),
  ]);
  assert.equal(analyze(merged).components.ghostButton.color, "#222222", "two pages must beat one");
});

// Chromium clamps calc(infinity * 1px), Tailwind v4's rounded-full, to
// 3.35544e+07px; clerk, huggingface, resend and vercel printed that as their
// button radius while the page-level radii list already said 9999px.
test("a clamped pill radius on a chosen component reads as 9999px", () => {
  const out = analyze(raw([{ ...solid("rgb(99, 91, 255)", "40px"), radius: "3.35544e+07px" }]));
  assert.equal(out.components.buttons.radius, "9999px");
  const md = generate(out);
  assert.match(md, /^- Corner radius: 9999px$/m);
  assert.doesNotMatch(md, /e\+0\d/);
});

test("pill ghosts spelt two ways group together", () => {
  // The 4px ghost comes first: on the raw strings every signature has one
  // vote and document order picks it.
  const out = analyze(raw([ghost("#111111", "4px"), ghost("#111111", "3.35544e+07px"), ghost("#111111", "9999px")]));
  assert.equal(out.components.ghostButton.radius, "9999px");
});

test("only a uniform px radius is clamped; compound, percent and small radii stay as observed", () => {
  const r = raw([{ ...solid("rgb(99, 91, 255)", "40px"), radius: "3.35544e+07px / 50%" }]);
  r.components.cards = [{ bg: "rgb(255, 255, 255)", radius: "9999px 9999px 0px 0px", padding: "16px 16px 16px 16px", shadow: "none" }];
  r.components.inputs = [{ bg: "rgb(255, 255, 255)", radius: "50%", padding: "8px 8px 8px 8px" }];
  const out = analyze(r);
  assert.equal(out.components.buttons.radius, "3.35544e+07px / 50%");
  assert.equal(out.components.cards.radius, "9999px 9999px 0px 0px");
  assert.equal(out.components.inputs.radius, "50%");
  assert.equal(analyze(raw([solid("rgb(99, 91, 255)", "40px")])).components.buttons.radius, "8px");
});
