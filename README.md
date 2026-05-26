# brandmd

[![npm version](https://img.shields.io/npm/v/brandmd)](https://www.npmjs.com/package/brandmd) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Stop Claude Code, Cursor, Gemini CLI, and Google Stitch from guessing your UI. brandmd extracts any website's design system into an LLM-readable `DESIGN.md`.

AI coding agents generate generic screens when they don't know your colors, fonts, spacing, components, and layout rules. Run one command, drop `DESIGN.md` in your project root, and your agent has brand context before it writes code. Default extraction runs locally with no API key.

```bash
npx brandmd https://stripe.com -o DESIGN.md
```

Pass multiple URLs to merge brand tokens across pages: `npx brandmd https://site.com https://site.com/pricing https://site.com/docs -o DESIGN.md`

Outputs to whatever your stack reads:

- **`DESIGN.md`** (default): for Claude Code, Cursor, Gemini CLI, Codex, Stitch
- **`--json`**: raw extracted tokens for scripts, MCP servers, and agent toolchains
- **`--css`**: CSS custom properties, drop into any project
- **`--tailwind`**: Tailwind v4 `@theme` block
- **`--html`**: visual, shareable brand guide

Combine with:

- **`--agent`**: also writes `.cursor/rules/brand.mdc` and `.claude/skills/brand-style/SKILL.md` so Claude Code and Cursor pick up the brand context automatically. No manual wiring.
- **`--dark`**: also extract dark mode tokens
- **`--vision`**: adds illustration style, photography mood, copywriting voice, and microcopy patterns from a screenshot. Requires `GEMINI_API_KEY` (free at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)).

Works as brand context for Claude Code, Cursor rules, Gemini CLI, Codex, Google Stitch, MCP servers, and any coding agent that reads markdown.

Real examples: [Stripe](examples/stripe.md) · [Linear](examples/linear.md) · [GitHub](examples/github.md) · [Vercel](examples/vercel.md) · [Notion](examples/notion.md) · [Cursor](examples/cursor.md) · [Anthropic](examples/anthropic.md) · [Figma](examples/figma.md) · [Supabase](examples/supabase.md) · [Raycast](examples/raycast.md) · [+20 more in the gallery](examples/README.md)

<p align="center">
  <img src="demo.gif" alt="brandmd extracting Stripe into DESIGN.md for Claude Code, Cursor, and Google Stitch" width="700">
</p>

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

brandmd is for giving Claude Code, Cursor, Gemini CLI, Codex, and Google Stitch real design context. It extracts a live website's colors, typography, spacing, shadows, component patterns, and layout rules into `DESIGN.md`, so AI coding agents can build on-brand UI instead of generic screens.

<details>
<summary>Release notes</summary>

- **v0.9:** `--agent` flag writes Cursor rule + Claude Code skill alongside DESIGN.md. CI switched to npm Trusted Publishing.
- **v0.8:** More accurate primary font detection across display, heading, body, and global text roles.
- **v0.7:** Cloudflare-protected sites handled by waiting up to 20s for the JS challenge.
- **v0.6:** Optional `--vision` adds illustration style, photography mood, copywriting voice, and microcopy notes. Requires a free [Gemini API key](https://aistudio.google.com/apikey).

See [CHANGELOG.md](CHANGELOG.md) for the full history.

</details>

## Examples

**[See all 31 DESIGN.md examples in the gallery →](examples/README.md)**

Flagship deep links (DESIGN.md):

- [Stitch](examples/stitch.md)
- [Stripe](examples/stripe.md)
- [Linear](examples/linear.md)
- [GitHub](examples/github.md)
- [Vercel](examples/vercel.md)
- [Notion](examples/notion.md)
- [Cursor](examples/cursor.md)
- [Anthropic](examples/anthropic.md)
- [Figma](examples/figma.md)
- [Supabase](examples/supabase.md)
- [Raycast](examples/raycast.md)
- [OpenAI](examples/openai.md)
- [Tailwind CSS](examples/tailwindcss.md)

Other output formats:

- [Vercel](examples/vercel.css) (CSS custom properties)
- [Linear](examples/linear-tailwind.css) (Tailwind v4 `@theme`)

## Why

Google Stitch introduced [DESIGN.md](https://stitch.withgoogle.com/docs/design-md/overview), a markdown file that encodes your design system in a format LLMs can read. Problem is, nobody wants to write one from scratch, and Stitch only generates them through its web UI.

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

# Vision: capture illustration style, photography mood, copywriting voice
# (CSS can't see these — Gemini reads the screenshot.)
export GEMINI_API_KEY=your-key-here  # free: https://aistudio.google.com/apikey
brandmd https://linear.app --vision
# Cloudflare-protected sites: brandmd waits up to 20s for the JS challenge
# to auto-resolve. If your site needs longer, pass --cf-wait-ms 30000.
# If the challenge persists, you'll get a clear error rather than garbage tokens.

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
- **Typography** with role-aware Primary detection (display > heading > body), per-role font breakdown, and a full "all detected fonts" frequency list. Skips monospace, default fallbacks, and icon fonts when picking Primary.
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

If brandmd saved you time, consider [starring the repo](https://github.com/yuvrajangadsingh/brandmd).

## License

[MIT](LICENSE)
