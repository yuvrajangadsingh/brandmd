// Render the dev.to cover (1000x420) for the cognition teardown article
import { chromium } from "playwright";
import path from "path";
import os from "os";

const htmlPath = "file://" + path.join(os.homedir(), "Sites/projects/personal/brandmd/docs/cover-cognition.html");
const outPath = path.join(os.homedir(), "Desktop/cover-cognition-1000x420.png");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1000, height: 420 }, deviceScaleFactor: 2 });
  await page.goto(htmlPath, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  await page.screenshot({ path: outPath, type: "png", clip: { x: 0, y: 0, width: 1000, height: 420 } });
  console.log(`Wrote ${outPath}`);
  await browser.close();
})();
