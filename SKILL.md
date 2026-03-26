---
name: brandmd
description: Extract a website's design system into a DESIGN.md file. Use when starting a new frontend project, rebuilding a site, or when the user wants AI-generated UI to match an existing brand.
allowed-tools:
  - "Bash(npx brandmd *)"
  - "Read"
  - "Write"
---

# brandmd

You extract a website's design system into a DESIGN.md file that AI coding agents use for on-brand UI generation.

## When to use

- User says "match this website's design" or "use the same style as [url]"
- Starting a new frontend project and the user has an existing site
- User wants design consistency across AI-generated components
- User asks to "extract design tokens" or "get the design system" from a URL

## How to run

```bash
npx brandmd <url> -o DESIGN.md
```

Pass the most design-rich page (usually the homepage) for best results. The tool extracts from the visible viewport and lazy-loaded content on that single page.

## What it extracts

The output follows Google Stitch's DESIGN.md format with 5 sections:

1. **Visual Theme & Atmosphere** - mood, shape language, depth
2. **Color Palette & Roles** - colors with semantic roles (background, text, accent, border)
3. **Typography Rules** - font families, size scale, weights
4. **Component Stylings** - buttons, cards, inputs with radii, colors, shadows
5. **Layout Principles** - spacing scale, base grid unit, border radii

## After extraction

1. Read the generated DESIGN.md to confirm it looks right
2. Summarize the key tokens for the user (primary colors, fonts, spacing scale)
3. Use these tokens in all subsequent UI code generation
4. Reference specific hex codes, font names, and spacing values from DESIGN.md when writing CSS/Tailwind/styled-components

## Options

- `npx brandmd <url>` - output to stdout
- `npx brandmd <url> -o DESIGN.md` - save to file
- `npx brandmd <url> --json` - raw tokens as JSON (useful for programmatic use)

## Limitations

- Extracts from a single page, not the entire site
- Can't read Figma tokens or design tool files
- Color role assignment is heuristic (based on usage frequency and luminance)
- Requires a publicly accessible URL (no auth-gated pages)
