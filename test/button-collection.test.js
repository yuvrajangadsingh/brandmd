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

test("a button the reader cannot see is not collected; one pinned to the viewport is", async (t) => {
  const buttons = await buttonsOf(t, '<body style="margin:0;background:#fff">'
    + '<button style="height:41px">Seen</button>'
    + '<button style="height:42px;opacity:0">Faded</button>'
    + '<div style="opacity:0"><button style="height:43px">In a faded group</button></div>'
    + '<button style="height:44px;visibility:hidden">Hidden</button>'
    + '<a href="#main" style="display:inline-block;height:45px;background:#5e6ad2;color:#fff">Skip to content</a>'
    + '<button style="height:46px;position:fixed;right:8px;bottom:8px;background:#212126;color:#fff">Buy now</button>'
    + '<button style="height:47px;position:absolute;left:-9999px">Offscreen</button>'
    + '<button style="height:57px;position:absolute;top:-9999px">Above</button>'
    + '<div style="height:0;overflow:hidden"><button style="height:48px;background:#f00;color:#fff">Collapsed</button></div>'
    + '<div style="height:20px;overflow:auto"><div style="height:60px"></div><button style="height:49px">Scrolled</button></div>'
    + '<div id="up" style="height:20px;overflow:auto"><button style="height:58px">Scrolled up</button><div style="height:2000px"></div></div>'
    + '<div id="left" style="width:50px;overflow:auto;white-space:nowrap"><button style="height:59px;width:40px">Back</button><span style="display:inline-block;width:3000px"></span></div>'
    + '<div id="panel" style="position:fixed;top:0;left:0;width:80px;height:40px;overflow:auto"><button style="height:61px">Panel</button><div style="height:2000px"></div></div>'
    + '<div style="height:30px;overflow:hidden"><div style="height:30px;overflow:auto"><div style="height:100px"></div><button style="height:62px">Below the fold</button></div></div>'
    + '<div style="width:60px;overflow:hidden"><div style="overflow-x:auto;white-space:nowrap"><span style="display:inline-block;width:100px"></span><button style="height:63px">Next slide</button></div></div>'
    + '<div style="height:30px;overflow:auto"><div style="height:0;overflow:hidden"><button style="height:64px">Folded</button></div></div>'
    + '<div style="width:30px;overflow-x:auto"><div style="width:0;overflow:hidden"><button style="height:65px">Folded aside</button></div></div>'
    + '<span style="font-size:0;overflow:auto"><button style="height:66px;font-size:16px">Gapless</button></span>'
    + '<script>document.getElementById("up").scrollTop = 1500; document.getElementById("left").scrollLeft = 2500; document.getElementById("panel").scrollTop = 1500;</script>'
    + '<div style="height:0;overflow:hidden"><button style="height:50px;position:fixed;left:8px;bottom:8px">Chat</button>'
    + '<button style="height:51px;position:absolute;left:200px;top:0">Popover</button>'
    + '<div style="display:contents;position:relative"><button style="height:53px;position:absolute;left:300px;top:0">Menu</button></div>'
    + '<div style="display:contents;position:fixed"><button style="height:56px">Wrapped</button></div></div>'
    + '<button style="height:52px;position:fixed;left:100vw;top:0">Off to the right</button>'
    + '<main id="main"><p>Body copy.</p></main></body>');
  if (!buttons) return;
  assert.deepEqual(heights(buttons), [41, 46, 49, 50, 51, 53, 58, 59, 61, 62, 63, 66]);
});

// A label in a styled child paints its own colour; the button's computed
// colour is not what a reader sees, and neither is hidden, transparent,
// icon-font or screen-reader text, however deep it sits.
test("each button records its tag, its label and the colour its label is painted in", async (t) => {
  const buttons = await buttonsOf(t, '<body style="margin:0;background:#fff">'
    + '<button style="height:40px;background:#212126;color:#000"><span style="visibility:hidden">Loading</span><span style="opacity:0">Saving</span>'
    + '<span class="sr">Opens a form</span><span class="sr"><span>Help</span></span><span style="color:#000;-webkit-text-fill-color:#fff">Go</span></button>'
    + '<input type="submit" role="button" value="Get started" style="height:38px"><input type="submit" role="button" style="height:39px">'
    + '<a href="/x" class="btn" style="display:inline-block;height:30px">  Read\n  <b>the</b> <b>docs</b> </a>'
    + '<button style="height:20px"><span style="display:contents;visibility:hidden">Back</span><span style="display:contents;color:#f00">Next</span></button>'
    + '<button style="height:35px"><span style="font-family:Material Symbols Outlined">chat</span>'
    + '<span style="display:inline-block;width:20px;overflow:hidden;white-space:nowrap;text-indent:30px">Close</span>'
    + '<span style="display:inline-block;width:20px;height:10px;font-size:0">Shut</span><span style="position:absolute;left:-9999px">Open chat</span><span style="position:absolute;left:600px">Tooltip</span>'
    + '<span style="position:absolute;width:1px;height:1px;white-space:nowrap;clip-path:inset(50%)"><b>Close menu</b></span>'
    + '<span style="display:inline-block;width:20px;text-indent:-9999px;overflow:hidden">Menu</span><i style="font-family:FontAwesome">\uf075</i> Help</button>'
    + '<button style="height:55px;width:120px"><span style="display:inline-block;width:0;white-space:nowrap">Zero width</span></button>'
    + '<div style="height:10px;overflow:hidden"><button style="height:50px"><span style="position:relative;top:20px">Below</span></button></div>'
    + '<button style="height:45px;background:#212126;color:#fff"><span style="color:transparent">Loading</span><span style="color:red;-webkit-text-fill-color:transparent">Wait</span>Submit</button>'
    + "</body>");
  if (!buttons) return;
  const [contents, link, icon, input, bare, button, submit, under, narrow] = [...buttons].sort((a, b) => parseFloat(a.height) - parseFloat(b.height));
  assert.equal(button.tag, "button");
  assert.equal(button.label, "Go");
  assert.equal(button.color, "rgb(255, 255, 255)");
  assert.equal(link.tag, "a");
  assert.equal(link.label, "Read the docs");
  assert.equal(input.label, "Get started");
  assert.equal(bare.label, "Submit");
  // display:contents has no box of its own; its text is still what the reader sees
  assert.equal(contents.label, "Next");
  assert.equal(contents.color, "rgb(255, 0, 0)");
  // an icon font's ligature or glyph draws an icon; text off the button, off the
  // page or out of a box that clips it, or set at font-size 0, is not seen; and
  // transparent text (by color or by text fill) draws nothing
  assert.equal(icon.label, "Help");
  assert.equal(submit.label, "Submit");
  assert.equal(submit.color, "rgb(255, 255, 255)");
  // a box above the button that hides its overflow hides the label under it
  assert.equal(under.label, "");
  // a box too narrow to hold its text still shows it when it does not clip
  assert.equal(narrow.label, "Zero width");
});

// HTML email is laid out in tables, so a sample email on a page (resend's demo)
// brings its own buttons; none of the 30 example sites has a real one in a table.
test("a control inside a table, an email sample or a data grid, is not collected", async (t) => {
  const buttons = await buttonsOf(t, '<body style="margin:0;background:#fff">'
    + '<a href="/a" style="display:inline-block;height:61px;background:#000;color:#fff">Get started</a>'
    + '<table><tr><td><a href="/b" style="display:inline-block;height:62px;background:#00a3ff;color:#fff">Get Started</a></td></tr></table>'
    + '<table><tr><td><button style="height:63px">Edit</button></td></tr></table>'
    + "</body>");
  if (!buttons) return;
  assert.deepEqual(heights(buttons), [61]);
});

// A page laid out in a table has nothing else to sample.
test("a page whose only controls sit in a table keeps them", async (t) => {
  const buttons = await buttonsOf(t, '<body style="margin:0;background:#fff"><table><tr>'
    + '<td><a href="/buy" style="display:inline-block;height:64px;background:#000;color:#fff">Buy now</a></td>'
    + '<td><button style="height:65px;background:transparent;border:1px solid #000">Edit</button></td>'
    + "</tr></table></body>");
  if (!buttons) return;
  assert.deepEqual(heights(buttons), [64, 65]);
});
