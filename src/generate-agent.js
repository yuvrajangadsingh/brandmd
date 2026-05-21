import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";

/**
 * Generate a Cursor rule + Claude Code skill that point at DESIGN.md.
 * Wrappers are lightweight: they reference @DESIGN.md rather than inlining content,
 * so updates to DESIGN.md propagate automatically.
 *
 * Files written:
 *   <outputDir>/.cursor/rules/brand.mdc
 *   <outputDir>/.claude/skills/brand-style/SKILL.md
 *
 * Overwrite behavior: always overwrite. Both files are generated artifacts.
 * Hand-edits should live in DESIGN.md, which is the source of truth.
 *
 * @param {string} outputDir - project root to write the .cursor/ and .claude/ trees into
 * @param {string} designMdPath - path to DESIGN.md relative to outputDir (default "DESIGN.md")
 * @returns {string[]} list of paths written (absolute or relative to cwd, matching outputDir)
 */
export function generateAgentPack(outputDir, designMdPath = "DESIGN.md") {
  const cursorRulePath = join(outputDir, ".cursor", "rules", "brand.mdc");
  const cursorRule = `---
description: Brand and design-system context extracted by brandmd. Use these colors, typography, spacing, and component patterns when generating or modifying UI.
alwaysApply: false
globs: "**/*.{tsx,jsx,ts,vue,svelte,css,scss,html,astro,mdx}"
---

# Brand Style Rules

Follow the design system documented in @${designMdPath} before generating any UI code.

## Hard rules

- Use the colors documented in the Color Palette section. Don't invent new shades.
- Match the typography (font family, sizes, weights) exactly.
- Honor the spacing scale and base grid unit. Don't use arbitrary pixel values.
- Match the shape language (border radius, button shapes, shadow styles).
- For components (buttons, cards, navigation, forms), follow the documented patterns.

## When in doubt

Default to what's in @${designMdPath}. If a token isn't specified, derive it from the closest documented one. Don't fall back to generic Tailwind defaults.
`;

  mkdirSync(dirname(cursorRulePath), { recursive: true });
  writeFileSync(cursorRulePath, cursorRule);

  const skillPath = join(outputDir, ".claude", "skills", "brand-style", "SKILL.md");
  const skill = `---
name: brand-style
description: Apply the project's brand and design system before building or modifying any UI. Use whenever generating components, pages, layouts, or styles. The actual tokens (colors, typography, spacing, components) are in ${designMdPath} at the project root.
---

# Brand Style Context

This project has a documented design system at @${designMdPath}. Read it before generating any UI code.

## What's in ${designMdPath}

- Color palette with role tagging (background, accent, primary text, secondary text)
- Typography stack with role-aware font assignments (display, heading, body)
- Spacing scale and base grid unit
- Shape language (border radius, shadow elevations)
- Component patterns (buttons, cards, navigation, forms)

## How to apply

1. Read ${designMdPath} first. Always.
2. When generating any component, page, or style block:
   - Use the documented colors, not arbitrary hex values
   - Match the typography exactly (font family, sizes, weights)
   - Honor the spacing scale (use documented px values, not arbitrary numbers)
   - Match shape language (border radius, shadow styles)
   - For components, follow the patterns in the Component Stylings section
3. If a token isn't specified, derive it from the closest documented one. Don't fall back to generic Tailwind defaults or random Material/Bootstrap-style values.

## Why this matters

AI coding agents generate generic UI when they don't have brand context. ${designMdPath} was extracted from the live brand by [brandmd](https://github.com/yuvrajangadsingh/brandmd). Following it keeps generated UI on-brand and reduces review cycles.
`;

  mkdirSync(dirname(skillPath), { recursive: true });
  writeFileSync(skillPath, skill);

  return [cursorRulePath, skillPath];
}
