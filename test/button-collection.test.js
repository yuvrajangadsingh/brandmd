import { test } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";
import { extractFromUrls } from "../src/extract.js";

// What the capture counts as a button. Each element has its own height, so a
// list of heights says which ones were kept.
async function buttonsOf(t, html) {
  try {
    const b = await chromium.launch({ headless: true });
    await b.close();
  } catch (err) {
    if (process.env.BRANDMD_REQUIRE_BROWSER) throw err;
    t.skip(`chromium not available: ${err.message.split("\n")[0]}`);
    return null;
  }
  const page = `<style>*{box-sizing:border-box}.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)}</style>${html}`;
  const { light } = await extractFromUrls([`data:text/html,${encodeURIComponent(page)}`]);
  return light.components.buttons;
}
const heights = (buttons) => buttons.map((b) => parseFloat(b.height)).sort((a, b) => a - b);

// Linear's "Sign up" is an <a> with no btn class; the old selector took only
// links classed btn or button, in lower case.
test("a link painted like a button counts, in any class case; a text link and a promo bar do not", async (t) => {
  const buttons = await buttonsOf(t, '<body style="margin:0;background:#fff">'
    + '<a href="/a" class="Button_root" style="display:inline-block;height:31px">One</a>'
    + '<a href="/b" style="display:inline-block;height:32px;padding:0 12px;border-radius:999px;background:#e5e5e6">Sign up</a>'
    + '<a href="/c" style="display:inline-block;height:33px;border:1px solid #333">Contact sales</a>'
    + '<a href="/d" style="display:inline-block;height:34px">Docs</a>'
    + '<a href="/e" style="display:block;height:35px;background:#131316;color:#fff">Configure the whole platform with your agent today</a>'
    + '<a href="/f" style="display:block;height:36px;background:#131316;color:#fff">Read more</a>'
    + '<a href="/g" style="display:inline-block;width:300px;height:37px;background:#e5e5e6">Configure the whole platform with your agent today</a>'
    + '<a href="/h" style="display:inline-block;height:38px;border:1px solid transparent">Pricing</a>'
    + '<a href="/i" style="display:inline-block;height:39px;background:rgba(255,255,255,0)">Blog</a>'
    + '<a href="/j" style="display:inline-block;width:40px;height:40px;background:#e5e5e6"><span class="sr">Search</span></a>'
    + '<a href="/k" style="display:inline-block;height:50px;background:#000;color:#fff">Start</a>'
    + '<a href="/l" style="display:inline-block;height:51px;border:1px solid #000">Talk to us</a>'
    + '<a href="/m" style="display:inline-block;height:52px;background-image:linear-gradient(transparent, transparent)">Changelog</a>'
    + '<a href="/n" style="display:inline-block;height:53px;background-image:linear-gradient(oklch(0.6 0.2 260), oklch(0.7 0.2 300))">Get started</a>'
    + '<a href="/q" style="display:inline-block;height:56px;border-bottom:1px solid #333">Changelog</a>'
    + '<a href="/p" style="display:inline-block;height:55px;background-image:linear-gradient(oklch(0.6 0.2 260 / 0), oklch(0.7 0.2 300 / 0))">Roadmap</a>'
    + `<a href="/o" style="display:inline-block;height:54px;background:#e5e5e6">${[..."Start your free trial"].map((c) => (c === " " ? " " : `<span>${c}</span>`)).join("")}</a>`
    + "</body>");
  if (!buttons) return;
  assert.deepEqual(heights(buttons), [31, 32, 33, 50, 51, 53, 54],
    "a black fill or border paints, and so does a gradient whose stops cannot be read and a label set one span per letter; a wide bar, a long label, a clear border, fill or gradient (in any colour space), a border-bottom underline, and a label only a screen reader gets do not");
});
