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
  lines.push(`**Overall mood:** ${tokens.atmosphere}`);
  lines.push("");

  const density = tokens.spacing.length > 10 ? "Moderate" : "Compact";
  lines.push(
    `**Density:** ${density}. The layout uses a ${tokens.spacing.length > 8 ? "varied" : "tight"} spacing scale.`
  );
  lines.push("");

  if (tokens.radii.length > 0) {
    const maxRadius = tokens.radii[tokens.radii.length - 1]?.val || "0px";
    const style =
      parseFloat(maxRadius) > 12
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

  for (const color of tokens.palette) {
    lines.push(`- **${color.name}** (\`${color.hex}\`) — ${color.role}`);
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
      `**Border radii:** ${tokens.radii.map((r) => r.val).join(", ")}`
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
    lines.push(`- Don't use border-radius values outside: ${tokens.radii.map((r) => r.val).join(", ")}`);
  }
  lines.push("");

  // Dark mode section
  if (tokens.dark) {
    lines.push("## 6. Dark Theme Overrides");
    lines.push("");
    lines.push(`**Overall mood:** ${tokens.dark.atmosphere}`);
    lines.push("");
    if (tokens.dark.palette.length > 0) {
      lines.push("**Colors:**");
      for (const color of tokens.dark.palette) {
        lines.push(`- **${color.name}** (\`${color.hex}\`) — ${color.role}`);
      }
      lines.push("");
    }
  }

  // Usage notes
  lines.push("---");
  lines.push("");
  lines.push(
    "*This DESIGN.md was generated by [brandmd](https://github.com/yuvrajangadsingh/brandmd). Drop it into your project root and AI coding agents (Claude Code, Cursor, Gemini CLI) will use it to generate on-brand UI.*"
  );

  return lines.join("\n");
}
