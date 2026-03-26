# brandmd

[![npm version](https://img.shields.io/npm/v/brandmd)](https://www.npmjs.com/package/brandmd) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Extract any website's design system into a `DESIGN.md`, CSS custom properties, Tailwind config, or visual brand guide.

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

# CSS custom properties
brandmd https://vercel.com --css
brandmd https://vercel.com --css -o tokens.css

# Tailwind v4 @theme
brandmd https://linear.app --tailwind
brandmd https://linear.app --tailwind -o theme.css

# HTML brand guide (visual, shareable)
brandmd https://github.com --html
brandmd https://github.com --html -o brand-guide.html

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

## What it extracts

- **CSS custom properties** from `:root` (uses actual variable names when available)
- **Colors** with semantic roles (background, text, accent, border)
- **Typography** (font families, size scale, weights)
- **Spacing scale** and base grid unit
- **Border radii** and shadow styles
- **Component patterns** (buttons, cards, inputs)

## How it works

1. Renders the page in a headless browser (Playwright)
2. Scrolls through the page to trigger lazy-loaded content
3. Dismisses cookie banners and overlays
4. Extracts CSS custom properties from `:root`
5. Extracts computed styles from every visible element
6. Clusters similar colors, identifies the spacing scale
7. Outputs in your chosen format

No LLM calls, no API keys, runs entirely on your machine.

## Agent skill

brandmd ships as an [Agent Skill](https://agentskills.io/) that works across 30+ platforms including Claude Code, Cursor, VS Code/Copilot, Codex, and Gemini CLI.

```bash
npx skills add yuvrajangadsingh/brandmd
```

Then tell your agent: "extract the design system from https://linear.app"

## License

MIT
