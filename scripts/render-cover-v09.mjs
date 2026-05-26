// Render the dev.to wide cover (1000x420) for brandmd v0.9 from cover.html
import { chromium } from "playwright";
import path from "path";
import os from "os";

const coverDir = path.join(os.homedir(), "Desktop/linkedin-proof/brandmd-v09");
const htmlPath = "file://" + path.join(coverDir, "cover.html");
const outPath = path.join(coverDir, "cover-1000x420.png");

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1000, height: 420 }, deviceScaleFactor: 2 });
await page.goto(htmlPath, { waitUntil: "networkidle" });
await page.waitForTimeout(800);
const el = await page.$(".cover");
await el.screenshot({ path: outPath, type: "png" });
console.log(`Wrote ${outPath}`);
await browser.close();
