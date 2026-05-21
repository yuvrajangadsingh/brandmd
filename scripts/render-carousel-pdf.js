// One-off: render the slides.html into a single PDF for LinkedIn upload.
// LinkedIn wants 1080x1080 per slide; we set page size to match and print
// each .slide as one page.
import { chromium } from "playwright";
import path from "path";
import os from "os";

const carouselDir = path.join(os.homedir(), "Desktop/linkedin-proof/brandmd-v08");
const htmlPath = "file://" + path.join(carouselDir, "slides.html");
const pdfOut = path.join(carouselDir, "brandmd-v08-carousel.pdf");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1080 } });
  await page.goto(htmlPath, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);

  // page-break-after: always is already in CSS on .slide, so each slide
  // prints on its own page. Width/height = 1080px (1080/96 = 11.25in).
  await page.pdf({
    path: pdfOut,
    width: "1080px",
    height: "1080px",
    printBackground: true,
    margin: { top: 0, bottom: 0, left: 0, right: 0 },
  });

  await browser.close();
  console.log(`PDF written: ${pdfOut}`);
})();
