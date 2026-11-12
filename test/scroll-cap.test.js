// scrollPass runs inside the page. One page per cap: a very tall one for the
// 50-screen cap, and one whose scroll handler stalls each step for the 15 s cap.
// Without the caps, the first scrolls for minutes and the second for a minute.
import { test } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";
import { scrollPass } from "../src/extract.js";

test("scrollPass stops at 50 screens and starts no new screen after 15 s", { timeout: 120000 }, async (t) => {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch (err) {
    if (process.env.BRANDMD_REQUIRE_BROWSER) throw err;
    t.skip(`chromium not available: ${err.message.split("\n")[0]}`);
    return;
  }
  t.after(() => browser.close()); // runs even when the test times out mid-evaluate
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  await page.setContent('<div style="height:2000000px"></div>');
  await page.evaluate(() => {
    window.seen = new Set();
    addEventListener("scroll", () => window.seen.add(scrollY));
  });
  await page.evaluate(scrollPass);
  // At most 50; fewer only if a loaded machine hits the 15 s cap first.
  const screens = await page.evaluate(() => Math.max(...window.seen) / innerHeight + 1);
  assert.ok(screens >= 2 && screens <= 50, `scrolled ${screens} screens`);

  await page.setContent('<div style="height:2000000px"></div>');
  await page.evaluate(() => addEventListener("scroll", () => {
    const until = Date.now() + 1000;
    while (Date.now() < until);
  }));
  const start = Date.now();
  await page.evaluate(scrollPass);
  const seconds = (Date.now() - start) / 1000;
  assert.ok(seconds < 25, `a stalling page scrolled for ${seconds}s`);
});
