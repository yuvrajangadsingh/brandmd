// probePageBackground runs inside the page; these layouts pin what it reads.
// Expected values are what Chromium serializes for computed colours and, for
// oklch(), lab() and color(), the sRGB pixel its canvas paints, composited by the probe.
// Skips when no Chromium is installed (CI installs none); runs where `npx
// playwright install chromium` has been done.
import { test } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";
import { probePageBackground } from "../src/extract.js";

const layouts = [
  {
    name: "fixed header over a scrolling wrapper: the wrapper is the surface",
    html: '<body style="margin:0;background:#fff"><header style="position:fixed;top:0;height:60px;width:100%;background:#000"></header><main style="min-height:100vh;background:#111"></main></body>',
    expect: { surface: "rgb(17, 17, 17)", canvas: "rgb(255, 255, 255)" },
  },
  {
    name: "full-viewport hero over a white body: the hero is the surface, the body the canvas",
    html: '<body style="margin:0;background:#fff"><section style="height:100vh;background:#000"></section><section style="height:100vh;background:#fff"></section></body>',
    expect: { surface: "rgb(0, 0, 0)", canvas: "rgb(255, 255, 255)" },
  },
  {
    name: "transparent body with a painted app shell: the shell is the surface, no canvas",
    html: '<body style="margin:0"><div id="root" style="min-height:100vh;background:#222"></div></body>',
    expect: { surface: "rgb(34, 34, 34)", canvas: null },
  },
  {
    name: "a background-image hero leaves the surface unresolved",
    html: '<body style="margin:0;background:#fff"><section style="height:100vh;background-image:linear-gradient(red, blue)"></section></body>',
    expect: { surface: null, canvas: "rgb(255, 255, 255)" },
  },
  {
    name: "an offscreen strip does not count as covering",
    html: '<body style="margin:0;background:#fff"><div style="width:400vw;height:20vh;background:#f00"></div></body>',
    expect: { surface: null, canvas: "rgb(255, 255, 255)" },
  },
  {
    name: "a translucent cover is composited over what it covers",
    html: '<body style="margin:0;background:#fff"><div style="min-height:100vh;background:rgba(0,0,0,0.3)"></div></body>',
    expect: { surface: "rgb(179, 179, 179)", canvas: "rgb(255, 255, 255)" },
  },
  {
    name: "a cover under an opacity-0 ancestor is invisible",
    html: '<body style="margin:0;background:#fff"><div style="opacity:0"><div style="min-height:100vh;background:#f00"></div></div></body>',
    expect: { surface: null, canvas: "rgb(255, 255, 255)" },
  },
  {
    name: "a cover in a modern colour syntax is read through the canvas",
    html: '<body style="margin:0;background:#fff"><div style="min-height:100vh;background:#000"><div style="min-height:100vh;background:oklch(0.7 0.1 200)"></div></div></body>',
    expect: { surface: "rgb(64, 177, 183)", canvas: "rgb(255, 255, 255)" },
  },
  {
    name: "a translucent cover over an unknown surface stays unknown",
    html: '<body style="margin:0;background:#fff"><div style="min-height:100vh;background-image:linear-gradient(red, blue)"><div style="min-height:100vh;background:rgba(0,0,0,0.3)"></div></div></body>',
    expect: { surface: null, canvas: "rgb(255, 255, 255)" },
  },
  {
    name: "a cover inside an opacity group is unknown",
    html: '<body style="margin:0;background:#fff"><div style="min-height:100vh;background:#000;opacity:0.3"></div></body>',
    expect: { surface: null, canvas: "rgb(255, 255, 255)" },
  },
  {
    name: "an opaque child inside an opacity group is unknown too",
    html: '<body style="margin:0;background:#fff"><div style="min-height:100vh;background:#000;opacity:0.5"><div style="min-height:100vh;background:#fff"></div></div></body>',
    expect: { surface: null, canvas: "rgb(255, 255, 255)" },
  },
  {
    name: "a translucent body composites over the white backing once, as the canvas",
    html: '<body style="margin:0;min-height:100vh;background:rgba(0,0,0,0.3)"></body>',
    expect: { surface: null, canvas: "rgb(179, 179, 179)" },
  },
  {
    name: "html in a modern colour syntax gives the canvas",
    html: '<head><style>html{background:oklch(0.7 0.1 200)}</style></head><body style="margin:0;height:100px;background:#000"></body>',
    expect: { surface: null, canvas: "rgb(64, 177, 183)" },
  },
  {
    name: "html opacity applies to the canvas too",
    html: '<head><style>html{opacity:0}</style></head><body style="margin:0;min-height:100vh;background:#000"></body>',
    expect: { surface: null, canvas: "rgb(255, 255, 255)" },
  },
  {
    name: "a propagated body image leaves the canvas unknown",
    html: '<body style="margin:0;height:100px;background:#fff linear-gradient(red, blue)"></body>',
    expect: { surface: null, canvas: null },
  },
  {
    name: "html paints the canvas; a short body does not propagate",
    html: '<head><style>html{background:#fff}</style></head><body style="margin:0;height:100px;background:#000"></body>',
    expect: { surface: null, canvas: "rgb(255, 255, 255)" },
  },
  {
    name: "content inside a fixed overlay is skipped",
    html: '<body style="margin:0;background:#fff"><div style="position:fixed;inset:0"><div style="height:100vh;background:#f00"></div></div></body>',
    expect: { surface: null, canvas: "rgb(255, 255, 255)" },
  },
  {
    name: "a visible child inside a hidden ancestor counts",
    html: '<body style="margin:0;background:#fff"><div style="visibility:hidden"><div style="min-height:100vh;background:#f00;visibility:visible"></div></div></body>',
    expect: { surface: "rgb(255, 0, 0)", canvas: "rgb(255, 255, 255)" },
  },
  {
    name: "a translucent modern cover composites with its exact alpha, like rgba()",
    html: '<body style="margin:0;background:#fff"><div style="min-height:100vh;background:oklch(0 0 0 / 0.3)"></div></body>',
    expect: { surface: "rgb(179, 179, 179)", canvas: "rgb(255, 255, 255)" },
  },
  {
    name: "the canvas is cleared between reads: opaque, then translucent, then alpha 0",
    html: '<body style="margin:0;background:#fff"><div style="min-height:100vh;background:oklch(0.2 0.02 250)"><div style="min-height:100vh;background:oklch(0 0 0 / 0.3)"><div style="min-height:100vh;background:oklch(0 0 0 / 0)"></div></div></div></body>',
    expect: { surface: "rgb(11, 16, 22)", canvas: "rgb(255, 255, 255)" },
  },
  {
    name: "a nearly transparent modern html background still paints, so the body does not propagate",
    html: '<head><style>html{background:oklch(0 0 0 / 0.001)}</style></head><body style="margin:0;height:100px;background:#000"></body>',
    expect: { surface: null, canvas: "rgb(255, 255, 255)" },
  },
  {
    name: "an alpha Chromium serialises in exponent notation still paints",
    html: '<head><style>html{background:oklch(0 0 0 / 1e-7)}</style></head><body style="margin:0;height:100px;background:#000"></body>',
    expect: { surface: null, canvas: "rgb(255, 255, 255)" },
  },
  {
    name: "an alpha of none paints nothing, so the body propagates",
    html: '<head><style>html{background:oklch(0 0 0 / none)}</style></head><body style="margin:0;height:100px;background:#222"></body>',
    expect: { surface: null, canvas: "rgb(34, 34, 34)" },
  },
  {
    name: "a transparent modern html background lets the body propagate",
    html: '<head><style>html{background:oklch(0 0 0 / 0)}</style></head><body style="margin:0;height:100px;background:oklch(0.7 0.1 200)"></body>',
    expect: { surface: null, canvas: "rgb(64, 177, 183)" },
  },
  {
    name: "a translucent modern cover over an image stays unknown until an opaque modern cover",
    html: '<body style="margin:0;background:#fff"><div style="min-height:100vh;background-image:linear-gradient(red, blue)"><div style="min-height:100vh;background:oklch(0 0 0 / 0.3)"><div style="min-height:100vh;background:lab(50 20 -30)"></div></div></div></body>',
    expect: { surface: "rgb(133, 108, 170)", canvas: "rgb(255, 255, 255)" },
  },
  {
    name: "color-mix and relative colours compute to color(srgb ...) and read through",
    html: '<body style="margin:0;background:#fff"><div style="min-height:100vh;background:color-mix(in srgb, red, blue)"><div style="min-height:100vh;background:rgb(from #ff0000 r g b / 0.5)"></div></div></body>',
    expect: { surface: "rgb(192, 0, 64)", canvas: "rgb(255, 255, 255)" },
  },
  {
    name: "display-p3 is clamped to sRGB: a midtone converts, pure red clips",
    html: '<body style="margin:0;background:color(display-p3 1 0 0)"><div style="min-height:100vh;background:color(display-p3 0.5 0.6 0.7)"></div></body>',
    expect: { surface: "rgb(121, 154, 181)", canvas: "rgb(255, 0, 0)" },
  },
  {
    name: "a canvas that returns no context leaves modern colours unknown and rgb() readable",
    html: '<head><script>HTMLCanvasElement.prototype.getContext = () => null</script></head><body style="margin:0;background:#fff"><div style="min-height:100vh;background:oklch(0.7 0.1 200)"></div></body>',
    expect: { surface: null, canvas: "rgb(255, 255, 255)" },
  },
  {
    name: "a canvas that throws leaves modern colours unknown and rgb() readable",
    html: '<head><script>HTMLCanvasElement.prototype.getContext = () => { throw new Error("no canvas") }</script></head><body style="margin:0;background:#fff"><div style="min-height:100vh;background:oklch(0.7 0.1 200)"></div></body>',
    expect: { surface: null, canvas: "rgb(255, 255, 255)" },
  },
];

test("probePageBackground reads the surface the viewport shows", async (t) => {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch (err) {
    t.skip(`chromium not available: ${err.message.split("\n")[0]}`);
    return;
  }
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
    for (const { name, html, expect } of layouts) {
      await page.setContent(`<!doctype html><html>${html}</html>`);
      assert.deepEqual(await page.evaluate(probePageBackground), expect, name);
    }
  } finally {
    await browser.close();
  }
});
