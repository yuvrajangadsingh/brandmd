/**
 * Generate CSS custom properties from analyzed tokens.
 */
export function generateCSS(tokens) {
  const lines = [":root {"];

  // Colors
  if (tokens.palette.length > 0) {
    lines.push("  /* Colors */");
    const usedNames = new Set();
    for (const color of tokens.palette) {
      let name = toVarName(color.name, color.role);
      // Deduplicate
      let finalName = name;
      let counter = 2;
      while (usedNames.has(finalName)) {
        finalName = `${name}-${counter++}`;
      }
      usedNames.add(finalName);
      // Don't double-prefix if name already starts with color-
      const prefix = finalName.startsWith("color-") ? "--" : "--color-";
      lines.push(`  ${prefix}${finalName}: ${color.hex};`);
    }
    lines.push("");
  }

  // Typography
  lines.push("  /* Typography */");
  lines.push(`  --font-primary: "${tokens.typography.primary}";`);
  if (tokens.typography.secondary) {
    lines.push(`  --font-secondary: "${tokens.typography.secondary}";`);
  }
  lines.push("");

  // Spacing
  if (tokens.spacing.length > 0) {
    lines.push("  /* Spacing */");
    const top = [...tokens.spacing]
      .sort((a, b) => b.freq - a.freq)
      .slice(0, 8)
      .sort((a, b) => a.px - b.px);
    top.forEach((s, i) => {
      lines.push(`  --space-${i + 1}: ${s.val};`);
    });
    lines.push("");
  }

  // Radii
  if (tokens.radii.length > 0) {
    lines.push("  /* Radii */");
    const names = ["sm", "md", "lg", "xl", "2xl", "3xl", "full"];
    tokens.radii.forEach((r, i) => {
      const suffix = names[i] || `${i + 1}`;
      lines.push(`  --radius-${suffix}: ${r.val};`);
    });
    lines.push("");
  }

  // Shadows
  if (tokens.shadows.length > 0) {
    lines.push("  /* Shadows */");
    const names = ["sm", "md", "lg", "xl", "2xl"];
    tokens.shadows.forEach((s, i) => {
      const suffix = names[i] || `${i + 1}`;
      lines.push(`  --shadow-${suffix}: ${s.val};`);
    });
  }

  lines.push("}");
  return lines.join("\n");
}

function toVarName(name, role) {
  // If name already looks like a CSS var, strip the --
  if (name.startsWith("--")) {
    return name.slice(2);
  }
  // Turn role into a slug
  return role
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+$/, "")
    .replace(/^-+/, "");
}
