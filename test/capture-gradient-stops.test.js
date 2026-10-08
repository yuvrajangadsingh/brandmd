import { test } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";
import { extractFromUrls } from "../src/extract.js";

// The capture reads hex, rgb and hsl stops only. Stops it cannot read must
// still count, or a translucent two-stop overlay over an opaque oklch gradient
// looks complete downstream and the hidden base gets named as the CTA colour.
test("stopCount counts the stops the capture cannot read", async (t) => {
  try {
    const b = await chromium.launch({ headless: true });
    await b.close();
  } catch (err) {
    t.skip(`chromium not available: ${err.message.split("\n")[0]}`);
    return;
  }
  const html = '<button style="background-color:rgb(0,128,0);background-image:linear-gradient(rgba(255,255,255,0.02), rgba(0,0,0,0.02)), linear-gradient(oklch(0.6 0.2 30), oklch(0.5 0.2 260));height:40px;width:120px">Go</button>'
    + '<button style="background-color:rgb(0,128,0);background-image:linear-gradient(oklch(0.6 0.2 30), oklch(0.5 0.2 260));height:40px;width:120px">Go</button>';
  const { light } = await extractFromUrls([`data:text/html,${encodeURIComponent(html)}`]);
  const [btn, none] = light.components.buttons;
  assert.deepEqual(btn.gradient, ["rgba(255, 255, 255, 0.02)", "rgba(0, 0, 0, 0.02)"], "the readable stops");
  assert.equal(btn.stopCount, 4, "two readable stops plus two oklch stops");
  assert.equal(btn.bgFromGradient, false);
  // no readable stop at all: the gradient is still recorded, as an empty list with its raw image
  assert.deepEqual(none.gradient, []);
  assert.equal(none.stopCount, 2);
  assert.match(none.gradientRaw, /^linear-gradient\(oklch\(0\.6 0\.2 30\), oklch\(0\.5 0\.2 260\)\)$/);
  assert.equal(none.bgFromGradient, false);
});
