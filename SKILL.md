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

The output is the official DESIGN.md format (github.com/google-labs-code/design.md): YAML frontmatter with `colors`, `typography`, `rounded`, `spacing` and `components` tokens, then the canonical sections, which are always present:

1. **Overview** - visual character, density, motion
2. **Colors** - colors with semantic roles (background, text, accent, border)
3. **Typography** - Primary font (role-aware: display > heading > body, skipping mono/fallback/icon fonts), per-role font breakdown, all detected fonts with frequencies, size scale, weights, line heights, letter spacing
4. **Layout** - spacing scale
5. **Elevation & Depth** - shadows
6. **Shapes** - shape language and border radii
7. **Components** - buttons, cards, inputs with radii and colors; each button also names the element it was sampled from
8. **Do's and Don'ts**

Two more are conditional on flags: **Dark Mode Overrides** (with `--dark`), the dark palette, and **Visual Identity Beyond CSS** (with `--vision`), illustration style, photography mood, copywriting voice and microcopy patterns. `--vision` requires `GEMINI_API_KEY` or `GOOGLE_API_KEY` (free tier: aistudio.google.com/apikey).

## After extraction

1. Read the generated DESIGN.md to confirm it looks right
2. Summarize the key tokens for the user (primary colors, fonts, spacing scale)
3. Use these tokens in all subsequent UI code generation
4. Reference specific hex codes, font names, and spacing values from DESIGN.md when writing CSS/Tailwind/styled-components

## Options

- `npx brandmd <url>` - DESIGN.md to stdout
- `npx brandmd <url> -o DESIGN.md` - DESIGN.md to file
- `npx brandmd <url> --dark` - also extract dark-mode palette (Dark Mode Overrides)
- `npx brandmd <url> --vision` - also extract illustration / photography / voice / microcopy via Gemini (Visual Identity Beyond CSS). Needs `GEMINI_API_KEY` or `GOOGLE_API_KEY`.
- `npx brandmd <url> --css` - CSS custom properties output instead of DESIGN.md
- `npx brandmd <url> --tailwind` - Tailwind v4 `@theme` block instead of DESIGN.md
- `npx brandmd <url> --html` - HTML brand guide (visual, shareable)
- `npx brandmd <url> --json` - raw tokens as JSON (brandmd's internal shape, can change in 1.x)
- Multiple URLs merge tokens: `npx brandmd <url1> <url2> <url3>`

## Limitations

- Extracts from a single page, not the entire site (multi-URL merges token frequencies but the vision screenshot is the first page only)
- Can't read Figma tokens or design tool files
- Color role assignment is heuristic (based on usage frequency and luminance)
- Requires a publicly accessible URL (no auth-gated pages)
- Cloudflare-protected sites: brandmd waits up to 20s for the JS challenge to auto-resolve (`--cf-wait-ms` to tune). If the challenge persists, brandmd refuses (exit 2) rather than writing garbage tokens. Block pages, login walls and near-empty pages are refused the same way; `--allow-blocked` forces output with a refused-source marker.
