// One-off: render the v0.8 LinkedIn carousel slides to PNGs.
// Reads slides.html from ~/Desktop/linkedin-proof/brandmd-v08/, writes PNGs alongside.
import { chromium } from "playwright";
import path from "path";
import os from "os";

const carouselDir = path.join(os.homedir(), "Desktop/linkedin-proof/brandmd-v08");
const htmlPath = "file://" + path.join(carouselDir, "slides.html");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1080 } });
  await page.goto(htmlPath, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);

  const slides = await page.$$(".slide");
  console.log(`Rendering ${slides.length} slides...`);

  for (let i = 0; i < slides.length; i++) {
    const file = path.join(carouselDir, `slide-${String(i + 1).padStart(2, "0")}.png`);
    await slides[i].screenshot({ path: file, type: "png" });
    console.log(`  ${file}`);
  }

  await browser.close();
})();
