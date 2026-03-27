import { chromium } from "playwright";

/**
 * Extract styles from a single page using a shared browser instance.
 */
async function extractPage(browser, url, colorScheme = "light") {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme,
  });

  try {
    const page = await context.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
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
      for (const el of document.querySelectorAll('[class*="overlay"], [class*="modal"]')) {
        const style = getComputedStyle(el);
        if (style.position === "fixed" && parseFloat(style.zIndex) > 100) {
          el.remove();
        }
      }
    });

    // Scroll to trigger lazy content
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

        const bg = style.backgroundColor;
        if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
          colors.background[bg] = (colors.background[bg] || 0) + 1;
        }

        const color = style.color;
        if (color) {
          colors.text[color] = (colors.text[color] || 0) + 1;
        }

        const borderColor = style.borderColor;
        if (borderColor && borderColor !== "rgba(0, 0, 0, 0)" && borderColor !== style.color) {
          colors.border[borderColor] = (colors.border[borderColor] || 0) + 1;
        }

        const fontFamily = style.fontFamily;
        if (fontFamily) {
          const clean = fontFamily.split(",")[0].replace(/['"]/g, "").trim();
          fonts[clean] = (fonts[clean] || 0) + 1;
        }

        const fontSize = style.fontSize;
        if (fontSize) fontSizes[fontSize] = (fontSizes[fontSize] || 0) + 1;

        const fontWeight = style.fontWeight;
        if (fontWeight) fontWeights[fontWeight] = (fontWeights[fontWeight] || 0) + 1;

        for (const prop of [
          "marginTop", "marginRight", "marginBottom", "marginLeft",
          "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "gap",
        ]) {
          const val = style[prop];
          if (val && val !== "0px" && val !== "auto" && val !== "normal") {
            spacings[val] = (spacings[val] || 0) + 1;
          }
        }

        const br = style.borderRadius;
        if (br && br !== "0px") radii[br] = (radii[br] || 0) + 1;

        const shadow = style.boxShadow;
        if (shadow && shadow !== "none") shadows[shadow] = (shadows[shadow] || 0) + 1;
      }

      const cssVars = {};
      function extractVarsFromRules(rules) {
        for (const rule of rules) {
          // Recurse into @media, @supports, @layer
          if (rule.cssRules) {
            extractVarsFromRules(rule.cssRules);
            continue;
          }
          const sel = (rule.selectorText || "").toLowerCase();
          if (sel.includes(":root") || sel === "html" || sel.startsWith("html[")) {
            for (const prop of rule.style) {
              if (prop.startsWith("--")) {
                cssVars[prop] = rule.style.getPropertyValue(prop).trim();
              }
            }
          }
        }
      }
      for (const sheet of document.styleSheets) {
        try { extractVarsFromRules(sheet.cssRules); } catch { /* cross-origin */ }
      }

      return { colors, fonts, fontSizes, fontWeights, spacings, radii, shadows, cssVars };
    });

    const title = await page.title();
    return { ...raw, title, url };
  } finally {
    await context.close();
  }
}

/**
 * Merge frequency maps from multiple raw extractions.
 * Normalizes per page so long pages don't dominate.
 */
function mergeFreqMaps(maps) {
  const merged = {};
  for (const map of maps) {
    const total = Object.values(map).reduce((s, v) => s + v, 0) || 1;
    for (const [key, count] of Object.entries(map)) {
      merged[key] = (merged[key] || 0) + count / total;
    }
  }
  return merged;
}

/**
 * Merge multiple raw extractions into one.
 */
function mergeRaw(pages) {
  if (pages.length === 0) throw new Error("No pages extracted successfully");
  if (pages.length === 1) return pages[0];

  const merged = {
    colors: {
      background: mergeFreqMaps(pages.map((p) => p.colors.background)),
      text: mergeFreqMaps(pages.map((p) => p.colors.text)),
      border: mergeFreqMaps(pages.map((p) => p.colors.border)),
    },
    fonts: mergeFreqMaps(pages.map((p) => p.fonts)),
    fontSizes: mergeFreqMaps(pages.map((p) => p.fontSizes)),
    fontWeights: mergeFreqMaps(pages.map((p) => p.fontWeights)),
    spacings: mergeFreqMaps(pages.map((p) => p.spacings)),
    radii: mergeFreqMaps(pages.map((p) => p.radii)),
    shadows: mergeFreqMaps(pages.map((p) => p.shadows)),
    cssVars: {},
    title: pages[0].title,
    url: pages[0].url,
    sources: pages.map((p) => p.url),
  };

  // Union CSS vars (first value wins for duplicates)
  for (const page of pages) {
    for (const [k, v] of Object.entries(page.cssVars || {})) {
      if (!(k in merged.cssVars)) merged.cssVars[k] = v;
    }
  }

  return merged;
}

/**
 * Extract from one or more URLs with optional dark mode.
 */
export async function extractFromUrls(urls, { dark = false } = {}) {
  const browser = await chromium.launch({ headless: true });
  try {
    // Light mode extraction
    const lightPages = [];
    for (const url of urls) {
      try {
        lightPages.push(await extractPage(browser, url, "light"));
      } catch (err) {
        process.stderr.write(`Warning: failed to extract ${url}: ${err.message}\n`);
      }
    }
    const light = mergeRaw(lightPages);

    // Dark mode extraction
    let darkTokens = null;
    if (dark) {
      const darkPages = [];
      for (const url of urls) {
        try {
          darkPages.push(await extractPage(browser, url, "dark"));
        } catch (err) {
          process.stderr.write(`Warning: failed dark extraction for ${url}: ${err.message}\n`);
        }
      }
      if (darkPages.length > 0) {
        darkTokens = mergeRaw(darkPages);
      }
    }

    return { light, dark: darkTokens };
  } finally {
    await browser.close();
  }
}

/**
 * Single URL extraction (backwards compatible).
 */
export async function extractFromUrl(url) {
  const { light } = await extractFromUrls([url]);
  return light;
}
