import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseDesign } from "../src/parse-design.js";
import { compareDesigns, exitCodeFor, formatDrift, EXIT_DRIFT } from "../src/check.js";

const spec = parseDesign(readFileSync("examples/stripe.md", "utf8"));

/** Deep-ish clone so mutating a fixture cannot leak between tests. */
const clone = (o) => JSON.parse(JSON.stringify(o));

test("a page identical to the spec reports no drift", () => {
  const r = compareDesigns(spec, clone(spec));
  assert.equal(r.drifts.length, 0);
  assert.equal(exitCodeFor(r), 0);
  assert.match(formatDrift(r), /No drift/);
});

test("primary font change is major and fails the build", () => {
  const live = clone(spec);
  live.typography.primaryFont = "Comic Sans MS";
  const r = compareDesigns(spec, live);
  const d = r.drifts.find((x) => x.field === "primaryFont");
  assert.ok(d, "expected a primaryFont drift");
  assert.equal(d.severity, "major");
  assert.equal(exitCodeFor(r), EXIT_DRIFT);
});

test("a role missing from the page is major", () => {
  const live = clone(spec);
  live.colors = live.colors.filter((c) => c.role !== "primary");
  const r = compareDesigns(spec, live);
  const d = r.drifts.find((x) => x.kind === "color" && x.role === "primary");
  assert.ok(d, "expected drift for the removed primary role");
  assert.equal(d.severity, "major");
  assert.equal(exitCodeFor(r), EXIT_DRIFT);
});

/**
 * The regression this suite exists for: #FFFFFF fills background, on-primary
 * and on-secondary in the stripe fixture. Repainting one of those roles must
 * still be caught even though the hex survives elsewhere in the palette.
 */
test("repainting a role is caught even when its hex is reused elsewhere", () => {
  const live = clone(spec);
  const dupHex = "#FFFFFF";
  const shared = live.colors.filter((c) => c.hex.toUpperCase() === dupHex);
  assert.ok(shared.length > 1, "fixture should have a hex used by several roles");
  const target = live.colors.find((c) => c.role === "on-primary");
  target.hex = "#101010";
  const r = compareDesigns(spec, live);
  const d = r.drifts.find((x) => x.kind === "color" && x.role === "on-primary");
  assert.ok(d, "a set-of-hexes comparison would miss this");
  assert.equal(d.severity, "major");
  assert.equal(d.current, "#101010");
});

test("a new role on the page is minor and does not fail by default", () => {
  const live = clone(spec);
  live.colors.push({ name: "hot pink", hex: "#FF00FF", role: "tertiary" });
  const r = compareDesigns(spec, live);
  const d = r.drifts.find((x) => x.role === "tertiary");
  assert.ok(d);
  assert.equal(d.severity, "minor");
  assert.equal(exitCodeFor(r), 0, "new roles alone should not fail CI");
  assert.equal(exitCodeFor(r, "any"), EXIT_DRIFT, "--fail-on any should catch it");
});

test("hex comparison is case-insensitive", () => {
  const live = clone(spec);
  live.colors = live.colors.map((c) => ({ ...c, hex: c.hex.toLowerCase() }));
  const r = compareDesigns(spec, live);
  assert.equal(
    r.drifts.filter((d) => d.kind === "color").length,
    0,
    "#fff and #FFF are the same token"
  );
});

test("theme wording changes are reported but never fail alone", () => {
  const live = clone(spec);
  live.theme.mood = "playful and loud";
  const r = compareDesigns(spec, live);
  const d = r.drifts.find((x) => x.kind === "theme");
  assert.ok(d);
  assert.equal(d.severity, "minor");
  assert.equal(exitCodeFor(r), 0, "an interpretation change must not break a build");
});

test("--fail-on none never fails", () => {
  const live = clone(spec);
  live.typography.primaryFont = "Comic Sans MS";
  const r = compareDesigns(spec, live);
  assert.equal(exitCodeFor(r, "none"), 0);
});

test("majors sort above minors in the report", () => {
  const live = clone(spec);
  live.colors.push({ name: "x", hex: "#123456", role: "accent" });
  live.typography.primaryFont = "Comic Sans MS";
  const r = compareDesigns(spec, live);
  assert.equal(r.drifts[0].severity, "major");
  assert.ok(r.counts.major >= 1 && r.counts.minor >= 1);
});

test("an empty extraction does not silently pass", () => {
  const live = { colors: [], typography: {}, layout: {}, theme: {} };
  const r = compareDesigns(spec, live);
  assert.ok(r.counts.major > 0, "a blank page must not read as no drift");
  assert.equal(exitCodeFor(r), EXIT_DRIFT);
});
