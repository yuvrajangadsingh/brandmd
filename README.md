# brandmd

[![npm version](https://img.shields.io/npm/v/brandmd)](https://www.npmjs.com/package/brandmd) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Extract any website's design system into a `DESIGN.md`, CSS custom properties, Tailwind v4 CSS, or visual brand guide.

<p align="center">
  <img src="demo.gif" alt="brandmd demo" width="700">
</p>

```bash
npx brandmd https://stripe.com
```

```
## 2. Color Palette & Roles
- **--color-accents-1** (`#FAFAFA`) — Page background
- **--color-blue-600** (`#0075DE`) — Accent background
- **--color-gray-500** (`#78736F`) — Secondary text

## 3. Typography Rules
**Primary font:** sohne-var
- Headings: 26px, 32px, 48px, 56px
- Body / UI: 14px, 16px, 18px, 22px

## 5. Layout Principles
**Spacing scale:** 2px, 4px, 6px, 8px, 12px, 16px, 24px, 32px
**Base unit:** 4px grid
```

One command. No API key. Works with [Google Stitch](https://stitch.withgoogle.com/), Claude Code, Cursor, Gemini CLI, or any AI coding agent that reads markdown context.

## Examples

See what brandmd extracts from real sites:

- [Stripe](examples/stripe.md) (DESIGN.md)
- [Linear](examples/linear.md) (DESIGN.md)
- [GitHub](examples/github.md) (DESIGN.md)
- [Vercel](examples/vercel.md) (DESIGN.md)
- [Notion](examples/notion.md) (DESIGN.md)
- [Vercel](examples/vercel.css) (CSS custom properties)
- [Linear](examples/linear-tailwind.css) (Tailwind v4)

## Why

AI coding agents generate generic UI because they don't know your brand. Google Stitch introduced [DESIGN.md](https://stitch.withgoogle.com/docs/design-md/overview) to fix this, a markdown file that encodes your design system in a format LLMs can read.

Problem is, nobody wants to write one from scratch. And Stitch only generates them through its web UI.

brandmd does it from the terminal. Point it at any URL, get a DESIGN.md back. Drop it in your project root and your AI tools start generating on-brand UI.

## Install

```bash
# Run directly (no install)
npx brandmd https://linear.app

# Install globally
npm i -g brandmd

# As an agent skill (Claude Code, Cursor, Gemini CLI, Copilot, Codex, 30+ platforms)
npx skills add yuvrajangadsingh/brandmd
```

## Usage

```bash
# DESIGN.md (default)
brandmd https://stripe.com
brandmd https://stripe.com -o DESIGN.md

# Multiple pages (merges tokens)
brandmd https://stripe.com https://stripe.com/pricing https://stripe.com/docs

# Dark mode extraction
brandmd https://github.com --dark

# CSS custom properties
brandmd https://vercel.com --css

# Tailwind v4 @theme
brandmd https://linear.app --tailwind

# HTML brand guide (visual, shareable)
brandmd https://github.com --html

# Raw tokens as JSON
brandmd https://stripe.com --json
```

## Output formats

### DESIGN.md (default)

Follows [Google Stitch's DESIGN.md spec](https://stitch.withgoogle.com/docs/design-md/overview) with 5 sections. Drop it in your project root and AI coding agents use it to generate on-brand UI.

### CSS custom properties (`--css`)

```css
:root {
  --color-accents-1: #FAFAFA;
  --color-blue-600: #0075DE;
  --font-primary: "Geist";
  --space-1: 4px;
  --radius-sm: 4px;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
}
```

### Tailwind v4 (`--tailwind`)

```css
@import "tailwindcss";

@theme {
  --color-primary: #0075DE;
  --font-sans: "Geist", system-ui, sans-serif;
  --spacing-1: 4px;
  --radius-sm: 4px;
}
```

### HTML brand guide (`--html`)

A self-contained dark-themed HTML page with color swatches, font specimens, spacing visualization, and shadow examples. Open it in a browser or share it with stakeholders.

### JSON (`--json`)

Raw extracted tokens for programmatic use.

## Multi-page extraction

Pass multiple URLs to merge tokens from different pages into one DESIGN.md. Each page is normalized so long content pages don't dominate.

```bash
brandmd https://stripe.com https://stripe.com/pricing https://stripe.com/docs
```

Failed pages are skipped with a warning. Mixed domains show a warning.

## Dark mode

Extract dark theme tokens as a separate section:

```bash
brandmd https://github.com --dark
```

Adds a "Dark Theme Overrides" section to the DESIGN.md with the dark color palette. Uses `prefers-color-scheme: dark` via Playwright, so it captures what users actually see in dark mode. Only affects DESIGN.md output (ignored for `--css`, `--tailwind`, `--html`).

## What it extracts

- **CSS custom properties** from `:root` and `@media` rules (uses actual variable names when available)
- **Colors** with semantic roles (background, text, accent, border)
- **Typography** (font families, size scale, weights)
- **Spacing scale** and base grid unit
- **Border radii** and shadow styles
- **Component patterns** (buttons, cards, inputs)

## How it works

1. Renders each page in a headless browser (Playwright)
2. Scrolls through to trigger lazy-loaded content
3. Dismisses cookie banners and overlays
4. Extracts CSS custom properties from `:root` (recurses into `@media` rules)
5. Extracts computed styles from every visible element
6. Clusters similar colors, identifies the spacing scale
7. Merges tokens across pages (normalized per page)
8. Outputs in your chosen format

No LLM calls, no API keys, runs entirely on your machine.

## Agent skill

brandmd ships as an [Agent Skill](https://agentskills.io/) that works across 30+ platforms including Claude Code, Cursor, VS Code/Copilot, Codex, and Gemini CLI.

```bash
npx skills add yuvrajangadsingh/brandmd
```

Then tell your agent: "extract the design system from https://linear.app"

## License

MIT
