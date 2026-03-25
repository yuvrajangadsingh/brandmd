import { chromium } from "playwright";

/**
 * Launch browser, navigate to URL, extract all computed styles from visible elements.
 * Returns raw tokens: colors, fonts, spacing, radii, shadows.
 */
export async function extractFromUrl(url) {
  const browser = await chromium.launch({ headless: true });
  try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });

  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

  // Wait for rendering to settle
  await page.waitForTimeout(2000);

  // Dismiss cookie banners and overlays
  await page.evaluate(() => {
    const bannerSelectors = [
      '[class*="cookie"]', '[id*="cookie"]',
      '[class*="consent"]', '[id*="consent"]',
      '[class*="gdpr"]', '[id*="gdpr"]',
      '[class*="banner"]', '[id*="onetrust"]',
      '[class*="cc-"]', '[id*="cc-"]',
    ];
    for (const sel of bannerSelectors) {
      for (const el of document.querySelectorAll(sel)) {
        const style = getComputedStyle(el);
        if (style.position === "fixed" || style.position === "sticky") {
          el.remove();
        }
      }
    }
    // Remove any full-screen overlays
    for (const el of document.querySelectorAll('[class*="overlay"], [class*="modal"]')) {
      const style = getComputedStyle(el);
      if (style.position === "fixed" && parseFloat(style.zIndex) > 100) {
        el.remove();
      }
    }
  });

  // Scroll to bottom and back to trigger lazy-loaded content
  await page.evaluate(async () => {
    const delay = (ms) => new Promise((r) => setTimeout(r, ms));
    const step = window.innerHeight;
    const max = document.body.scrollHeight;
    for (let y = 0; y < max; y += step) {
      window.scrollTo(0, y);
      await delay(200);
    }
    window.scrollTo(0, 0);
    await delay(500);
  });

  const raw = await page.evaluate(() => {
    const colors = { background: {}, text: {}, border: {} };
    const fonts = {};
    const fontSizes = {};
    const fontWeights = {};
    const spacings = {};
    const radii = {};
    const shadows = {};

    const elements = document.querySelectorAll("html, body, body *");

    for (const el of elements) {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;

      const style = getComputedStyle(el);

      // Colors
      const bg = style.backgroundColor;
      if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
        colors.background[bg] = (colors.background[bg] || 0) + 1;
      }

      const color = style.color;
      if (color) {
        colors.text[color] = (colors.text[color] || 0) + 1;
      }

      const borderColor = style.borderColor;
      if (
        borderColor &&
        borderColor !== "rgba(0, 0, 0, 0)" &&
        borderColor !== style.color
      ) {
        colors.border[borderColor] = (colors.border[borderColor] || 0) + 1;
      }

      // Typography
      const fontFamily = style.fontFamily;
      if (fontFamily) {
        const clean = fontFamily.split(",")[0].replace(/['"]/g, "").trim();
        fonts[clean] = (fonts[clean] || 0) + 1;
      }

      const fontSize = style.fontSize;
      if (fontSize) {
        fontSizes[fontSize] = (fontSizes[fontSize] || 0) + 1;
      }

      const fontWeight = style.fontWeight;
      if (fontWeight) {
        fontWeights[fontWeight] = (fontWeights[fontWeight] || 0) + 1;
      }

      // Spacing (margin + padding)
      for (const prop of [
        "marginTop",
        "marginRight",
        "marginBottom",
        "marginLeft",
        "paddingTop",
        "paddingRight",
        "paddingBottom",
        "paddingLeft",
        "gap",
      ]) {
        const val = style[prop];
        if (val && val !== "0px" && val !== "auto" && val !== "normal") {
          spacings[val] = (spacings[val] || 0) + 1;
        }
      }

      // Border radius
      const br = style.borderRadius;
      if (br && br !== "0px") {
        radii[br] = (radii[br] || 0) + 1;
      }

      // Box shadow
      const shadow = style.boxShadow;
      if (shadow && shadow !== "none") {
        shadows[shadow] = (shadows[shadow] || 0) + 1;
      }
    }

    return {
      colors,
      fonts,
      fontSizes,
      fontWeights,
      spacings,
      radii,
      shadows,
    };
  });

  const title = await page.title();

  return { ...raw, title, url };
  } finally {
    await browser.close();
  }
}
