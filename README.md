# brandmd

Extract any website's design system into a `DESIGN.md` file.

```bash
npx brandmd https://stripe.com
```

```
# Design System: Stripe | Financial Infrastructure to Grow Your Revenue

## 1. Visual Theme & Atmosphere
**Overall mood:** Dark and moody
**Shape language:** Rounded, friendly aesthetic with generous corner radii.
**Depth:** Uses 4 shadow styles for layering and elevation.

## 2. Color Palette & Roles
- **White** (`#FFFFFF`) — Page background
- **Dark Blue** (`#533AFD`) — Accent background
- **Cyan** (`#00D66F`) — Accent background
- **Dark Muted Blue** (`#64748D`) — Secondary text

## 3. Typography Rules
**Primary font:** sohne-var
**Size scale:**
- Headings: 26px, 32px, 48px, 56px
- Body / UI: 14px, 16px, 18px, 22px

## 4. Component Stylings
...

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
```

## Usage

```bash
# Output to stdout
brandmd https://stripe.com

# Save to file
brandmd https://stripe.com -o DESIGN.md

# Raw tokens as JSON
brandmd https://stripe.com --json
```

## What it extracts

- **Colors** with roles (background, text, accent, border)
- **Typography** (font families, size scale, weights)
- **Spacing scale** and base grid unit
- **Border radii** and shadow styles
- **Component patterns** (buttons, cards, inputs)

## Output format

The output follows [Google Stitch's DESIGN.md spec](https://stitch.withgoogle.com/docs/design-md/overview) with 5 sections:

1. **Visual Theme & Atmosphere** — mood, density, shape language, depth
2. **Color Palette & Roles** — every color with a semantic role (background, text, accent, border)
3. **Typography Rules** — font families, size scale grouped by heading/body/caption, weights
4. **Component Stylings** — buttons, cards, inputs with their radii, colors, shadows
5. **Layout Principles** — spacing scale, base grid unit, border radii

Drop the file in your project root. AI coding agents (Claude Code, Cursor, Gemini CLI, Stitch) will read it and generate UI that matches your brand.

## How it works

1. Renders the page in a headless browser (Playwright)
2. Extracts computed styles from every visible element
3. Clusters similar colors, identifies the spacing scale
4. Templates everything into the DESIGN.md format

No LLM calls, no API keys, runs entirely on your machine.

## License

MIT
