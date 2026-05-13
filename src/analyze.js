import chroma from "chroma-js";

/**
 * Parse a CSS color string (rgb, rgba, hex) into a hex string.
 * Returns null if unparseable.
 */
function toHex(cssColor) {
  try {
    return chroma(cssColor).hex();
  } catch {
    // Try parsing rgb/rgba manually
    const match = cssColor.match(
      /rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\s*\)/i
    );
    if (match) {
      try {
        return chroma(+match[1], +match[2], +match[3]).hex();
      } catch {
        return null;
      }
    }
    return null;
  }
}

/**
 * Sort entries by frequency (descending), return top N.
 */
function topByFreq(obj, n = 10) {
  return Object.entries(obj)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);
}

/**
 * Cluster similar colors together. Returns deduplicated list.
 */
function clusterColors(colorFreqPairs, threshold = 15) {
  const clusters = [];

  for (const [color, freq] of colorFreqPairs) {
    const hex = toHex(color);
    if (!hex) continue;

    let merged = false;
    for (const cluster of clusters) {
      try {
        if (chroma.deltaE(hex, cluster.hex) < threshold) {
          cluster.freq += freq;
          merged = true;
          break;
        }
      } catch {
        continue;
      }
    }

    if (!merged) {
      clusters.push({ hex, freq, original: color });
    }
  }

  return clusters.sort((a, b) => b.freq - a.freq);
}

/**
 * Guess color role based on luminance and usage context.
 */
function guessColorRole(hex, index, type) {
  try {
    const lum = chroma(hex).luminance();
    const hsl = chroma(hex).hsl();
    const saturation = hsl[1] || 0;

    if (type === "background") {
      if (lum > 0.9) return "Page background";
      if (lum > 0.7) return "Surface / card background";
      if (lum < 0.1) return "Dark background / footer";
      if (saturation > 0.4) return "Accent background";
      return "Secondary background";
    }

    if (type === "text") {
      if (lum < 0.1) return "Primary text";
      if (lum < 0.3) return "Secondary text";
      if (lum > 0.7) return "Light text (on dark)";
      if (saturation > 0.5) return "Link / accent text";
      return "Muted text";
    }

    if (type === "border") {
      if (saturation > 0.5) return "Focus / active border";
      return "Divider / border";
    }
  } catch {
    // fallback
  }

  return index === 0 ? "Primary" : `Secondary ${index}`;
}

/**
 * Make a CSS variable name human-readable.
 * --color-primary -> Color Primary
 * --bg-surface -> Bg Surface
 */
function semanticName(varName) {
  return varName
    .replace(/^--/, "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

/**
 * Analyze extracted component styles into representative tokens.
 */
function analyzeComponents(components) {
  const result = { buttons: null, cards: null, inputs: null };

  if (components?.buttons?.length > 0) {
    const bgFreq = {};
    for (const b of components.buttons) {
      const hex = toHex(b.bg);
      if (hex) bgFreq[hex] = (bgFreq[hex] || 0) + 1;
    }
    const topBg = Object.entries(bgFreq).sort((a, b) => b[1] - a[1])[0];
    result.buttons = components.buttons.find((b) => toHex(b.bg) === topBg?.[0]) || components.buttons[0];
  }

  if (components?.cards?.length > 0) {
    result.cards = components.cards[0];
  }

  if (components?.inputs?.length > 0) {
    result.inputs = components.inputs[0];
  }

  return result;
}

/**
 * Describe a color in human-readable terms.
 */
function describeColor(hex) {
  try {
    const hsl = chroma(hex).hsl();
    const lum = chroma(hex).luminance();
    const sat = hsl[1] || 0;

    if (sat < 0.05) {
      if (lum > 0.95) return "White";
      if (lum > 0.7) return "Light gray";
      if (lum > 0.3) return "Medium gray";
      if (lum > 0.05) return "Dark gray";
      return "Black";
    }

    const hue = hsl[0] || 0;
    const hueNames = [
      [15, "Red"],
      [45, "Orange"],
      [65, "Yellow"],
      [150, "Green"],
      [195, "Cyan"],
      [250, "Blue"],
      [290, "Purple"],
      [340, "Pink"],
      [361, "Red"],
    ];

    let hueName = "Gray";
    for (const [limit, name] of hueNames) {
      if (hue < limit) {
        hueName = name;
        break;
      }
    }

    const lightness = lum > 0.6 ? "Light " : lum < 0.2 ? "Dark " : "";
    const muted = sat < 0.3 ? "Muted " : "";

    return `${lightness}${muted}${hueName}`;
  } catch {
    return "Unknown";
  }
}

/**
 * Parse px value to number.
 */
function pxToNum(px) {
  return parseFloat(px.replace("px", "")) || 0;
}

/**
 * Analyze raw extracted data into structured design tokens.
 */
export function analyze(raw) {
  // Build a reverse map from hex values to CSS variable names
  const cssVars = raw.cssVars || {};
  const hexToVar = {};
  for (const [varName, value] of Object.entries(cssVars)) {
    const hex = toHex(value);
    if (hex) hexToVar[hex.toUpperCase()] = varName;
  }

  // Colors
  const bgColors = clusterColors(Object.entries(raw.colors.background));
  const textColors = clusterColors(Object.entries(raw.colors.text));
  const borderColors = clusterColors(Object.entries(raw.colors.border));

  const palette = [
    ...bgColors.slice(0, 6).map((c, i) => {
      const varName = hexToVar[c.hex.toUpperCase()];
      return {
        hex: c.hex.toUpperCase(),
        name: varName ? semanticName(varName) : describeColor(c.hex),
        varName: varName || null,
        role: guessColorRole(c.hex, i, "background"),
        freq: c.freq,
      };
    }),
    ...textColors.slice(0, 4).map((c, i) => {
      const varName = hexToVar[c.hex.toUpperCase()];
      return {
        hex: c.hex.toUpperCase(),
        name: varName ? semanticName(varName) : describeColor(c.hex),
        varName: varName || null,
        role: guessColorRole(c.hex, i, "text"),
        freq: c.freq,
      };
    }),
    ...borderColors.slice(0, 2).map((c, i) => {
      const varName = hexToVar[c.hex.toUpperCase()];
      return {
        hex: c.hex.toUpperCase(),
        name: varName ? semanticName(varName) : describeColor(c.hex),
        varName: varName || null,
        role: guessColorRole(c.hex, i, "border"),
        freq: c.freq,
      };
    }),
  ];

  // Deduplicate palette by hex
  const seen = new Set();
  const dedupedPalette = palette.filter((c) => {
    if (seen.has(c.hex)) return false;
    seen.add(c.hex);
    return true;
  });

  // Typography
  const fontList = topByFreq(raw.fonts, 10);

  // Per-element-role fonts. Frequency on h1-h6 vs paragraph tells AI tools
  // "use X for headings, Y for body" instead of a single global ranking that
  // gets dominated by whichever font happens to be on the most divs.
  const rawRoleFonts = (key, limit = 2) =>
    topByFreq(raw.fontsByRole?.[key] || {}, limit).map(([f]) => f);
  const rawHeading = rawRoleFonts("heading", 2);
  const rawBody = rawRoleFonts("body", 1);
  const rawButton = rawRoleFonts("button", 1);
  const rawDisplay = rawRoleFonts("display", 2);

  // Fix D: per-role fallback hierarchy. When a bucket is empty, cascade so the
  // output always has a heading font and a body font, never blank.
  // - heading: heading > display > body > global top
  // - body: body > body-sized-from-sizes > global top
  // - display: display only (no fallback; absent = no large fontSize present)
  // - button: button > body
  const globalTop = fontList[0]?.[0] || null;
  const headingFonts =
    rawHeading.length ? rawHeading :
    rawDisplay.length ? rawDisplay :
    rawBody.length ? rawBody.slice(0, 1) :
    globalTop ? [globalTop] : [];
  const bodyFonts =
    rawBody.length ? rawBody :
    globalTop ? [globalTop] : [];
  const displayFonts = rawDisplay;
  const buttonFonts =
    rawButton.length ? rawButton :
    rawBody.length ? rawBody.slice(0, 1) : [];

  // Fix A: smarter Primary. Pick from heading > display > body > global, but
  // skip monospace, common fallback fonts (Times/Arial/Georgia), and icon
  // fonts. Body-text-by-frequency picks up Menlo on dev sites or Inter on
  // utility-heavy sites where Geist is the actual brand on the hero.
  // `\bmono\b` so we catch "JetBrains Mono", "Berkeley Mono", "Apercu Mono"
  // etc. without false-positive-matching "Monotype" or "Harmonia". Explicit
  // monospace family names below are belt-and-suspenders for cases like
  // "GeistMono" (no whitespace) where \b would not fire.
  const MONO_RE = /\bmono\b|menlo|consolas|courier|jetbrains|geistmono|sfmono|source code|fira code|cascadia|operator mono|ibm plex mono|figmamono|iosevka/i;
  const FALLBACK_RE = /^(times|times new roman|arial|helvetica|georgia|verdana|tahoma|trebuchet|courier|courier new)$/i;
  // Material Symbols (Outlined/Rounded/Sharp) is the successor to Material Icons;
  // both can dominate counts on icon-heavy UIs and must not become Primary.
  const ICON_RE = /(^material (icons|symbols)|font awesome|^feather$|heroicons|phosphor|^tabler([\s-]?icons?)?$|^lucide$|simple line icons|bootstrap.?icons|ionicons|^remixicon$|fontello)/i;
  const isExcluded = (f) => !f || MONO_RE.test(f) || FALLBACK_RE.test(f) || ICON_RE.test(f);
  const pickNonExcluded = (arr) => arr.find((f) => !isExcluded(f)) || null;

  // Order matters: display (fontSize >= 40px, hero text) carries the brand
  // signal more reliably than h1-h6 count, because a site can have many small
  // h2/h3 in the utility font while the hero is the actual brand. See valura.ai:
  // heading-by-count = Inter (loses to body-dominated h2/h3), but display = Manrope.
  const primaryFont =
    pickNonExcluded(rawDisplay) ||
    pickNonExcluded(rawHeading) ||
    pickNonExcluded(rawBody) ||
    pickNonExcluded(fontList.map(([f]) => f)) ||
    // Everything was excluded (e.g. site only has Times). Fall back to top
    // frequency so the field is never empty.
    fontList[0]?.[0] || "system-ui";

  const allCandidates = [
    ...rawDisplay,
    ...rawHeading,
    ...rawBody,
    ...fontList.map(([f]) => f),
  ];
  const secondaryFont =
    allCandidates.find((f) => f !== primaryFont && !isExcluded(f)) ||
    allCandidates.find((f) => f !== primaryFont && MONO_RE.test(f)) ||
    null;

  const allDetected = fontList.map(([font, count]) => ({
    font,
    count: typeof count === "number" ? Math.round(count * 100) / 100 : count,
  }));

  const sizeList = topByFreq(raw.fontSizes, 15)
    .map(([size, freq]) => ({ size, px: pxToNum(size), freq }))
    .sort((a, b) => a.px - b.px);

  const weightList = topByFreq(raw.fontWeights, 6)
    .map(([w, freq]) => ({ weight: w, freq }))
    .sort((a, b) => +a.weight - +b.weight);

  // Spacing scale
  const spacingList = topByFreq(raw.spacings, 20)
    .map(([val, freq]) => ({ val, px: pxToNum(val), freq }))
    .filter((s) => s.px > 0 && s.px <= 200)
    .sort((a, b) => a.px - b.px);

  // Radii
  const radiiList = topByFreq(raw.radii, 8)
    .map(([val, freq]) => ({ val, freq }))
    .sort((a, b) => pxToNum(a.val) - pxToNum(b.val));

  // Shadows
  const shadowList = topByFreq(raw.shadows, 5).map(([val, freq]) => ({
    val,
    freq,
  }));

  // Guess atmosphere
  const avgLum =
    dedupedPalette.reduce((sum, c) => {
      try {
        return sum + chroma(c.hex).luminance();
      } catch {
        return sum;
      }
    }, 0) / (dedupedPalette.length || 1);

  const atmosphere =
    dedupedPalette.length === 0
      ? "Balanced and professional"
      : avgLum > 0.6 ? "Light and airy" : avgLum < 0.3 ? "Dark and moody" : "Balanced and professional";

  // Line heights
  const lineHeightList = topByFreq(raw.lineHeights || {}, 10)
    .map(([val, freq]) => ({ val, freq }));

  // Letter spacings
  const letterSpacingList = topByFreq(raw.letterSpacings || {}, 6)
    .map(([val, freq]) => ({ val, freq }));

  // Components
  const components = analyzeComponents(raw.components);

  return {
    title: raw.title,
    url: raw.url,
    atmosphere,
    palette: dedupedPalette,
    typography: {
      primary: primaryFont,
      secondary: secondaryFont,
      headingFonts,
      bodyFonts,
      buttonFonts,
      displayFonts,
      allDetected,
      sizes: sizeList,
      weights: weightList,
      lineHeights: lineHeightList,
      letterSpacings: letterSpacingList,
    },
    spacing: spacingList,
    radii: radiiList,
    shadows: shadowList,
    components,
    cssVars,
  };
}
