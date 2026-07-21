import chroma from "chroma-js";

/**
 * Generate a spec-valid DESIGN.md from analyzed tokens.
 *
 * Output follows the official DESIGN.md format (github.com/google-labs-code/design.md):
 * YAML frontmatter with machine-readable tokens (colors, typography, rounded,
 * spacing, components) followed by canonical markdown sections in order:
 * Overview, Colors, Typography, Layout, Elevation & Depth, Shapes, Components,
 * Do's and Don'ts. Validates clean under `@google/design.md lint`.
 *
 * brandmd's extra value (tiered palette, evidence-based character, confidence
 * tags, dark overrides) lives inside the canonical structure as prose.
 */
export function generate(tokens) {
  // Refuse to invent a design system from nothing (F-21). The CLI gates on this
  // earlier with a distinct exit code; this is the backstop for direct callers.
  if (tokens.insufficient) {
    throw new Error("insufficient evidence: no colors or fonts were extracted, so there is no design system to describe");
  }
  const model = buildModel(tokens);
  const front = emitFrontmatter(model);
  const body = emitBody(tokens, model);
  return `${front}\n\n${body}`;
}

// ---------------------------------------------------------------------------
// Token model: map analyzed tokens onto spec token names (Material-role names,
// which the official linter treats as first-class so they never read as
// orphaned) and pre-resolve every reference so the file lints clean.
// ---------------------------------------------------------------------------

function safeChroma(hex) {
  try {
    return chroma(hex);
  } catch {
    return null;
  }
}

function lum(hex) {
  const c = safeChroma(hex);
  return c ? c.luminance() : 0;
}

/** Best readable on-color (near-black or white) for a background. */
function onColor(bgHex) {
  const black = "#1a1a1a";
  const white = "#ffffff";
  const cb = safeChroma(bgHex) ? chroma.contrast(bgHex, black) : 0;
  const cw = safeChroma(bgHex) ? chroma.contrast(bgHex, white) : 0;
  return cw >= cb ? white : black;
}

function contrastOk(a, b) {
  if (!safeChroma(a) || !safeChroma(b)) return false;
  return chroma.contrast(a, b) >= 4.5;
}

const lc = (hex) => (hex ? String(hex).toLowerCase() : hex);

function buildModel(tokens) {
  const palette = tokens.palette || [];
  const byRole = (r) => palette.find((c) => c.role === r);

  // --- Colors -> Material-style role tokens -------------------------------
  const colors = {}; // token name -> hex (lowercase)
  const put = (name, hex) => {
    if (hex && safeChroma(hex)) colors[name] = lc(chroma(hex).hex());
  };

  const pageBg = byRole("Page background") || palette.find((c) => c.type === "background");
  const primaryText = byRole("Primary text") || palette.find((c) => c.type === "text");
  const surface = byRole("Surface / card background") || byRole("Secondary background");
  const secondaryText = byRole("Secondary text") || byRole("Muted text");
  const border = byRole("Divider / border") || palette.find((c) => c.type === "border");
  const border2 = palette.filter((c) => c.type === "border")[1];

  put("background", pageBg?.hex);
  put("on-background", primaryText?.hex);
  if (surface && surface.hex !== pageBg?.hex) put("surface", surface.hex);
  if (secondaryText && secondaryText.hex !== primaryText?.hex) put("on-surface-variant", secondaryText.hex);
  put("outline", border?.hex);
  if (border2 && border2.hex !== border?.hex) put("outline-variant", border2.hex);

  // primary = the brand accent when one was observed. analyze ranks the
  // evidence (accent roles > representative solid button bg > vivid palette
  // color) and NEVER hands back text ink, so a monochrome page's body text is
  // never sold as the machine-readable action color. With no accent evidence at
  // all, `primary` mirrors the dominant background neutral — the linter needs a
  // `primary` token, and the background is the only honest color to give it —
  // and the Colors prose flags it explicitly as a low-confidence fallback.
  const solidBtn = tokens.components?.buttons;
  const solidBtnBg = (solidBtn && safeChroma(solidBtn.bg) && chroma(solidBtn.bg).alpha() >= 0.5)
    ? solidBtn.bg : null;
  const accentHex = tokens.primaryColor?.hex;
  let primaryNeutralFallback = false;
  let primaryHex = accentHex;
  if (!primaryHex) {
    primaryHex = pageBg?.hex || surface?.hex || "#ffffff";
    primaryNeutralFallback = true;
  }
  put("primary", primaryHex);
  put("on-primary", onColor(colors.primary));

  // A distinct secondary accent (a second saturated color), if the palette has one.
  const secondAccent = palette.find((c) => {
    if (!safeChroma(c.hex) || lc(c.hex) === colors.primary) return false;
    const [, s, l] = chroma(c.hex).hsl();
    return (s || 0) > 0.4 && l > 0.2 && l < 0.85;
  });
  if (secondAccent) {
    put("secondary", secondAccent.hex);
    put("on-secondary", onColor(colors.secondary));
  }

  // --- Typography levels --------------------------------------------------
  // primary can be null: min-support is a hard invariant, and a count-1 font is
  // never silently selected. With no supported font, the typography block is
  // omitted (a linter info/warning on a degenerate capture beats an invented
  // "system-ui" brand font — honesty over symmetry).
  const primaryFont = tokens.typography?.primary || null;
  const bodyFont = tokens.typography?.bodyFonts?.[0] || primaryFont;
  const typography = {}; // level -> props

  if (primaryFont) {
    const sizes = (tokens.typography?.sizes || []).filter((s) => s.px > 0);
    const desc = [...sizes].sort((a, b) => b.px - a.px);
    const domWeight = (tokens.typography?.weights || []).slice().sort((a, b) => b.freq - a.freq)[0]?.weight;

    const usedPx = new Set();
    const addLevel = (name, sizeObj, font, fallbackWeight) => {
      if (!sizeObj || usedPx.has(sizeObj.px)) return false;
      usedPx.add(sizeObj.px);
      const t = { fontFamily: font, fontSize: `${sizeObj.px}px`, fontWeight: Number(sizeObj.weight || fallbackWeight || domWeight || 400) };
      const lh = normalizeLineHeight(sizeObj.lineHeight, sizeObj.px);
      if (lh) t.lineHeight = lh;
      typography[name] = t;
      return true;
    };

    // display / headline from the largest steps, body from the mid, label from small.
    const large = desc.filter((s) => s.px >= 24);
    const mid = desc.filter((s) => s.px >= 14 && s.px < 24).sort((a, b) => b.freq - a.freq);
    const small = desc.filter((s) => s.px < 14).sort((a, b) => b.freq - a.freq);

    if (large[0]) addLevel(large[0].px >= 32 ? "display" : "headline-lg", large[0], primaryFont, 600);
    if (large[1]) addLevel("headline-lg", large[1], primaryFont, 600);
    if (large[2]) addLevel("headline-md", large[2], primaryFont, 600);
    // body-md is the workhorse (most frequent mid size); body-lg the larger mid.
    if (mid[0]) addLevel("body-md", mid[0], bodyFont, 400);
    const bodyLg = mid.find((s) => !usedPx.has(s.px));
    if (bodyLg) addLevel("body-lg", bodyLg, bodyFont, 400);
    if (small[0]) addLevel("label-sm", small[0], bodyFont, 500);

    // At least one typography token when a real font exists (the linter warns
    // on colors-without-typography).
    if (Object.keys(typography).length === 0) {
      typography["body-md"] = { fontFamily: primaryFont, fontSize: "16px", fontWeight: 400, lineHeight: 1.5 };
    }
  }

  // --- Rounded scale (uniform radii only; asymmetric/% -> prose only) ------
  const rounded = {};
  const uniformRadii = (tokens.radii || [])
    .filter((r) => !r.val.includes(" ") && !r.val.includes("%"))
    .map((r) => ({ ...r, px: parseFloat(r.val) }))
    .filter((r) => isFinite(r.px));
  const pills = uniformRadii.filter((r) => r.pill || r.px >= 999);
  const nonPill = uniformRadii.filter((r) => !(r.pill || r.px >= 999)).sort((a, b) => a.px - b.px);
  const roundedNames = ["sm", "md", "lg", "xl", "2xl", "3xl"];
  nonPill.slice(0, roundedNames.length).forEach((r, i) => {
    rounded[roundedNames[i]] = `${r.px}px`;
  });
  if (pills.length) rounded.full = "9999px";

  // --- Spacing scale (distinct values; base = most frequent) --------------
  const spacing = {};
  const spacingRanked = [...(tokens.spacing || [])].sort((a, b) => b.freq - a.freq);
  if (spacingRanked.length) {
    const basePx = spacingRanked[0].px;
    spacing.base = `${basePx}px`;
    // Named scale from the distinct values (excluding the base), low→high.
    const seen = new Set([basePx]);
    const scale = spacingRanked
      .filter((s) => !seen.has(s.px) && (seen.add(s.px), true))
      .sort((a, b) => a.px - b.px)
      .slice(0, 5);
    ["xs", "sm", "md", "lg", "xl"].forEach((n, i) => {
      if (scale[i]) spacing[n] = `${scale[i].px}px`;
    });
  }

  // --- Components (only from real observed evidence; refs always resolve) --
  const components = {};
  // Map a real radius to a `rounded` token ONLY when it's within 1px of the
  // token's value — a square 0px button must never be re-badged as rounded.sm.
  // Otherwise emit the observed value as a literal Dimension (spec-legal).
  const roundedVal = (val) => {
    if (!val) return null;
    const px = parseFloat(val);
    if (val.includes(" ") || val.includes("%") || !isFinite(px) || px < 0) return null;
    if (px >= 999) return rounded.full ? "{rounded.full}" : "9999px";
    let best = null;
    let bestD = Infinity;
    for (const [name, rv] of Object.entries(rounded)) {
      if (name === "full") continue;
      const d = Math.abs(parseFloat(rv) - px);
      if (d < bestD) { bestD = d; best = name; }
    }
    if (best !== null && bestD <= 1) return `{rounded.${best}}`;
    return `${px}px`;
  };
  const padDim = (padding) => {
    if (!padding) return null;
    const top = parseFloat(padding);
    return isFinite(top) && top > 0 ? `${Math.round(top)}px` : null;
  };
  const labelType = typography["label-sm"] ? "label-sm" : (typography["body-md"] ? "body-md" : null);

  // button-primary: ONLY when a real solid (or gradient) button was observed.
  // Never invented from palette colors — a page with no buttons gets no button
  // token. Values are literals from the observed element; textColor only when
  // it clears WCAG AA on the fill (the linter checks contrast).
  if (solidBtnBg) {
    const bp = { backgroundColor: lc(chroma(solidBtnBg).hex()) };
    const realText = safeChroma(solidBtn.color) ? lc(chroma(solidBtn.color).hex()) : null;
    const on = realText && contrastOk(bp.backgroundColor, realText) ? realText : onColor(bp.backgroundColor);
    if (contrastOk(bp.backgroundColor, on)) bp.textColor = on;
    if (labelType) bp.typography = `{typography.${labelType}}`;
    const rr = roundedVal(solidBtn?.radius);
    if (rr) bp.rounded = rr;
    const pd = padDim(solidBtn?.padding);
    if (pd) bp.padding = pd;
    if (solidBtn?.height && parseFloat(solidBtn.height) > 0) bp.height = `${parseFloat(solidBtn.height)}px`;
    components["button-primary"] = bp;

    // A gradient CTA keeps every stop in the machine layer. The spec constrains
    // component sub-tokens (a `gradient` field would lint as unknown), but
    // variant component names are free-form — so the extra stops ride as
    // explicitly-named gradient-stop variants, and the prose prints the full
    // computed gradient.
    if (solidBtn?.gradient?.length > 1) {
      solidBtn.gradient.slice(1, 4).forEach((stop, i) => {
        const h = safeChroma(stop) ? lc(chroma(stop).hex()) : null;
        if (h) components[`button-primary-gradient-stop-${i + 2}`] = { backgroundColor: h };
      });
    }
  }

  // button-secondary (ghost): transparent fill, NO textColor (transparent bg +
  // textColor trips the linter's contrast check; the real text color is in prose).
  const ghost = tokens.components?.ghostButton;
  if (ghost) {
    const bs = { backgroundColor: "transparent" };
    if (labelType) bs.typography = `{typography.${labelType}}`;
    const rr = roundedVal(ghost.radius);
    if (rr) bs.rounded = rr;
    const pd = padDim(ghost.padding);
    if (pd) bs.padding = pd;
    if (ghost.height && parseFloat(ghost.height) > 0) bs.height = `${parseFloat(ghost.height)}px`;
    components["button-secondary"] = bs;
  }

  // card
  const card = tokens.components?.cards;
  if (card) {
    const cc = {};
    const bgHex = safeChroma(card.bg) && chroma(card.bg).alpha() >= 0.5 ? lc(chroma(card.bg).hex()) : null;
    if (bgHex) {
      if (colors.surface === bgHex) cc.backgroundColor = "{colors.surface}";
      else if (colors.background === bgHex) cc.backgroundColor = "{colors.background}";
      else { colors.surface = bgHex; cc.backgroundColor = "{colors.surface}"; }
    } else if (colors.surface) {
      cc.backgroundColor = "{colors.surface}";
    }
    const rr = roundedVal(card.radius);
    if (rr) cc.rounded = rr;
    const pd = padDim(card.padding);
    if (pd) cc.padding = pd;
    if (Object.keys(cc).length) components["card"] = cc;
  }

  // input
  const input = tokens.components?.inputs;
  if (input) {
    const ic = {};
    const bgHex = safeChroma(input.bg) && chroma(input.bg).alpha() >= 0.5 ? lc(chroma(input.bg).hex()) : null;
    if (bgHex && colors.surface === bgHex) ic.backgroundColor = "{colors.surface}";
    else if (bgHex && colors.background === bgHex) ic.backgroundColor = "{colors.background}";
    if (colors["on-background"] && ic.backgroundColor) {
      const bg = ic.backgroundColor === "{colors.surface}" ? colors.surface : colors.background;
      if (contrastOk(bg, colors["on-background"])) ic.textColor = "{colors.on-background}";
    }
    if (labelType) ic.typography = `{typography.body-md}`.replace("body-md", typography["body-md"] ? "body-md" : labelType);
    const rr = roundedVal(input.radius);
    if (rr) ic.rounded = rr;
    const pd = padDim(input.padding);
    if (pd) ic.padding = pd;
    if (Object.keys(ic).length) components["input"] = ic;
  }

  const name = sanitizeLine(tokens.title) || hostOf(tokens.url);
  const description = sanitizeLine(shortDescription(tokens.atmosphere));
  return { name, description, colors, typography, rounded, spacing, components, primaryFont, bodyFont, primaryNeutralFallback };
}

/**
 * Emit the ### Buttons / ### Cards / ### Inputs prose subsections from real
 * observed component data. Buttons only exist when a button was sampled. Cards
 * and Inputs may fall back to page-level tokens, but the fallback is labeled as
 * page-level, never passed off as observed component styling.
 */
function emitComponentProse(lines, tokens) {
  const hexish = (css) => {
    const c = safeChroma(css);
    return c ? lc(c.hex()) : css;
  };
  // A gradient button keeps its full fill in prose: the raw computed
  // background-image when we captured it, else reconstructed from the stops.
  const bgLine = (b) => {
    if (b.gradient?.length) {
      const g = b.gradientRaw || `linear-gradient(${b.gradient.join(", ")})`;
      return `- Background: \`${g}\` (gradient; first stop \`${hexish(b.gradient[0])}\`)`;
    }
    if (safeChroma(b.bg) && chroma(b.bg).alpha() >= 0.5) return `- Background: \`${hexish(b.bg)}\``;
    return null;
  };

  // --- Buttons: only when a real button was sampled. Radius always printed,
  // including a true 0px (square corners are a design fact, not a gap). ---
  const btn = tokens.components?.buttons || tokens.components?.ghostButton;
  if (btn) {
    const btnLines = [];
    const bgl = bgLine(btn);
    if (bgl) btnLines.push(bgl);
    if (btn.color) btnLines.push(`- Text color: \`${hexish(btn.color)}\``);
    if (btn.radius) btnLines.push(`- Corner radius: ${btn.radius}`);
    if (btn.height) btnLines.push(`- Height: ${btn.height}`);
    if (btn.padding) btnLines.push(`- Padding: ${btn.padding}`);
    if (btn.fontSize) btnLines.push(`- Font: ${btn.fontSize}, weight ${btn.fontWeight || "400"}`);
    if (btnLines.length) {
      lines.push("### Buttons");
      lines.push(...btnLines);
      lines.push("");
    }
  }

  // --- Cards: only when a card was actually sampled — no page-level
  // fabrication (empty component subsections are omitted entirely). ---
  const card = tokens.components?.cards;
  if (card) {
    const cardLines = [];
    if (card.bg && card.bg !== "rgba(0, 0, 0, 0)") cardLines.push(`- Background: \`${hexish(card.bg)}\``);
    if (card.radius) cardLines.push(`- Corner radius: ${card.radius}`);
    if (card.shadow && card.shadow !== "none") cardLines.push(`- Shadow: \`${card.shadow}\``);
    if (card.padding) cardLines.push(`- Padding: ${card.padding}`);
    if (cardLines.length) {
      lines.push("### Cards");
      lines.push(...cardLines);
      lines.push("");
    }
  }

  // --- Inputs: only when sampled. Font size stays LAST. ---
  const input = tokens.components?.inputs;
  if (input) {
    const inputLines = [];
    if (input.bg && input.bg !== "rgba(0, 0, 0, 0)") inputLines.push(`- Background: \`${hexish(input.bg)}\``);
    if (input.border) inputLines.push(`- Border: ${input.border}`);
    if (input.radius) inputLines.push(`- Corner radius: ${input.radius}`);
    if (input.padding) inputLines.push(`- Padding: ${input.padding}`);
    if (input.fontSize) inputLines.push(`- Font size: ${input.fontSize}`);
    if (inputLines.length) {
      lines.push("### Inputs");
      lines.push(...inputLines);
      lines.push("");
    }
  }
}

/** Line-height: keep unitless multiplier; else derive a sane default by size. */
function normalizeLineHeight(lh, px) {
  if (lh) {
    if (/px$/.test(lh)) {
      const l = parseFloat(lh);
      if (l > 0 && px > 0) return Math.round((l / px) * 100) / 100; // -> unitless multiplier
    } else {
      const n = parseFloat(lh);
      if (isFinite(n) && n > 0 && n < 4) return n;
    }
  }
  // Fallback ratio when the capture didn't pair a line-height.
  if (!px) return 1.5;
  return px >= 32 ? 1.1 : px >= 20 ? 1.25 : 1.5;
}

// ---------------------------------------------------------------------------
// YAML frontmatter emission
// ---------------------------------------------------------------------------

function yamlStr(s) {
  return `"${String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

/** Bare scalar when safe (font names, dimensions), quoted otherwise. */
function yamlBare(s) {
  const str = String(s);
  if (str === "" || /^[\s]|[\s]$/.test(str) || /[:#{}[\],&*?|<>=!%@`"']/.test(str)) return yamlStr(str);
  return str;
}

function emitFrontmatter(model) {
  const L = ["---", "version: alpha"];
  L.push(`name: ${yamlStr(model.name || "Untitled")}`);
  if (model.description) L.push(`description: ${yamlStr(model.description)}`);

  if (Object.keys(model.colors).length) {
    L.push("colors:");
    for (const [k, v] of Object.entries(model.colors)) L.push(`  ${k}: ${yamlStr(v)}`);
  }
  if (Object.keys(model.typography).length) {
    L.push("typography:");
    for (const [level, props] of Object.entries(model.typography)) {
      L.push(`  ${level}:`);
      L.push(`    fontFamily: ${yamlBare(props.fontFamily)}`);
      L.push(`    fontSize: ${yamlBare(props.fontSize)}`);
      L.push(`    fontWeight: ${props.fontWeight}`);
      if (props.lineHeight != null) L.push(`    lineHeight: ${props.lineHeight}`);
      if (props.letterSpacing) L.push(`    letterSpacing: ${yamlBare(props.letterSpacing)}`);
    }
  }
  if (Object.keys(model.rounded).length) {
    L.push("rounded:");
    for (const [k, v] of Object.entries(model.rounded)) L.push(`  ${k}: ${yamlBare(v)}`);
  }
  if (Object.keys(model.spacing).length) {
    L.push("spacing:");
    for (const [k, v] of Object.entries(model.spacing)) L.push(`  ${k}: ${yamlBare(v)}`);
  }
  if (Object.keys(model.components).length) {
    L.push("components:");
    for (const [name, props] of Object.entries(model.components)) {
      L.push(`  ${name}:`);
      for (const [k, v] of Object.entries(props)) {
        // refs and the `transparent` keyword are bare-safe via quoting rules;
        // refs must be quoted because of the braces.
        const val = /^\{.*\}$/.test(v) ? yamlStr(v) : yamlBare(v);
        L.push(`    ${k}: ${val}`);
      }
    }
  }
  L.push("---");
  return L.join("\n");
}

// ---------------------------------------------------------------------------
// Markdown body — canonical sections in canonical order
// ---------------------------------------------------------------------------

function emitBody(tokens, model) {
  const lines = [];
  const siteName = model.name;

  lines.push(`# Design System: ${siteName}`);
  lines.push("");

  // Provenance
  if (tokens.sources && tokens.sources.length > 1) {
    lines.push(`> Extracted from ${tokens.sources.length} pages by brandmd:`);
    for (const src of tokens.sources) lines.push(`> - [${src}](${src})`);
  } else {
    lines.push(`> Extracted from [${tokens.url}](${tokens.url}) by brandmd`);
  }
  lines.push("");

  // Redirect / login provenance warning. Multi-page runs list every offending
  // page — a docs URL landing on SSO matters even when the homepage was fine.
  const p = tokens.provenance;
  if (p && (p.crossOrigin || p.loginLike || (p.redirected && p.finalUrl !== tokens.url))) {
    const per = (p.pages || [p]).filter((pg) => pg.crossOrigin || pg.loginLike || pg.redirected);
    if (per.length > 1) {
      lines.push("> ⚠️ **Provenance:** some requests did not land where asked. These tokens may describe those pages, not the URLs you asked for:");
      for (const pg of per) {
        const what = [];
        if (pg.crossOrigin) what.push("different origin");
        else if (pg.redirected) what.push("redirected");
        if (pg.loginLike) what.push("login-like");
        lines.push(`> - \`${pg.requestedUrl}\` → \`${pg.finalUrl}\` (${what.join(", ")})`);
      }
    } else {
      // Single offending page: use ITS urls, not the merged top-level ones —
      // in a multi-page run the flagged page may not be pages[0].
      const pg = per[0] || p;
      const flags = [];
      if (pg.crossOrigin) flags.push(`\`${pg.requestedUrl}\` landed on a different origin (\`${pg.finalUrl}\`)`);
      else if (pg.redirected) flags.push(`\`${pg.requestedUrl}\` redirected to \`${pg.finalUrl}\``);
      if (pg.loginLike) flags.push("the landing looks like a login / sign-in wall");
      lines.push(`> ⚠️ **Provenance:** ${flags.join(" and ")}. These tokens may describe that page, not the URL you asked for.`);
    }
    lines.push("");
  }

  if (tokens.blockLikely) {
    lines.push("> ⚠️ **Likely a block / access-denied page.** The source returned a bot-protection or error page, not the real site, so the tokens below are probably meaningless. Re-run against a non-protected page (e.g. `/docs`, `/pricing`).");
    lines.push("");
  }

  // 1. Overview
  lines.push("## Overview");
  lines.push("");
  lines.push(`**Visual character:** ${tokens.atmosphere}`);
  lines.push("");
  const density = (tokens.spacing?.length || 0) > 10 ? "spacious" : "compact";
  lines.push(`**Density:** ${density}. The layout uses a ${(tokens.spacing?.length || 0) > 8 ? "varied" : "tight"} spacing scale.`);
  lines.push("");
  const motionLine = motionText(tokens.motion);
  if (motionLine) {
    lines.push(motionLine);
    lines.push("");
  }

  // 2. Colors
  lines.push("## Colors");
  lines.push("");
  const mainColors = (tokens.palette || []).filter((c) => c.tier !== "incidental");
  const incidental = (tokens.palette || []).filter((c) => c.tier === "incidental");
  const lowConfColors = mainColors.length < 2;
  lines.push(`Palette extracted from the live page${lowConfColors ? " _(low confidence: few distinct colors observed)_" : ""}. Token names below map to the machine-readable \`colors\` block above.`);
  lines.push("");
  if (model.primaryNeutralFallback) {
    lines.push("_No explicit accent or action color was observed on this page. The machine token `primary` mirrors the dominant background neutral (low confidence) — do not treat it as a call-to-action color._");
    lines.push("");
  }
  for (const color of (mainColors.length ? mainColors : tokens.palette || [])) {
    const tierTag = color.tier === "dominant" ? " (dominant)" : color.tier === "accent" ? " (accent)" : "";
    lines.push(`- **${describeName(color)}** (\`${lc(color.hex)}\`): ${color.role}${tierTag}`);
  }
  if (mainColors.length && incidental.length) {
    lines.push("");
    lines.push(`**Incidental (low usage, do not lead with these):** ${incidental.map((c) => `\`${lc(c.hex)}\``).join(", ")}`);
  }
  lines.push("");

  // 3. Typography
  lines.push("## Typography");
  lines.push("");
  const fontObs = tokens.evidence?.fontObs ?? null;
  if (fontObs != null && fontObs > 0 && fontObs < 10) {
    lines.push(`_Sparse typography evidence (${fontObs} font observation${fontObs === 1 ? "" : "s"}) — treat this section with low confidence._`);
    lines.push("");
  }
  if (model.primaryFont) {
    lines.push(`**Primary font:** ${model.primaryFont}`);
    if (tokens.typography?.secondary) lines.push(`**Secondary font:** ${tokens.typography.secondary}`);
  } else {
    lines.push("_No primary font established: no font cleared the minimum-support bar (low confidence). The fonts observed are listed below as raw evidence only._");
  }
  lines.push("");
  const roleLines = [];
  const t = tokens.typography || {};
  if (t.headingFonts?.length) roleLines.push(`- Headings: ${t.headingFonts.join(", ")}`);
  if (t.displayFonts?.length) {
    const d = t.displayFonts.filter((f) => !t.headingFonts?.includes(f));
    if (d.length) roleLines.push(`- Display / hero: ${d.join(", ")}`);
  }
  if (t.bodyFonts?.length) roleLines.push(`- Body: ${t.bodyFonts.join(", ")}`);
  if (t.buttonFonts?.length) {
    const b = t.buttonFonts.filter((f) => !t.bodyFonts?.includes(f));
    if (b.length) roleLines.push(`- Buttons / nav: ${b.join(", ")}`);
  }
  if (roleLines.length) {
    lines.push("**Fonts by role:**");
    lines.push(...roleLines);
    lines.push("");
  }
  if (t.allDetected?.length > 2) {
    const list = t.allDetected.slice(0, 8).map((d) => `${d.font} (${Math.round(d.count)})`).join(", ");
    lines.push(`**All detected fonts:** ${list}`);
    lines.push("");
  }
  const sizes = t.sizes || [];
  if (sizes.length) {
    lines.push("**Type scale:**");
    const large = sizes.filter((s) => s.px >= 24);
    const medium = sizes.filter((s) => s.px >= 14 && s.px < 24);
    const small = sizes.filter((s) => s.px < 14);
    if (large.length) lines.push(`- Headings: ${large.map((s) => s.size).join(", ")}`);
    if (medium.length) lines.push(`- Body / UI: ${medium.map((s) => s.size).join(", ")}`);
    if (small.length) lines.push(`- Captions / Small: ${small.map((s) => s.size).join(", ")}`);
    lines.push("");
  }
  if (t.weights?.length) {
    lines.push(`**Weights in use:** ${t.weights.map((w) => w.weight).join(", ")}`);
    lines.push("");
  }
  if (t.lineHeights?.length) {
    lines.push(`**Line heights:** ${t.lineHeights.map((l) => l.val).join(", ")}`);
    lines.push("");
  }
  if (t.letterSpacings?.length) {
    lines.push(`**Letter spacing:** ${t.letterSpacings.map((l) => l.val).join(", ")}`);
    lines.push("");
  }

  // Rich-page test for the absence branches below: turning "we saw nothing"
  // into a confident design property ("flat design", "sharp edges") is only
  // fair when the page actually gave us enough to look at.
  const richPage = (tokens.evidence?.colorObs ?? 0) >= 40 && (tokens.evidence?.bodyTextLength ?? 0) >= 200;

  // 4. Layout
  lines.push("## Layout");
  lines.push("");
  if (tokens.spacing?.length) {
    const top = [...tokens.spacing].sort((a, b) => b.freq - a.freq).slice(0, 8).sort((a, b) => a.px - b.px);
    lines.push(`**Spacing scale:** ${top.map((s) => s.val).join(", ")}`);
    lines.push("");
    if (tokens.spacingGrid) {
      const pct = Math.round(tokens.spacingGrid.coverage * 100);
      lines.push(`**Base unit:** ${tokens.spacingGrid.base}px grid — ${pct}% of all weighted spacing values are multiples of ${tokens.spacingGrid.base}.`);
      lines.push("");
    }
  } else {
    lines.push("No reliable spacing scale observed _(low confidence)_.");
    lines.push("");
  }

  // 5. Elevation & Depth — shadow VALUES, not just a count
  lines.push("## Elevation & Depth");
  lines.push("");
  if (tokens.shadows?.length) {
    lines.push(`Uses ${tokens.shadows.length} shadow style${tokens.shadows.length > 1 ? "s" : ""} for layering and elevation:`);
    lines.push("");
    tokens.shadows.forEach((s, i) => {
      lines.push(`- Level ${i + 1}: \`${s.val}\``);
    });
    lines.push("");
  } else if (richPage) {
    lines.push("Flat design: hierarchy comes from color contrast and borders, not shadows.");
    lines.push("");
  } else {
    lines.push("No shadow styles observed _(low confidence: sparse evidence — absence here is not proof of a flat design)_.");
    lines.push("");
  }

  // 6. Shapes
  lines.push("## Shapes");
  lines.push("");
  if (tokens.radii?.length) {
    const nonPill = tokens.radii.filter((r) => !r.pill && !r.val.includes("%"));
    const maxR = nonPill.length ? parseFloat(nonPill[nonPill.length - 1].val) : null;
    const style = maxR === null
      ? "Sharp edges with pill-shaped interactive elements"
      : maxR > 12 ? "Rounded, friendly aesthetic with generous corner radii"
      : maxR > 4 ? "Subtle rounding on interactive elements"
      : "Sharp, geometric edges";
    const lowConfShapes = (tokens.evidence?.radiiObs ?? Infinity) < 5 ? " _(low confidence: few radius observations)_" : "";
    lines.push(`**Shape language:** ${style}.${lowConfShapes}`);
    lines.push("");
    lines.push(`**Border radii:** ${tokens.radii.map((r) => (r.pill ? `${r.val} (pill)` : r.val)).join(", ")}`);
    lines.push("");
    const asym = tokens.radii.filter((r) => r.val.includes(" ") || r.val.includes("%"));
    if (asym.length) {
      lines.push(`Asymmetric / percentage radii observed (${asym.map((r) => r.val).join(", ")}); kept out of the ordinal \`rounded\` scale since they don't fit a magnitude order.`);
      lines.push("");
    }
  } else if (richPage) {
    lines.push("**Shape language:** Sharp, geometric edges (no border radius observed).");
    lines.push("");
  } else {
    lines.push("No border radius observed _(low confidence: sparse evidence)_.");
    lines.push("");
  }

  // 7. Components — human-readable observed styles. The machine token values
  // are in the `components` frontmatter block; these prose subsections carry the
  // full observed CSS (background, text, radius, padding, font) per component.
  // Sparse pages get an explicit confidence tag; a page with nothing sampled
  // says so instead of implying observations exist.
  lines.push("## Components");
  lines.push("");
  const comp = tokens.components || {};
  const hasAnyComponent = !!(comp.buttons || comp.ghostButton || comp.cards || comp.inputs);
  if (!hasAnyComponent) {
    lines.push(`No components could be sampled from this page${richPage ? "" : " _(low confidence: sparse evidence)_"}.`);
    lines.push("");
  } else {
    lines.push(`Observed from the live DOM. Machine-readable component tokens are in the \`components\` block above.${richPage ? "" : " _(low confidence: sampled from a sparse page)_"}`);
    lines.push("");
    emitComponentProse(lines, tokens);
  }

  // 8. Do's and Don'ts. Every line here needs real evidence behind it: no CTA
  // rule without accent/button evidence, no typeface rules without a supported
  // primary font, no weight-count rule off a sparse sample.
  lines.push("## Do's and Don'ts");
  lines.push("");
  if (tokens.spacingGrid) lines.push(`- Do use a ${tokens.spacingGrid.base}px grid for spacing`);
  if (tokens.primaryColor?.hex) {
    lines.push(`- Do use \`${lc(tokens.primaryColor.hex)}\` for primary actions and CTAs`);
  }
  const enoughFontEvidence = (tokens.evidence?.fontObs ?? Infinity) >= 10;
  if (model.primaryFont && enoughFontEvidence && (t.weights?.length || 0) > 0 && t.weights.length <= 4) {
    lines.push(`- Do stick to ${t.weights.length} font weights: ${t.weights.map((w) => w.weight).join(", ")}`);
  }
  if (model.primaryFont) {
    lines.push(`- Do use \`${model.primaryFont}\` as the primary typeface`);
  }
  lines.push(`- Don't introduce colors outside the palette above${richPage ? "" : " _(low confidence: palette sampled from sparse evidence)_"}`);
  if (model.primaryFont && tokens.typography?.secondary) {
    lines.push(`- Don't mix fonts beyond ${model.primaryFont} and ${tokens.typography.secondary}`);
  } else if (model.primaryFont) {
    lines.push(`- Don't mix fonts; use ${model.primaryFont} everywhere`);
  }
  if (tokens.radii?.length) {
    lines.push(`- Don't use border-radius values outside: ${tokens.radii.map((r) => (r.pill ? `${r.val} (pill)` : r.val)).join(", ")}`);
  }
  lines.push("");

  // Dark overrides — trailing non-canonical section (linter preserves it).
  if (tokens.dark) {
    lines.push("## Dark Mode Overrides");
    lines.push("");
    lines.push(`**Visual character:** ${tokens.dark.atmosphere}`);
    lines.push("");
    const diffs = darkDiffs(tokens, tokens.dark);
    if (diffs.length) {
      lines.push("Observed differences from the light theme:");
      lines.push("");
      lines.push(...diffs);
      lines.push("");
    }
  }

  // Vision — trailing non-canonical section.
  if (tokens.vision) {
    const v = tokens.vision;
    lines.push("## Visual Identity Beyond CSS");
    lines.push("");
    if (v.illustration_style && v.illustration_style !== "none") lines.push(`**Illustration style:** ${v.illustration_style}`);
    if (v.photography_mood && v.photography_mood !== "none") lines.push(`**Photography mood:** ${v.photography_mood}`);
    if (v.copywriting_voice) lines.push(`**Copywriting voice:** ${v.copywriting_voice}`);
    if (v.microcopy_patterns?.length) {
      lines.push("");
      lines.push("**Microcopy patterns:**");
      for (const p2 of v.microcopy_patterns) lines.push(`- ${p2}`);
    }
    if (v.notes) {
      lines.push("");
      lines.push(`> ${v.notes}`);
    }
    lines.push("");
  }

  lines.push("---");
  lines.push("");
  lines.push("*This DESIGN.md was generated by [brandmd](https://github.com/yuvrajangadsingh/brandmd) and validates against the official [@google/design.md](https://github.com/google-labs-code/design.md) linter. Drop it into your project root and AI coding agents (Claude Code, Cursor, Gemini CLI) will use it to generate on-brand UI.*");

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Small helpers used by the body
// ---------------------------------------------------------------------------

function hostOf(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return url || "Untitled";
  }
}

/**
 * Collapse an untrusted page string (title etc.) to one safe line: newlines and
 * control characters become spaces. A hostile title can otherwise smuggle
 * physical heading/list lines into both the YAML scalar (the official linter
 * rejects raw newlines in quoted scalars) and the markdown body (injected
 * "## Do's and Don'ts" headings / list items).
 */
function sanitizeLine(s) {
  if (s == null) return null;
  const out = String(s)
    .replace(/[\r\n\u2028\u2029]+/g, " ")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return out.length ? out : null;
}

function describeName(color) {
  return color.name || lc(color.hex);
}

function shortDescription(atmosphere) {
  if (!atmosphere) return null;
  const first = atmosphere.split(";")[0].trim();
  return first.length > 140 ? first.slice(0, 137) + "..." : first;
}

function motionText(m) {
  if (!m) return null;
  const surfaces = [];
  if (m.webgl) surfaces.push("WebGL / 3D canvas");
  else if (m.canvas) surfaces.push("canvas rendering");
  if (m.lottie) surfaces.push("Lottie animations");
  if (m.inlineRaf) surfaces.push("scripted animation via requestAnimationFrame");
  if (!surfaces.length) return null;
  return `**Motion:** Animation surfaces detected (${surfaces.join(", ")}). The brand uses motion, so treat static tokens as a floor. Detection is presence-only; it does not describe the animations.`;
}

function darkDiffs(light, dark) {
  const out = [];
  const lp = new Map((light.palette || []).map((c) => [c.role, lc(c.hex)]));
  for (const c of dark.palette || []) {
    const lightHex = lp.get(c.role);
    if (!lightHex) out.push(`- ${c.role}: \`${lc(c.hex)}\` (dark only)`);
    else if (lightHex !== lc(c.hex)) out.push(`- ${c.role}: \`${lightHex}\` → \`${lc(c.hex)}\``);
  }
  if (dark.components?.buttons?.bg && light.components?.buttons?.bg && dark.components.buttons.bg !== light.components.buttons.bg) {
    out.push(`- Primary button background: \`${lc2(light.components.buttons.bg)}\` → \`${lc2(dark.components.buttons.bg)}\``);
  }
  if ((dark.shadows?.length || 0) !== (light.shadows?.length || 0)) {
    out.push(`- Shadow styles: ${light.shadows?.length || 0} → ${dark.shadows?.length || 0}`);
  }
  return out;
}

function lc2(css) {
  try {
    return chroma(css).hex().toLowerCase();
  } catch {
    return css;
  }
}
