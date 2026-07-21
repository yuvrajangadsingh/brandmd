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
 * Merge variable-font duplicates: "Geist VF" folds into "Geist", "Inter Variable"
 * into "Inter". The base (suffix-stripped) name wins and inherits the summed
 * frequency, so the same family isn't reported twice.
 */
function dedupeFonts(map) {
  const VF_SUFFIX = /\s+(VF|Variable)$/i;
  const base = {};   // normalized-key -> chosen display name
  const out = {};
  for (const [name, freq] of Object.entries(map || {})) {
    const stripped = name.replace(VF_SUFFIX, "").trim();
    const key = stripped.toLowerCase();
    if (!(key in base)) base[key] = stripped;
    // Prefer the shorter (suffix-free) label as the canonical name.
    if (stripped.length < base[key].length) base[key] = stripped;
    out[key] = (out[key] || 0) + freq;
  }
  const result = {};
  for (const [key, freq] of Object.entries(out)) result[base[key]] = freq;
  return result;
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
    const c = chroma(hex);
    const lum = c.luminance();
    const hsl = c.hsl();
    const saturation = hsl[1] || 0;
    const lightness = hsl[2] || 0;

    if (type === "background") {
      // Translucent values are overlays, not surfaces.
      if (c.alpha() < 0.5) return "Overlay / scrim";
      if (lum > 0.9) return "Page background";
      if (lum > 0.7) return "Surface / card background";
      // Saturation beats darkness: a vivid blue is an accent even though its
      // luminance is low (blue contributes little to luminance).
      if (saturation > 0.4 && lightness > 0.15) return "Accent background";
      if (lum < 0.1) return "Dark background / footer";
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
 * Is a CSS color a real, opaque-enough solid fill (not transparent/near-clear)?
 */
function isSolidFill(cssColor) {
  try {
    return chroma(cssColor).alpha() >= 0.5;
  } catch {
    return false;
  }
}

/**
 * Analyze extracted component styles into representative tokens.
 *
 * The primary button is the most *saturated solid* candidate (tie-broken by
 * contrast against the page background), NOT the most frequent — most-frequent
 * favors the transparent nav/icon buttons that swamp a real CTA. Transparent
 * candidates become a separate "ghost / secondary" variant.
 */
function analyzeComponents(components, pageBgHex = null) {
  const result = { buttons: null, ghostButton: null, cards: null, inputs: null };

  const buttons = components?.buttons || [];
  if (buttons.length > 0) {
    const solids = buttons.filter((b) => isSolidFill(b.bg));
    const ghosts = buttons.filter((b) => !isSolidFill(b.bg));

    if (solids.length > 0) {
      const score = (b) => {
        try {
          const c = chroma(toHex(b.bg));
          const sat = c.hsl()[1] || 0;
          const contrast = pageBgHex ? chroma.contrast(c, pageBgHex) : 1;
          // Saturation leads (brand CTAs are chromatic); contrast breaks ties
          // and rescues saturated-but-neutral CTAs (a black button on white).
          return sat * 10 + Math.min(contrast, 21) / 21;
        } catch {
          return 0;
        }
      };
      result.buttons = [...solids].sort((a, b) => score(b) - score(a))[0];
    }

    // Ghost = the most common transparent variant (a real, repeated pattern).
    if (ghosts.length > 0) {
      const sig = (b) => `${toHex(b.color) || b.color}|${b.radius}`;
      const freq = {};
      for (const b of ghosts) freq[sig(b)] = (freq[sig(b)] || 0) + 1;
      const topSig = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0];
      result.ghostButton = ghosts.find((b) => sig(b) === topSig) || ghosts[0];
    }
  }

  // Omit empty component groups entirely (no invented card/input defaults).
  if (components?.cards?.length > 0) result.cards = components.cards[0];
  if (components?.inputs?.length > 0) result.inputs = components.inputs[0];

  return result;
}

/**
 * Describe a color in human-readable terms.
 * Uses HSL lightness instead of luminance for tone words: luminance punishes
 * blue hues (#2200FF has lum 0.08 and used to be labeled "Dark Blue" when it
 * is a vivid mid-tone blue), and near-whites with a warm cast used to fall
 * through to the chromatic path ("#F7F6F5" -> "Light Muted Orange").
 */
function describeColor(hex) {
  try {
    const c = chroma(hex);
    const alpha = c.alpha();
    const [hue, sat, light] = c.hsl();
    const s = sat || 0;
    const l = light || 0;

    let base;

    if (s < 0.12 || isNaN(hue)) {
      // Neutral axis
      base =
        l > 0.97 ? "White" :
        l > 0.9 ? "Off-white" :
        l > 0.7 ? "Light gray" :
        l > 0.35 ? "Gray" :
        l > 0.12 ? "Dark gray" :
        "Black";
    } else if (l > 0.9) {
      // Tinted near-whites never get a hue label: warm cast reads as cream,
      // cool cast reads as off-white.
      base = hue >= 20 && hue <= 70 ? "Cream" : "Off-white";
    } else {
      const hueNames = [
        [15, "Red"],
        [45, "Orange"],
        [65, "Yellow"],
        [170, "Green"],
        [200, "Cyan"],
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

      const tone = l > 0.75 ? "Light " : l < 0.25 ? "Dark " : "";
      const intensity = s > 0.85 && l >= 0.3 && l <= 0.65 ? "Vivid " : s < 0.3 ? "Muted " : "";

      base = `${tone}${intensity}${hueName}`;
    }

    if (alpha < 0.25) return `Near-transparent ${base}`;
    if (alpha < 0.7) return `Translucent ${base}`;
    return base;
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
 * Cluster a pixel value to the nearest 0.5px (sub-pixel rendering noise).
 */
function roundPx(v) {
  return Math.round(v * 2) / 2;
}

/**
 * Round merged (per-page normalized) frequencies to 2 decimals so raw float
 * noise like 124.50520351080246 never leaks into --json or any output.
 */
function round2(v) {
  return typeof v === "number" ? Math.round(v * 100) / 100 : v;
}

/**
 * Score how "CTA-like" a color is: saturated and mid-light reads as a primary
 * action color. Near-black/near-white or desaturated colors score <= 0.
 */
function vividness(hex) {
  try {
    const [, s, l] = chroma(hex).hsl();
    const sat = s || 0;
    const li = l || 0;
    if (li <= 0.15 || li >= 0.9 || sat < 0.3) return -1;
    return sat * (1 - Math.abs(li - 0.55));
  } catch {
    return -1;
  }
}

/**
 * Pick the brand's primary/CTA color. Evidence ranking per the plan:
 *   1. explicit accent roles from the palette (Accent background > Link/accent
 *      text > focus border), most vivid first — a bright brand blue beats a
 *      dark navy sharing the role;
 *   2. the representative non-transparent button background (a rendered button
 *      is direct action evidence, even when it's a neutral black-on-white CTA);
 *   3. the most vivid mid-tone chromatic palette color.
 * NEVER a text-neutral role. Returns a palette-shaped entry or null.
 */
function pickPrimaryAccent(palette, solidButtonBg = null) {
  const accentRoles = new Set(["Accent background", "Link / accent text", "Focus / active border"]);
  const explicit = palette
    .filter((c) => accentRoles.has(c.role))
    .sort((a, b) => vividness(b.hex) - vividness(a.hex));
  if (explicit.length && vividness(explicit[0].hex) > 0) return explicit[0];

  if (solidButtonBg) {
    const existing = palette.find((c) => c.hex === solidButtonBg);
    return existing || {
      hex: solidButtonBg,
      name: describeColor(solidButtonBg),
      varName: null,
      role: "Button background",
      freq: 1,
      type: "component",
      tier: "accent",
    };
  }

  // Otherwise the most vivid mid-tone chromatic color that isn't body text.
  let best = null;
  let bestV = 0;
  for (const c of palette) {
    if (/text/i.test(c.role) && c.type === "text") continue;
    const v = vividness(c.hex);
    if (v > bestV) {
      best = c;
      bestV = v;
    }
  }
  return best;
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
        hex: c.hex.toLowerCase(),
        name: varName ? semanticName(varName) : describeColor(c.hex),
        varName: varName || null,
        role: guessColorRole(c.hex, i, "background"),
        freq: round2(c.freq),
        type: "background",
      };
    }),
    ...textColors.slice(0, 4).map((c, i) => {
      const varName = hexToVar[c.hex.toUpperCase()];
      return {
        hex: c.hex.toLowerCase(),
        name: varName ? semanticName(varName) : describeColor(c.hex),
        varName: varName || null,
        role: guessColorRole(c.hex, i, "text"),
        freq: round2(c.freq),
        type: "text",
      };
    }),
    ...borderColors.slice(0, 2).map((c, i) => {
      const varName = hexToVar[c.hex.toUpperCase()];
      return {
        hex: c.hex.toLowerCase(),
        name: varName ? semanticName(varName) : describeColor(c.hex),
        varName: varName || null,
        role: guessColorRole(c.hex, i, "border"),
        freq: round2(c.freq),
        type: "border",
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

  // Tier each token by its usage share within its own group (background /
  // text / border) so the page background and primary text rank as dominant
  // while one-off decorative values sink to incidental. Saturated colors get
  // an accent floor: a CTA red covers little area but is still brand-critical.
  const groupTotals = {
    background: bgColors.reduce((s, c) => s + c.freq, 0) || 1,
    text: textColors.reduce((s, c) => s + c.freq, 0) || 1,
    border: borderColors.reduce((s, c) => s + c.freq, 0) || 1,
  };
  for (const entry of dedupedPalette) {
    const share = entry.freq / groupTotals[entry.type];
    entry.tier = share >= 0.25 ? "dominant" : share >= 0.05 ? "accent" : "incidental";
    if (entry.tier === "incidental") {
      try {
        const [, s] = chroma(entry.hex).hsl();
        if ((s || 0) > 0.5) entry.tier = "accent";
      } catch {
        // keep incidental
      }
    }
  }
  const tierRank = { dominant: 0, accent: 1, incidental: 2 };
  dedupedPalette.sort((a, b) => tierRank[a.tier] - tierRank[b.tier] || b.freq - a.freq);

  // Typography. Merge "Geist" / "Geist VF" style duplicates (the variable-font
  // build carries a suffix but is the same family) before ranking.
  const fontsDeduped = dedupeFonts(raw.fonts);
  const fontList = topByFreq(fontsDeduped, 10);

  // Min-support: a font seen on a single element can never be Primary (the
  // count-1 "Ishmeria" bug). Only enforced on single-page runs where counts are
  // integers; multi-page merge already normalizes single-element noise away.
  const isMerged = Array.isArray(raw.sources);
  const fontSupport = (f) => fontsDeduped[f] || 0;
  const hasSupport = (f) => isMerged || fontSupport(f) >= 2;

  // Per-element-role fonts. Frequency on h1-h6 vs paragraph tells AI tools
  // "use X for headings, Y for body" instead of a single global ranking that
  // gets dominated by whichever font happens to be on the most divs.
  const rawRoleFonts = (key, limit = 2) =>
    topByFreq(dedupeFonts(raw.fontsByRole?.[key] || {}), limit).map(([f]) => f);
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
  // Primary candidacy also requires minimum support (never a count-1 font).
  const pickNonExcluded = (arr) => arr.find((f) => !isExcluded(f) && hasSupport(f)) || null;

  // Order matters: display (fontSize >= 40px, hero text) carries the brand
  // signal more reliably than h1-h6 count, because a site can have many small
  // h2/h3 in the utility font while the hero is the actual brand. See valura.ai:
  // heading-by-count = Inter (loses to body-dominated h2/h3), but display = Manrope.
  // Min-support is a hard invariant: a count-1 font can NEVER be Primary, even
  // when it is the only font on the page. When nothing clears the support bar,
  // primary is null and the output says "(low confidence)" instead of inventing.
  const primaryFont =
    pickNonExcluded(rawDisplay) ||
    pickNonExcluded(rawHeading) ||
    pickNonExcluded(rawBody) ||
    pickNonExcluded(fontList.map(([f]) => f)) ||
    // Everything was excluded by NAME (e.g. the site genuinely uses Times).
    // A supported-but-excluded font is still real evidence; an unsupported
    // (count-1) one is not, and stays out no matter what.
    fontList.map(([f]) => f).find((f) => hasSupport(f)) ||
    null;

  const allCandidates = [
    ...rawDisplay,
    ...rawHeading,
    ...rawBody,
    ...fontList.map(([f]) => f),
  ];
  const secondaryFont =
    allCandidates.find((f) => f !== primaryFont && !isExcluded(f) && hasSupport(f)) ||
    allCandidates.find((f) => f !== primaryFont && MONO_RE.test(f) && hasSupport(f)) ||
    null;

  const allDetected = fontList.map(([font, count]) => ({
    font,
    count: typeof count === "number" ? Math.round(count * 100) / 100 : count,
  }));

  // Cluster sizes to the nearest 0.5px before ranking. Sub-pixel rendering
  // produces noise like 11.05px / 12.75px that used to show up as seven
  // near-identical "scale" entries. Each clustered size is paired with its
  // real dominant line-height and weight from the rendered-text samples.
  const clusterLh = (lh) => {
    if (/px$/.test(lh)) {
      const p = pxToNum(lh);
      return p > 0 ? `${roundPx(p)}px` : null; // drop 0px line-heights
    }
    return lh; // unitless multiplier (e.g. "1.5") or keyword — keep as-is
  };
  const sizeFreq = {};
  const sizeMeta = {}; // clustered size key -> { lh: {}, wt: {} }
  // Cluster across ALL sizes before truncating: a real hero size at freq 1 must
  // not be dropped by 30 noisy near-16px values that each out-rank it (F-19).
  for (const [size, freq] of Object.entries(raw.fontSizes || {})) {
    const px = pxToNum(size);
    if (px <= 0) continue;
    sizeFreq[`${roundPx(px)}px`] = (sizeFreq[`${roundPx(px)}px`] || 0) + freq;
  }
  for (const [size, s] of Object.entries(raw.typeSamples || {})) {
    const px = pxToNum(size);
    if (px <= 0) continue;
    const key = `${roundPx(px)}px`;
    const meta = sizeMeta[key] || (sizeMeta[key] = { lh: {}, wt: {} });
    for (const [lh, c] of Object.entries(s.lineHeights || {})) {
      const lk = clusterLh(lh);
      if (lk) meta.lh[lk] = (meta.lh[lk] || 0) + c;
    }
    for (const [w, c] of Object.entries(s.weights || {})) meta.wt[w] = (meta.wt[w] || 0) + c;
  }
  const dominantKey = (obj) => Object.entries(obj || {}).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  const sizeList = topByFreq(sizeFreq, 12)
    .map(([size, freq]) => ({
      size,
      px: pxToNum(size),
      freq: round2(freq),
      lineHeight: sizeMeta[size] ? dominantKey(sizeMeta[size].lh) : null,
      weight: sizeMeta[size] ? dominantKey(sizeMeta[size].wt) : null,
    }))
    .sort((a, b) => a.px - b.px);

  const weightList = topByFreq(raw.fontWeights, 6)
    .map(([w, freq]) => ({ weight: w, freq: round2(freq) }))
    .sort((a, b) => +a.weight - +b.weight);

  // Spacing scale. Filter-then-cluster: validate units/arity across ALL
  // candidates BEFORE truncating, so a run of negative/compound/oversize values
  // can't crowd real steps out of a top-20 slice. Two-axis gaps ("4px 20px")
  // are dropped from the scalar scale. Values cluster to 0.5px.
  const spacingFreq = {};
  for (const [val, freq] of Object.entries(raw.spacings || {})) {
    const trimmed = String(val).trim();
    if (/\s/.test(trimmed)) continue;   // compound / two-axis
    if (!/px$/.test(trimmed)) continue; // px scalars only (no %, calc, keywords)
    const px = pxToNum(trimmed);
    if (!(px > 0 && px <= 200)) continue;
    spacingFreq[`${roundPx(px)}px`] = (spacingFreq[`${roundPx(px)}px`] || 0) + freq;
  }
  const spacingList = topByFreq(spacingFreq, 12)
    .map(([val, freq]) => ({ val, px: pxToNum(val), freq: round2(freq) }))
    .sort((a, b) => a.px - b.px);

  // Base-grid claim, computed over the FULL weighted valid evidence — before
  // any top-N truncation — so 100 off-grid values can't be silently discarded
  // and then "80% of what's left" pass. Claimed only at >= 80% real coverage.
  let spacingGrid = null;
  {
    const totalW = Object.values(spacingFreq).reduce((s, v) => s + v, 0);
    if (totalW > 0) {
      for (const base of [8, 4, 16]) {
        let fit = 0;
        for (const [k, f] of Object.entries(spacingFreq)) {
          const px = parseFloat(k);
          const mod = px % base;
          if (mod < 0.5 || base - mod < 0.5) fit += f;
        }
        const coverage = fit / totalW;
        if (coverage >= 0.8) {
          spacingGrid = { base, coverage: Math.round(coverage * 100) / 100 };
          break;
        }
      }
    }
  }

  // Radii. Computed border-radius for pill shapes comes back as huge values
  // ("3.35544e+07px"); normalize those to a CSS-valid 9999px with a pill flag
  // so generate-css/tailwind keep emitting valid CSS while DESIGN.md can label
  // them. Sub-pixel values round to 0.5px. Compound values ("4px 4px 0px 0px")
  // normalize per component.
  const normalizeRadiusPart = (part) => {
    if (part.includes("%")) return part;
    const px = parseFloat(part);
    if (!isFinite(px) || px < 0) return null;
    if (px >= 999) return "9999px";
    return `${Math.round(px * 2) / 2}px`;
  };
  const radiusFreq = {};
  for (const [val, freq] of topByFreq(raw.radii, 16)) {
    const parts = val.trim().split(/\s+/).map(normalizeRadiusPart);
    if (parts.some((p) => p === null)) continue;
    const key = parts.join(" ");
    radiusFreq[key] = (radiusFreq[key] || 0) + freq;
  }
  const radiiList = topByFreq(radiusFreq, 8)
    .map(([val, freq]) => ({ val, freq: round2(freq), pill: parseFloat(val) >= 999 }))
    .sort((a, b) => pxToNum(a.val) - pxToNum(b.val));

  // Shadows
  const shadowList = topByFreq(raw.shadows, 5).map(([val, freq]) => ({
    val,
    freq: round2(freq),
  }));

  // Visual character: evidence-based, anchored to the dominant page background
  // instead of averaging the whole palette. Averaging let a dark footer flip a
  // cream editorial page to "Dark and moody" (cognition.ai regression).
  const isOpaque = (hex) => {
    try {
      return chroma(hex).alpha() >= 0.5;
    } catch {
      return false;
    }
  };
  const pageBg = bgColors.find((c) => isOpaque(c.hex)) || bgColors[0] || null;
  const topText = textColors.find((c) => isOpaque(c.hex)) || textColors[0] || null;

  let atmosphere = "Balanced and professional";
  if (pageBg) {
    try {
      const bgLum = chroma(pageBg.hex).luminance();
      const tone =
        bgLum > 0.8 ? "Bright" :
        bgLum > 0.45 ? "Light" :
        bgLum > 0.12 ? "Mid-tone" :
        "Dark";

      let contrastPart = "";
      if (topText) {
        const ratio = chroma.contrast(pageBg.hex, topText.hex);
        contrastPart =
          ratio >= 10 ? ", high contrast" :
          ratio >= 5 ? ", strong contrast" :
          ", soft contrast";
      }

      const accent = dedupedPalette.find((c) => {
        try {
          const [, s, l] = chroma(c.hex).hsl();
          return (s || 0) > 0.5 && l > 0.15 && l < 0.85 &&
            c.hex !== pageBg.hex.toLowerCase() &&
            (!topText || c.hex !== topText.hex.toLowerCase());
        } catch {
          return false;
        }
      });
      const accentPart = accent ? ` and ${describeColor(accent.hex).toLowerCase()} accents` : "";

      const textPart = topText ? ` with ${describeColor(topText.hex).toLowerCase()} text` : "";
      atmosphere = `${tone}${contrastPart}; ${describeColor(pageBg.hex).toLowerCase()} background dominates${textPart}${accentPart}`;
    } catch {
      // keep default
    }
  }

  // Line heights, clustered to 0.5px with 0px dropped (0px line-height hides
  // text; it's never a real scale value).
  const lhFreq = {};
  for (const [val, freq] of topByFreq(raw.lineHeights || {}, 20)) {
    const lk = clusterLh(val);
    if (lk) lhFreq[lk] = (lhFreq[lk] || 0) + freq;
  }
  const lineHeightList = topByFreq(lhFreq, 10).map(([val, freq]) => ({ val, freq: round2(freq) }));

  // Letter spacings
  const letterSpacingList = topByFreq(raw.letterSpacings || {}, 6)
    .map(([val, freq]) => ({ val, freq: round2(freq) }));

  // Components. Pass the page background so the primary-button pick can
  // tie-break saturated-but-neutral CTAs (a black button on white) by contrast.
  const pageBgHex = pageBg ? pageBg.hex : null;
  const components = analyzeComponents(raw.components, pageBgHex);

  // The brand's primary/CTA color: accent evidence, then the representative
  // solid button background (unless it just matches the page background),
  // never text ink.
  let solidBtnBgHex = null;
  if (components.buttons && isSolidFill(components.buttons.bg)) {
    const h = toHex(components.buttons.bg);
    if (h && h.toLowerCase() !== (pageBgHex || "").toLowerCase()) solidBtnBgHex = h.toLowerCase();
  }
  const primaryColor = pickPrimaryAccent(dedupedPalette, solidBtnBgHex);

  // Truly no design signal at all (no colors, fonts, sizes, spacing, radii, or
  // shadows) is not a design system. Flag it so generate refuses to fabricate
  // ("Balanced and professional", "system-ui") instead of inventing one.
  const insufficient =
    dedupedPalette.length === 0 &&
    Object.keys(fontsDeduped).length === 0 &&
    sizeList.length === 0 &&
    spacingList.length === 0 &&
    radiiList.length === 0 &&
    shadowList.length === 0;

  // Per-domain observation weight, so generate can tag sparse sections with
  // "(low confidence)" instead of turning absence into confident rules.
  const sumVals = (obj) => Object.values(obj || {}).reduce((s, v) => s + v, 0);
  const evidence = {
    fontObs: round2(sumVals(fontsDeduped)),
    colorObs: round2(sumVals(raw.colors?.background) + sumVals(raw.colors?.text)),
    radiiObs: round2(sumVals(raw.radii)),
    shadowObs: round2(sumVals(raw.shadows)),
    bodyTextLength: raw.bodyTextLength ?? null,
  };

  return {
    title: raw.title,
    url: raw.url,
    finalUrl: raw.finalUrl || raw.url,
    provenance: raw.provenance || null,
    blockLikely: raw.blockLikely || false,
    insufficient,
    evidence,
    motion: raw.motion || null,
    atmosphere,
    palette: dedupedPalette,
    primaryColor,
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
    spacingGrid,
    radii: radiiList,
    shadows: shadowList,
    components,
    cssVars,
  };
}
