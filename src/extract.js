import { chromium } from "playwright";

/**
 * Detect if the current page is a Cloudflare challenge / block.
 * Returns "yes" | "no" | "unknown".
 *
 * Confidence-based: STRONG markers (CF-specific paths/classes/IDs) are
 * sufficient on their own. WEAK markers (title/body phrases) only count
 * when paired with a CF corroborator, since "Just a moment..." or
 * "Attention required" can appear on legitimate pages.
 *
 * Returns "unknown" if page.evaluate fails (page mid-navigation/redirect),
 * so the caller can keep polling instead of treating uncertainty as "no".
 */
async function isCloudflareChallenge(page) {
  try {
    return await page.evaluate(() => {
      const title = (document.title || "").toLowerCase();
      const body = (document.body?.innerText || "").toLowerCase();
      const html = (document.documentElement?.outerHTML || "").toLowerCase();

      // STRONG markers — Cloudflare-specific, sufficient alone
      const strong =
        /cf-browser-verification|cf-challenge-running|cf-error-details|__cf_chl_|\/cdn-cgi\/challenge-platform\//.test(html) ||
        /cloudflare ray id/.test(body);

      if (strong) return "yes";

      // WEAK markers — phrases that need a CF corroborator
      const weakTitle = /just a moment|attention required|verifying you are human/.test(title);
      const weakBody = /verifying you are human|enable javascript and cookies to continue/.test(body);
      const cfFootprint = /cloudflare/.test(html);

      if ((weakTitle || weakBody) && cfFootprint) return "yes";

      return "no";
    });
  } catch {
    return "unknown";
  }
}

/**
 * Decide whether an extraction is really a bot-block / access-denied page
 * (Akamai, PerimeterX, generic WAF 403s) rather than the real site. These
 * return real-looking HTML that sails past the Cloudflare-specific check and
 * yields a confident garbage DESIGN.md.
 *
 * Combines independent weak signals and requires 2+ to fire, so genuinely
 * minimal landing pages don't false-positive. Pure function, no browser —
 * exported for testing.
 */
export function detectBlockLikely({ title = "", httpStatus = null, bodyTextLength = null, colors = {}, fonts = {} } = {}) {
  const blockTitle = /access denied|forbidden|^403\b|attention required|pardon our interruption|are you (a )?human|captcha|request blocked|not authorized/i.test(title);
  const httpBlocked = httpStatus != null && [401, 403, 429].includes(httpStatus);
  const bodyThin = bodyTextLength != null && bodyTextLength < 200;
  const bgCount = Object.keys(colors?.background || {}).length;
  const fontNames = Object.keys(fonts || {});
  const fallbackFontsOnly =
    fontNames.length > 0 &&
    fontNames.every((f) => /^\s*("?)(times( new roman)?|arial|helvetica|system-ui|sans-serif|serif|-apple-system|blinkmacsystemfont)\1\s*$/i.test(f.split(",")[0]));
  const barePage = bgCount <= 2 && fallbackFontsOnly;
  return [blockTitle, httpBlocked, bodyThin, barePage].filter(Boolean).length >= 2;
}

/**
 * Extract styles from a single page using a shared browser instance.
 */
async function extractPage(browser, url, colorScheme = "light", { vision = false, cfWaitMs = 20000 } = {}) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme,
  });

  try {
    const page = await context.newPage();
    const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    const httpStatus = response ? response.status() : null;
    await page.waitForTimeout(2000);

    // Tier B: if Cloudflare challenge is up, give it time to auto-resolve.
    // Most JS challenges clear in 5-10s; some take longer on first visit.
    // Default 20s, configurable via cfWaitMs option.
    if ((await isCloudflareChallenge(page)) === "yes") {
      const start = Date.now();
      while (Date.now() - start < cfWaitMs) {
        await page.waitForTimeout(1000);
        const state = await isCloudflareChallenge(page);
        // "no" = cleared; "unknown" = mid-navigation, keep polling
        if (state === "no") break;
      }
      // Tier A: still on challenge after the wait — tell the caller clearly.
      if ((await isCloudflareChallenge(page)) === "yes") {
        throw new Error(
          `Cloudflare challenge active on ${url} after ${cfWaitMs}ms. ` +
          `The site is bot-protected; brandmd cannot extract through it. ` +
          `Try a non-protected page (e.g. /docs, /pricing) or run from a residential IP.`
        );
      }
      // Resolved (or unknown) — wait for the real page to be loaded enough
      // to extract from, then give it a small settle window.
      await page.waitForLoadState("domcontentloaded", { timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(1500);
    }

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

    // Without this wait, getComputedStyle() can return the fallback font (e.g.
    // "Inter" or system-ui) while a slow web font is still loading. 5s cap so a
    // sluggish font CDN doesn't stall extraction indefinitely.
    await page.evaluate(async () => {
      if (document.fonts && document.fonts.ready) {
        await Promise.race([
          document.fonts.ready,
          new Promise((r) => setTimeout(r, 5000)),
        ]);
      }
    });

    const raw = await page.evaluate(() => {
      const colors = { background: {}, text: {}, border: {} };
      const fonts = {};
      // Brand fonts are often used on headings only, while body text falls back
      // to a workhorse system font. Tracking per-role lets the output surface
      // "use X for headings, Y for body" instead of just the most-frequent font.
      const fontsByRole = { heading: {}, body: {}, button: {}, display: {} };
      const fontSizes = {};
      const fontWeights = {};
      const lineHeights = {};
      const letterSpacings = {};
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
          // Count + capped area bonus. Element count alone lets a tinted
          // overlay on dozens of tiny chips outrank the actual page
          // background; a full-viewport element adds 25, a chip adds ~0.
          const vp = (window.innerWidth * window.innerHeight) || 1;
          const areaShare = Math.min((rect.width * rect.height) / vp, 1);
          colors.background[bg] = (colors.background[bg] || 0) + 1 + areaShare * 25;
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
          // Quote-aware splitter. Some sites have weird values like
          // `--font-display: CUSTOMV2;Aeonik Pro TRIAL Regular` that end up
          // as a single computed name; naive split-on-comma misses the `;`
          // and treats the whole thing as one font.
          const genericKeywords = new Set([
            "sans-serif", "serif", "monospace", "cursive", "fantasy", "math",
            "fangsong", "emoji", "system-ui", "-apple-system", "blinkmacsystemfont",
            "ui-sans-serif", "ui-serif", "ui-monospace", "ui-rounded",
            "apple color emoji", "segoe ui emoji", "noto color emoji",
            "inherit", "initial", "unset",
          ]);
          const tokens = [];
          let buf = "";
          let inSingle = false;
          let inDouble = false;
          let parenDepth = 0;
          // Backslash escape: getComputedStyle should already resolve CSS string
          // escapes, but handling \" / \' / \\ keeps us safe if a UA returns a
          // less-normalized value. Also track paren depth so commas inside
          // `var(--font, 'Inter')` don't trigger a split.
          let escapeNext = false;
          for (const ch of fontFamily) {
            if (escapeNext) { buf += ch; escapeNext = false; continue; }
            if (ch === "\\") { buf += ch; escapeNext = true; continue; }
            if (ch === "'" && !inDouble) { inSingle = !inSingle; buf += ch; continue; }
            if (ch === '"' && !inSingle) { inDouble = !inDouble; buf += ch; continue; }
            if (ch === "(" && !inSingle && !inDouble) { parenDepth++; buf += ch; continue; }
            if (ch === ")" && !inSingle && !inDouble) {
              if (parenDepth > 0) parenDepth--;
              buf += ch;
              continue;
            }
            if ((ch === "," || ch === ";") && !inSingle && !inDouble && parenDepth === 0) {
              tokens.push(buf); buf = ""; continue;
            }
            buf += ch;
          }
          if (buf) tokens.push(buf);
          let clean = null;
          for (const t of tokens) {
            const c = t.replace(/['"]/g, "").trim();
            if (!c) continue;
            if (/(^|\s)Placeholder$/i.test(c)) continue;
            if (genericKeywords.has(c.toLowerCase())) continue;
            clean = c;
            break;
          }
          if (clean) {
            fonts[clean] = (fonts[clean] || 0) + 1;

            // Element-role classification. The same font on h1 vs body p tells
            // a different brand story; one role per element keeps counts honest.
            const tag = el.tagName;
            const role = el.getAttribute("role");
            const fontSizePx = parseFloat(style.fontSize) || 0;
            if (/^H[1-6]$/.test(tag)) {
              fontsByRole.heading[clean] = (fontsByRole.heading[clean] || 0) + 1;
            } else if (tag === "BUTTON" || role === "button") {
              fontsByRole.button[clean] = (fontsByRole.button[clean] || 0) + 1;
            } else if (fontSizePx >= 40) {
              fontsByRole.display[clean] = (fontsByRole.display[clean] || 0) + 1;
            } else if (tag === "P" || tag === "LI" || tag === "SPAN" || tag === "DIV") {
              fontsByRole.body[clean] = (fontsByRole.body[clean] || 0) + 1;
            }
          }
        }

        const fontSize = style.fontSize;
        if (fontSize) fontSizes[fontSize] = (fontSizes[fontSize] || 0) + 1;

        const fontWeight = style.fontWeight;
        if (fontWeight) fontWeights[fontWeight] = (fontWeights[fontWeight] || 0) + 1;

        const lh = style.lineHeight;
        if (lh && lh !== "normal") lineHeights[lh] = (lineHeights[lh] || 0) + 1;

        const ls = style.letterSpacing;
        if (ls && ls !== "normal" && ls !== "0px") letterSpacings[ls] = (letterSpacings[ls] || 0) + 1;

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

      // Extract real component styles from DOM
      const components = { buttons: [], cards: [], inputs: [] };

      for (const btn of document.querySelectorAll('button, a[class*="btn"], a[class*="button"], [role="button"]')) {
        const s = getComputedStyle(btn);
        const rect = btn.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;
        components.buttons.push({
          bg: s.backgroundColor, color: s.color, radius: s.borderRadius,
          padding: `${s.paddingTop} ${s.paddingRight} ${s.paddingBottom} ${s.paddingLeft}`,
          fontSize: s.fontSize, fontWeight: s.fontWeight, border: s.border,
        });
      }

      for (const el of document.querySelectorAll('[class*="card"], [class*="Card"], article')) {
        const s = getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        if (rect.width < 100 || rect.height < 50) continue;
        components.cards.push({
          bg: s.backgroundColor, radius: s.borderRadius,
          shadow: s.boxShadow, padding: `${s.paddingTop} ${s.paddingRight} ${s.paddingBottom} ${s.paddingLeft}`,
        });
      }

      for (const inp of document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], input:not([type]), textarea, select')) {
        const s = getComputedStyle(inp);
        components.inputs.push({
          bg: s.backgroundColor, color: s.color, radius: s.borderRadius,
          border: s.border, padding: `${s.paddingTop} ${s.paddingRight} ${s.paddingBottom} ${s.paddingLeft}`,
          fontSize: s.fontSize,
        });
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

      // Motion presence — cheap, element/inline-script based only. Bundled
      // event listeners (e.g. addEventListener("pointermove") inside minified
      // JS) are NOT enumerable from the DOM, so this detects animation surfaces
      // (canvas/webgl/lottie) and inline rAF, not every interaction handler.
      let webgl = false;
      const canvas = document.querySelector("canvas");
      if (canvas) {
        try {
          webgl = !!(canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
        } catch { /* context probe failed */ }
      }
      let inlineRaf = false;
      for (const s of document.scripts) {
        if (!s.src && s.textContent && /requestAnimationFrame/.test(s.textContent)) { inlineRaf = true; break; }
      }
      const motion = {
        canvas: !!canvas,
        webgl,
        lottie: !!document.querySelector('[class*="lottie" i], lottie-player, dotlottie-player'),
        inlineRaf,
      };

      const bodyTextLength = (document.body?.innerText || "").length;

      return { colors, fonts, fontsByRole, fontSizes, fontWeights, lineHeights, letterSpacings, spacings, radii, shadows, cssVars, components, motion, bodyTextLength };
    });

    const title = await page.title();

    const blockLikely = detectBlockLikely({
      title,
      httpStatus,
      bodyTextLength: raw.bodyTextLength,
      colors: raw.colors,
      fonts: raw.fonts,
    });
    if (blockLikely) {
      process.stderr.write(
        `Warning: ${url} looks like a block / access-denied page (status ${httpStatus ?? "?"}, title "${title}"). ` +
        `The generated design system is likely garbage. Try a non-protected page.\n`
      );
    }

    let visionData = null;
    if (vision) {
      // Full-page screenshot, not viewport, so below-the-fold illustrations
      // and photography (Stripe-style) are seen by the vision model.
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(400);
      const screenshotBuf = await page.screenshot({ type: "png", fullPage: true });

      // Tone snippets — headers, hero, primary CTAs (caps text length so prompt stays small)
      const toneSnippets = await page.evaluate(() => {
        const grab = (sel, max) =>
          Array.from(document.querySelectorAll(sel))
            .map((el) => el.innerText.trim())
            .filter(Boolean)
            .slice(0, max);
        return {
          h1: grab("h1", 3),
          h2: grab("h2", 5),
          buttons: grab("button, a[role='button'], a[class*='button']", 10),
          hero_text: grab("section:first-of-type p, header p, [class*='hero'] p", 5),
        };
      });

      visionData = {
        screenshotBase64: screenshotBuf.toString("base64"),
        toneSnippets,
      };
    }

    // raw already carries `motion` and `bodyTextLength` from the evaluate.
    return { ...raw, title, url, vision: visionData, blockLikely };
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
    fontsByRole: {
      heading: mergeFreqMaps(pages.map((p) => p.fontsByRole?.heading || {})),
      body: mergeFreqMaps(pages.map((p) => p.fontsByRole?.body || {})),
      button: mergeFreqMaps(pages.map((p) => p.fontsByRole?.button || {})),
      display: mergeFreqMaps(pages.map((p) => p.fontsByRole?.display || {})),
    },
    fontSizes: mergeFreqMaps(pages.map((p) => p.fontSizes)),
    fontWeights: mergeFreqMaps(pages.map((p) => p.fontWeights)),
    lineHeights: mergeFreqMaps(pages.map((p) => p.lineHeights || {})),
    letterSpacings: mergeFreqMaps(pages.map((p) => p.letterSpacings || {})),
    spacings: mergeFreqMaps(pages.map((p) => p.spacings)),
    radii: mergeFreqMaps(pages.map((p) => p.radii)),
    shadows: mergeFreqMaps(pages.map((p) => p.shadows)),
    cssVars: {},
    components: { buttons: [], cards: [], inputs: [] },
    title: pages[0].title,
    url: pages[0].url,
    sources: pages.map((p) => p.url),
    // If any source page tripped the block heuristic, surface it. Motion is a
    // union — a feature present on any page counts as present for the brand.
    blockLikely: pages.some((p) => p.blockLikely),
    motion: {
      canvas: pages.some((p) => p.motion?.canvas),
      webgl: pages.some((p) => p.motion?.webgl),
      lottie: pages.some((p) => p.motion?.lottie),
      inlineRaf: pages.some((p) => p.motion?.inlineRaf),
    },
  };

  // Merge components (concat all)
  for (const page of pages) {
    if (page.components) {
      merged.components.buttons.push(...(page.components.buttons || []));
      merged.components.cards.push(...(page.components.cards || []));
      merged.components.inputs.push(...(page.components.inputs || []));
    }
  }

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
export async function extractFromUrls(urls, { dark = false, vision = false, cfWaitMs = 20000 } = {}) {
  const browser = await chromium.launch({ headless: true });
  try {
    // Light mode extraction. Only the first URL gets vision data — the screenshot
    // represents the brand hero, not a multi-page average.
    const lightPages = [];
    for (let i = 0; i < urls.length; i++) {
      try {
        lightPages.push(await extractPage(browser, urls[i], "light", { vision: vision && i === 0, cfWaitMs }));
      } catch (err) {
        process.stderr.write(`Warning: failed to extract ${urls[i]}: ${err.message}\n`);
      }
    }
    const light = mergeRaw(lightPages);
    if (vision && lightPages.length > 0 && lightPages[0].vision) {
      light.vision = lightPages[0].vision;
    }

    // Dark mode extraction
    let darkTokens = null;
    if (dark) {
      const darkPages = [];
      for (const url of urls) {
        try {
          darkPages.push(await extractPage(browser, url, "dark", { cfWaitMs }));
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
