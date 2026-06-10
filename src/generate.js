/**
 * Generate a DESIGN.md file from analyzed tokens.
 * Follows the Stitch DESIGN.md 5-section format.
 */
export function generate(tokens) {
  const lines = [];

  const siteName = tokens.title || new URL(tokens.url).hostname;

  lines.push(`# Design System: ${siteName}`);
  lines.push("");
  if (tokens.sources && tokens.sources.length > 1) {
    lines.push(`> Extracted from ${tokens.sources.length} pages by brandmd:`);
    for (const src of tokens.sources) {
      lines.push(`> - [${src}](${src})`);
    }
  } else {
    lines.push(`> Extracted from [${tokens.url}](${tokens.url}) by brandmd`);
  }
  lines.push("");

  // Section 1: Visual Theme & Atmosphere
  lines.push("## 1. Visual Theme & Atmosphere");
  lines.push("");
  lines.push(`**Visual character:** ${tokens.atmosphere}`);
  lines.push("");

  const density = tokens.spacing.length > 10 ? "Moderate" : "Compact";
  lines.push(
    `**Density:** ${density}. The layout uses a ${tokens.spacing.length > 8 ? "varied" : "tight"} spacing scale.`
  );
  lines.push("");

  if (tokens.radii.length > 0) {
    // Pill radii (9999px buttons) say nothing about the overall shape
    // language; judge it from the largest non-pill radius instead.
    const nonPill = tokens.radii.filter((r) => !r.pill && !r.val.includes("%"));
    const maxRadius = nonPill.length ? nonPill[nonPill.length - 1].val : null;
    const style = maxRadius === null
      ? "Sharp edges with pill-shaped interactive elements"
      : parseFloat(maxRadius) > 12
        ? "Rounded, friendly aesthetic with generous corner radii"
        : parseFloat(maxRadius) > 4
          ? "Subtle rounding on interactive elements"
          : "Sharp, geometric edges";
    lines.push(`**Shape language:** ${style}.`);
    lines.push("");
  }

  if (tokens.shadows.length > 0) {
    lines.push(
      `**Depth:** Uses ${tokens.shadows.length} shadow style${tokens.shadows.length > 1 ? "s" : ""} for layering and elevation.`
    );
    lines.push("");
  } else {
    lines.push("**Depth:** Flat design with minimal shadow usage.");
    lines.push("");
  }

  // Section 2: Color Palette & Roles
  lines.push("## 2. Color Palette & Roles");
  lines.push("");

  // Dominant and accent tokens get full bullets; incidental low-usage values
  // collapse to one line so agents weight the palette the way the site does.
  const mainColors = tokens.palette.filter((c) => c.tier !== "incidental");
  const incidentalColors = tokens.palette.filter((c) => c.tier === "incidental");
  for (const color of mainColors.length ? mainColors : tokens.palette) {
    const tierTag = color.tier === "dominant" ? " (dominant)" : "";
    lines.push(`- **${color.name}** (\`${color.hex}\`): ${color.role}${tierTag}`);
  }
  if (mainColors.length && incidentalColors.length) {
    lines.push("");
    lines.push(
      `**Incidental (low usage, do not lead with these):** ${incidentalColors.map((c) => `\`${c.hex}\``).join(", ")}`
    );
  }
  lines.push("");

  // Section 3: Typography Rules
  lines.push("## 3. Typography Rules");
  lines.push("");

  lines.push(`**Primary font:** ${tokens.typography.primary}`);
  if (tokens.typography.secondary) {
    lines.push(`**Secondary font:** ${tokens.typography.secondary}`);
  }
  lines.push("");

  // Per-role font breakdown. Surfaces the brand font even when it's only on
  // a few headings (e.g. Vercel-stack sites where Inter wins by count but
  // Geist is the actual heading font).
  const t = tokens.typography;
  const roleLines = [];
  if (t.headingFonts && t.headingFonts.length) {
    roleLines.push(`- Headings: ${t.headingFonts.join(", ")}`);
  }
  if (t.displayFonts && t.displayFonts.length) {
    const display = t.displayFonts.filter((f) => !t.headingFonts?.includes(f));
    if (display.length) roleLines.push(`- Display / hero: ${display.join(", ")}`);
  }
  if (t.bodyFonts && t.bodyFonts.length) {
    roleLines.push(`- Body: ${t.bodyFonts.join(", ")}`);
  }
  if (t.buttonFonts && t.buttonFonts.length) {
    const btn = t.buttonFonts.filter((f) => !t.bodyFonts?.includes(f));
    if (btn.length) roleLines.push(`- Buttons / nav: ${btn.join(", ")}`);
  }
  if (roleLines.length) {
    lines.push("**Fonts by role:**");
    lines.push(...roleLines);
    lines.push("");
  }

  if (t.allDetected && t.allDetected.length > 2) {
    const list = t.allDetected
      .slice(0, 8)
      .map((d) => `${d.font} (${d.count})`)
      .join(", ");
    lines.push(`**All detected fonts:** ${list}`);
    lines.push("");
  }

  if (tokens.typography.sizes.length > 0) {
    lines.push("**Type scale:**");
    const sizes = tokens.typography.sizes;
    const large = sizes.filter((s) => s.px >= 24);
    const medium = sizes.filter((s) => s.px >= 14 && s.px < 24);
    const small = sizes.filter((s) => s.px < 14);

    if (large.length > 0) {
      lines.push(`- Headings: ${large.map((s) => s.size).join(", ")}`);
    }
    if (medium.length > 0) {
      lines.push(`- Body / UI: ${medium.map((s) => s.size).join(", ")}`);
    }
    if (small.length > 0) {
      lines.push(`- Captions / Small: ${small.map((s) => s.size).join(", ")}`);
    }
    lines.push("");
  }

  if (tokens.typography.weights.length > 0) {
    lines.push(
      `**Weights in use:** ${tokens.typography.weights.map((w) => w.weight).join(", ")}`
    );
    lines.push("");
  }

  if (tokens.typography.lineHeights?.length > 0) {
    lines.push(
      `**Line heights:** ${tokens.typography.lineHeights.map((l) => l.val).join(", ")}`
    );
    lines.push("");
  }

  if (tokens.typography.letterSpacings?.length > 0) {
    lines.push(
      `**Letter spacing:** ${tokens.typography.letterSpacings.map((l) => l.val).join(", ")}`
    );
    lines.push("");
  }

  // Section 4: Component Stylings
  lines.push("## 4. Component Stylings");
  lines.push("");

  // Buttons (from real DOM extraction)
  lines.push("### Buttons");
  if (tokens.components?.buttons) {
    const btn = tokens.components.buttons;
    if (btn.bg && btn.bg !== "rgba(0, 0, 0, 0)") lines.push(`- Background: \`${btn.bg}\``);
    if (btn.color) lines.push(`- Text color: \`${btn.color}\``);
    if (btn.radius && btn.radius !== "0px") lines.push(`- Corner radius: ${btn.radius}`);
    if (btn.padding) lines.push(`- Padding: ${btn.padding}`);
    if (btn.fontSize) lines.push(`- Font: ${btn.fontSize}, weight ${btn.fontWeight || "400"}`);
  } else {
    const fallbackRadius = tokens.radii[0]?.val || "0px";
    lines.push(`- Corner radius: ${fallbackRadius}`);
  }
  lines.push("");

  // Cards
  lines.push("### Cards");
  if (tokens.components?.cards) {
    const card = tokens.components.cards;
    if (card.bg && card.bg !== "rgba(0, 0, 0, 0)") lines.push(`- Background: \`${card.bg}\``);
    if (card.radius && card.radius !== "0px") lines.push(`- Corner radius: ${card.radius}`);
    if (card.shadow && card.shadow !== "none") lines.push(`- Shadow: \`${card.shadow}\``);
    if (card.padding) lines.push(`- Padding: ${card.padding}`);
  } else {
    if (tokens.shadows.length > 0) lines.push(`- Shadow: \`${tokens.shadows[0].val}\``);
    if (tokens.radii.length > 0) lines.push(`- Corner radius: ${tokens.radii[0].val}`);
  }
  lines.push("");

  // Inputs
  lines.push("### Inputs");
  if (tokens.components?.inputs) {
    const inp = tokens.components.inputs;
    if (inp.bg && inp.bg !== "rgba(0, 0, 0, 0)") lines.push(`- Background: \`${inp.bg}\``);
    if (inp.border) lines.push(`- Border: ${inp.border}`);
    if (inp.radius && inp.radius !== "0px") lines.push(`- Corner radius: ${inp.radius}`);
    if (inp.padding) lines.push(`- Padding: ${inp.padding}`);
    if (inp.fontSize) lines.push(`- Font size: ${inp.fontSize}`);
  } else {
    const borderColor = tokens.palette.find((c) =>
      c.role.includes("border") || c.role.includes("Divider")
    );
    if (borderColor) lines.push(`- Border color: \`${borderColor.hex}\``);
  }
  lines.push("");

  // Section 5: Layout Principles
  lines.push("## 5. Layout Principles");
  lines.push("");

  if (tokens.spacing.length > 0) {
    // Find the most common spacing values (likely the base grid)
    const topSpacings = [...tokens.spacing]
      .sort((a, b) => b.freq - a.freq)
      .slice(0, 8)
      .sort((a, b) => a.px - b.px);

    lines.push(
      `**Spacing scale:** ${topSpacings.map((s) => s.val).join(", ")}`
    );
    lines.push("");

    // Try to detect base unit
    const spacingValues = topSpacings.map((s) => s.px);
    const possibleBase = spacingValues.find(
      (v) => v === 4 || v === 8 || v === 16
    );
    if (possibleBase) {
      lines.push(
        `**Base unit:** ${possibleBase}px grid (values are mostly multiples of ${possibleBase}).`
      );
      lines.push("");
    }
  }

  if (tokens.radii.length > 0) {
    lines.push(
      `**Border radii:** ${tokens.radii.map((r) => (r.pill ? `${r.val} (pill)` : r.val)).join(", ")}`
    );
    lines.push("");
  }

  // Section 6: Guidelines
  lines.push("## 6. Guidelines");
  lines.push("");
  lines.push("### Do");

  const topSpacingsForGrid = [...tokens.spacing]
    .sort((a, b) => b.freq - a.freq)
    .slice(0, 8)
    .sort((a, b) => a.px - b.px);
  const spacingValues = topSpacingsForGrid.map((s) => s.px);
  const baseUnit = spacingValues.find((v) => v === 4 || v === 8 || v === 16);
  if (baseUnit) lines.push(`- Use ${baseUnit}px grid for all spacing`);

  const primaryColor = tokens.palette.find(
    (c) => c.role.includes("Accent") || c.role.includes("Primary") || c.role.includes("Link")
  );
  if (primaryColor) {
    lines.push(`- Use \`${primaryColor.hex}\` for primary actions and CTAs`);
  }

  if (tokens.typography.weights.length <= 4) {
    lines.push(
      `- Stick to ${tokens.typography.weights.length} font weights: ${tokens.typography.weights.map((w) => w.weight).join(", ")}`
    );
  }
  lines.push(`- Use \`${tokens.typography.primary}\` as the primary typeface`);
  lines.push("");

  lines.push("### Don't");
  lines.push("- Don't introduce colors outside the palette above");
  if (tokens.typography.secondary) {
    lines.push(`- Don't mix fonts beyond ${tokens.typography.primary} and ${tokens.typography.secondary}`);
  } else {
    lines.push(`- Don't mix fonts. Use ${tokens.typography.primary} everywhere`);
  }
  lines.push("- Don't use inline styles when the design system covers the pattern");
  if (tokens.radii.length > 0) {
    lines.push(`- Don't use border-radius values outside: ${tokens.radii.map((r) => (r.pill ? `${r.val} (pill)` : r.val)).join(", ")}`);
  }
  lines.push("");

  // Dark mode section
  if (tokens.dark) {
    lines.push("## 6. Dark Theme Overrides");
    lines.push("");
    lines.push(`**Visual character:** ${tokens.dark.atmosphere}`);
    lines.push("");
    if (tokens.dark.palette.length > 0) {
      lines.push("**Colors:**");
      for (const color of tokens.dark.palette) {
        lines.push(`- **${color.name}** (\`${color.hex}\`): ${color.role}`);
      }
      lines.push("");
    }
  }

  // Visual identity beyond CSS: the layer Gemini sees that grep can't.
  if (tokens.vision) {
    const v = tokens.vision;
    lines.push("## 7. Visual Identity Beyond CSS");
    lines.push("");
    if (v.illustration_style && v.illustration_style !== "none") {
      lines.push(`**Illustration style:** ${v.illustration_style}`);
    }
    if (v.photography_mood && v.photography_mood !== "none") {
      lines.push(`**Photography mood:** ${v.photography_mood}`);
    }
    if (v.copywriting_voice) {
      lines.push(`**Copywriting voice:** ${v.copywriting_voice}`);
    }
    if (v.microcopy_patterns && v.microcopy_patterns.length > 0) {
      lines.push("");
      lines.push("**Microcopy patterns:**");
      for (const p of v.microcopy_patterns) {
        lines.push(`- ${p}`);
      }
    }
    if (v.notes) {
      lines.push("");
      lines.push(`> ${v.notes}`);
    }
    lines.push("");
  }

  // Usage notes
  lines.push("---");
  lines.push("");
  lines.push(
    "*This DESIGN.md was generated by [brandmd](https://github.com/yuvrajangadsingh/brandmd). Drop it into your project root and AI coding agents (Claude Code, Cursor, Gemini CLI) will use it to generate on-brand UI.*"
  );

  return lines.join("\n");
}
