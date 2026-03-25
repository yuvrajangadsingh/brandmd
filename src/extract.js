import { chromium } from "playwright";

/**
 * Launch browser, navigate to URL, extract all computed styles from visible elements.
 * Returns raw tokens: colors, fonts, spacing, radii, shadows.
 */
export async function extractFromUrl(url, opts = {}) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });

  await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });

  // Wait a bit for lazy-loaded content
  await page.waitForTimeout(1500);

  const raw = await page.evaluate(() => {
    const colors = { background: {}, text: {}, border: {} };
    const fonts = {};
    const fontSizes = {};
    const fontWeights = {};
    const spacings = {};
    const radii = {};
    const shadows = {};
    const lineHeights = {};
    const letterSpacings = {};

    const elements = document.querySelectorAll("body *");

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

      const lineHeight = style.lineHeight;
      if (lineHeight && lineHeight !== "normal") {
        lineHeights[lineHeight] = (lineHeights[lineHeight] || 0) + 1;
      }

      const ls = style.letterSpacing;
      if (ls && ls !== "normal") {
        letterSpacings[ls] = (letterSpacings[ls] || 0) + 1;
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
      lineHeights,
      letterSpacings,
      spacings,
      radii,
      shadows,
    };
  });

  // Get page title and meta description
  const title = await page.title();
  const metaDesc = await page
    .locator('meta[name="description"]')
    .getAttribute("content")
    .catch(() => "");

  await browser.close();

  return { ...raw, title, metaDesc, url };
}
