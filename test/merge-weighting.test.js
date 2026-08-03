import { test } from "node:test";
import assert from "node:assert/strict";
import { analyze } from "../src/analyze.js";

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
