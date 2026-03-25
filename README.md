# brandmd

Extract any website's design system into a `DESIGN.md` file.

One command. No API key. Works with [Google Stitch](https://stitch.withgoogle.com/), Claude Code, Cursor, Gemini CLI, or any AI coding agent that reads markdown context.

## Install

```bash
npx brandmd https://linear.app
```

Or install globally:

```bash
npm i -g brandmd
```

## Usage

```bash
# Output DESIGN.md to stdout
brandmd https://stripe.com

# Save to file
brandmd https://stripe.com -o DESIGN.md

# Get raw tokens as JSON
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

1. Visual Theme & Atmosphere
2. Color Palette & Roles
3. Typography Rules
4. Component Stylings
5. Layout Principles

Drop the file in your project root. AI coding agents will read it and generate UI that matches your brand.

## How it works

1. Renders the page in a headless browser (Playwright)
2. Extracts computed styles from every visible element
3. Clusters similar colors, identifies the spacing scale
4. Templates everything into the DESIGN.md format

No LLM calls, no API keys, runs entirely on your machine.

## License

MIT
