---
version: alpha
name: "Home \\ Anthropic"
description: "Bright, high contrast"
colors:
  background: "#faf9f5"
  on-background: "#141413"
  on-surface-variant: "#5e5d59"
  outline: "#dedcd1"
  outline-variant: "#3d3d3a"
  primary: "#e8e6dc"
  on-primary: "#1a1a1a"
typography:
  display:
    fontFamily: anthropicSerif
    fontSize: 70px
    fontWeight: 500
    lineHeight: 1
  headline-lg:
    fontFamily: anthropicSerif
    fontSize: 67.5px
    fontWeight: 500
    lineHeight: 1
  headline-md:
    fontFamily: anthropicSerif
    fontSize: 41px
    fontWeight: 400
    lineHeight: 1.24
  body-md:
    fontFamily: anthropicSans
    fontSize: 16.5px
    fontWeight: 400
    lineHeight: 1.55
  body-sm:
    fontFamily: anthropicSans
    fontSize: 14.5px
    fontWeight: 400
    lineHeight: 1.52
  label-sm:
    fontFamily: anthropicSans
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.54
rounded:
  sm: 4px
  md: 8px
  lg: 10px
  xl: 16px
  full: 9999px
spacing:
  base: 8px
  xs: 2px
  sm: 4px
  md: 6.5px
  lg: 12px
  xl: 16px
components:
  button-primary:
    backgroundColor: "#e8e6dc"
    textColor: "#30302e"
    typography: "{typography.label-sm}"
    rounded: "{rounded.lg}"
    padding: 12px
    height: 36px
  button-secondary:
    backgroundColor: transparent
    typography: "{typography.label-sm}"
    rounded: 0px
    padding: 12px
    height: 52px
  card:
    rounded: 0px
  input:
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
---

> This is a real `DESIGN.md` example generated from [https://anthropic.com](https://anthropic.com) with `npx brandmd`.
>
> Drop a `DESIGN.md` like this in your project root so Claude Code, Cursor, Gemini CLI, Codex, or Google Stitch can use the colors, typography, spacing, and UI patterns when generating UI.
>
> Generate one for your site: `npx brandmd https://yoursite.com` ([npm](https://www.npmjs.com/package/brandmd) · [repo](https://github.com/yuvrajangadsingh/brandmd))


# Design System: Home \ Anthropic

> Extracted from [https://anthropic.com](https://anthropic.com) by brandmd

> ⚠️ **Provenance:** `https://anthropic.com` redirected to `https://www.anthropic.com/`. These tokens may describe that page, not the URL you asked for.

## Overview

**Visual character:** Bright, high contrast; cream background dominates with black text

**Density:** spacious. The layout uses a varied spacing scale.

**Motion:** Animation surfaces detected (Lottie animations). The brand uses motion, so treat static tokens as a floor. Detection is presence-only; it does not describe the animations.

## Colors

Palette extracted from the live page. Token names below map to the machine-readable `colors` block above.

- **Cream** (`#faf9f5`): Page background (dominant)
- **Light Muted Yellow** (`#dedcd1`): Divider / border (dominant)
- **Dark gray** (`#3d3d3a`): Divider / border (dominant)
- **Gray** (`#5e5d59`): Secondary text (accent)
- **Gray** (`#87867f`): Secondary text (accent)
- **Black** (`#141413`): Dark background / footer (accent)
- **Translucent Black** (`#1414134d`): Overlay / scrim (accent)

## Typography

**Primary font:** anthropicSerif
**Secondary font:** anthropicSans

**Fonts by role:**
- Headings: anthropicSans, anthropicSerif
- Body: anthropicSans

**All detected fonts:** anthropicSans (452), anthropicSerif (8), Segoe UI (1)

**Type scale:**
- Headings: 41px, 67.5px, 70px
- Body / UI: 14.5px, 16px, 16.5px, 21.5px
- Captions / Small: 11px, 13px

**Weights in use:** 400, 500, 600, 700

**Line heights:** 25.5px, 20px, 19px, 15px, 16.5px, 22px, 26.5px, 67.5px, 51px, 31px

**Letter spacing:** 0.13px, 0.198px, -0.407843px

## Layout

**Spacing scale:** 2px, 4px, 8px, 12px, 16px, 24px, 32px, 80px

**Base unit:** 4px grid — 91% of all weighted spacing values are multiples of 4.

## Elevation & Depth

Uses 1 shadow style for layering and elevation:

- Level 1: `rgb(250, 249, 245) 0px 0px 0px 2px`

## Shapes

**Shape language:** Rounded, friendly aesthetic with generous corner radii.

**Border radii:** 4px, 8px, 10px, 16px, 9999px (pill)

## Components

Observed from the live DOM. Machine-readable component tokens are in the `components` block above.

### Buttons
- Background: `#e8e6dc`
- Text color: `#30302e`
- Corner radius: 10px
- Height: 36px
- Padding: 12px 20px 12px 24px
- Font: 16.6863px, weight 400
- Sampled from: `<a>` labelled `Read announcement`

### Cards
- Corner radius: 0px
- Padding: 0px 0px 0px 0px

### Inputs
- Background: `#f5f4ed`
- Border: 1px solid rgb(232, 230, 220)
- Corner radius: 8px
- Padding: 0px 16px 0px 36px
- Font size: 13px

## Do's and Don'ts

- Do use a 4px grid for spacing
- Do use `#e8e6dc` for primary actions and CTAs
- Do stick to 4 font weights: 400, 500, 600, 700
- Do use `anthropicSerif` as the primary typeface
- Don't introduce colors outside the palette above
- Don't mix fonts beyond anthropicSerif and anthropicSans
- Don't use border-radius values outside: 4px, 8px, 10px, 16px, 9999px (pill)

---

*This DESIGN.md was generated by [brandmd](https://github.com/yuvrajangadsingh/brandmd) and validates against the official [@google/design.md](https://github.com/google-labs-code/design.md) linter. Drop it into your project root and AI coding agents (Claude Code, Cursor, Gemini CLI) will use it to generate on-brand UI.*