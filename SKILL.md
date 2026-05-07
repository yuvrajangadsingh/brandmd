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

The output follows Google Stitch's DESIGN.md format. Sections 1-5 are always present; 6-7 are conditional on flags.

1. **Visual Theme & Atmosphere** - mood, shape language, depth
2. **Color Palette & Roles** - colors with semantic roles (background, text, accent, border)
3. **Typography Rules** - font families, size scale, weights
4. **Component Stylings** - buttons, cards, inputs with radii, colors, shadows
5. **Layout Principles** - spacing scale, base grid unit, border radii
6. **Dark Theme Overrides** (with `--dark`) - palette + atmosphere for dark mode
7. **Visual Identity Beyond CSS** (with `--vision`) - illustration style, photography mood, copywriting voice, microcopy patterns. Requires `GEMINI_API_KEY` (free tier: aistudio.google.com/apikey).

## After extraction

1. Read the generated DESIGN.md to confirm it looks right
2. Summarize the key tokens for the user (primary colors, fonts, spacing scale)
3. Use these tokens in all subsequent UI code generation
4. Reference specific hex codes, font names, and spacing values from DESIGN.md when writing CSS/Tailwind/styled-components

## Options

- `npx brandmd <url>` - DESIGN.md to stdout
- `npx brandmd <url> -o DESIGN.md` - DESIGN.md to file
- `npx brandmd <url> --dark` - also extract dark-mode palette (Section 6)
- `npx brandmd <url> --vision` - also extract illustration / photography / voice / microcopy via Gemini (Section 7). Needs `GEMINI_API_KEY` env var.
- `npx brandmd <url> --css` - CSS custom properties output instead of DESIGN.md
- `npx brandmd <url> --tailwind` - Tailwind v4 `@theme` block instead of DESIGN.md
- `npx brandmd <url> --html` - HTML brand guide (visual, shareable)
- `npx brandmd <url> --json` - raw tokens as JSON (programmatic use)
- Multiple URLs merge tokens: `npx brandmd <url1> <url2> <url3>`

## Limitations

- Extracts from a single page, not the entire site (multi-URL merges token frequencies but the vision screenshot is the first page only)
- Can't read Figma tokens or design tool files
- Color role assignment is heuristic (based on usage frequency and luminance)
- Requires a publicly accessible URL (no auth-gated pages)
- `--vision` on Cloudflare-protected sites returns loading-state observations because Playwright hits the bot challenge before the brand renders. Workaround pending in v0.7.0.
