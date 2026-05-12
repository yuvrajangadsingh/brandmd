import { chromium } from "playwright";
import path from "path";

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1200, height: 628 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const file = path.resolve("/Users/yuvrajangadsingh/Desktop/linkedin-proof/brandmd-v07-visual.html");
await page.goto("file://" + file, { waitUntil: "networkidle" });
await page.waitForTimeout(500);
await page.screenshot({ path: "/Users/yuvrajangadsingh/Desktop/linkedin-proof/brandmd-v07-visual.png", fullPage: false });
console.log("saved /Users/yuvrajangadsingh/Desktop/linkedin-proof/brandmd-v07-visual.png");
await browser.close();
