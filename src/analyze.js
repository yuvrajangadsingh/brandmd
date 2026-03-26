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
    ...bgColors.slice(0, 6).map((c, i) => ({
      hex: c.hex.toUpperCase(),
      name: hexToVar[c.hex.toUpperCase()] || describeColor(c.hex),
      role: guessColorRole(c.hex, i, "background"),
      freq: c.freq,
    })),
    ...textColors.slice(0, 4).map((c, i) => ({
      hex: c.hex.toUpperCase(),
      name: hexToVar[c.hex.toUpperCase()] || describeColor(c.hex),
      role: guessColorRole(c.hex, i, "text"),
      freq: c.freq,
    })),
    ...borderColors.slice(0, 2).map((c, i) => ({
      hex: c.hex.toUpperCase(),
      name: hexToVar[c.hex.toUpperCase()] || describeColor(c.hex),
      role: guessColorRole(c.hex, i, "border"),
      freq: c.freq,
    })),
  ];

  // Deduplicate palette by hex
  const seen = new Set();
  const dedupedPalette = palette.filter((c) => {
    if (seen.has(c.hex)) return false;
    seen.add(c.hex);
    return true;
  });

  // Typography
  const fontList = topByFreq(raw.fonts, 5);
  const primaryFont = fontList[0]?.[0] || "system-ui";
  const secondaryFont = fontList[1]?.[0] || null;

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

  return {
    title: raw.title,
    url: raw.url,
    atmosphere,
    palette: dedupedPalette,
    typography: {
      primary: primaryFont,
      secondary: secondaryFont,
      sizes: sizeList,
      weights: weightList,
    },
    spacing: spacingList,
    radii: radiiList,
    shadows: shadowList,
    cssVars,
  };
}
