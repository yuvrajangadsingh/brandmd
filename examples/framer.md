---
version: alpha
name: "Framer: AI website builder for professional sites"
description: "Dark, soft contrast"
colors:
  background: "#000000"
  on-background: "#0000ee"
  surface: "#666666"
  on-surface-variant: "#999999"
  outline: "#ffffff0f"
  primary: "#0099ff66"
  on-primary: "#1a1a1a"
  secondary: "#0099ff66"
  on-secondary: "#1a1a1a"
typography:
  display:
    fontFamily: GT Walsheim Medium
    fontSize: 54px
    fontWeight: 500
    lineHeight: 0.8
  headline-lg:
    fontFamily: GT Walsheim Medium
    fontSize: 44px
    fontWeight: 500
    lineHeight: 1.1
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.36
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.21
rounded:
  sm: 4px
  md: 5px
  lg: 6px
  xl: 8px
  2xl: 15px
  3xl: 20px
spacing:
  base: 10px
  xs: 1px
  sm: 2px
  md: 3px
  lg: 4px
  xl: 5px
components:
  button-primary:
    backgroundColor: "#0066ff"
    textColor: "#ffffff"
    typography: "{typography.label-sm}"
    rounded: 0px
    height: 16px
  button-secondary:
    backgroundColor: transparent
    typography: "{typography.label-sm}"
    rounded: "{rounded.md}"
    height: 20px
  input:
    typography: "{typography.body-md}"
    rounded: 0px
---

> This is a real `DESIGN.md` example generated from [https://framer.com](https://framer.com) with `npx brandmd`.
>
> Drop a `DESIGN.md` like this in your project root so Claude Code, Cursor, Gemini CLI, Codex, or Google Stitch can use the colors, typography, spacing, and UI patterns when generating UI.
>
> Generate one for your site: `npx brandmd https://yoursite.com` ([npm](https://www.npmjs.com/package/brandmd) · [repo](https://github.com/yuvrajangadsingh/brandmd))


# Design System: Framer: AI website builder for professional sites

> Extracted from [https://framer.com](https://framer.com) by brandmd

> ⚠️ **Provenance:** `https://framer.com` redirected to `https://www.framer.com/`. These tokens may describe that page, not the URL you asked for.

## Overview

**Visual character:** Dark, soft contrast; black background dominates with black text and translucent vivid blue accents

**Density:** spacious. The layout uses a varied spacing scale.

**Motion:** Animation surfaces detected (scripted animation via requestAnimationFrame). The brand uses motion, so treat static tokens as a floor. Detection is presence-only; it does not describe the animations.

## Colors

Palette extracted from the live page. Token names below map to the machine-readable `colors` block above.

- **Black** (`#000000`): Dark background / footer (dominant)
- **Translucent Vivid Blue** (`#0099ff65`): Focus / active border (dominant)
- **Near-transparent White** (`#ffffff0f`): Divider / border (dominant)
- **Vivid Blue** (`#0000ee`): Primary text (accent)
- **White** (`#ffffff`): Light text (on dark) (accent)
- **Gray** (`#999999`): Muted text (accent)
- **Near-transparent White** (`#ffffff1a`): Overlay / scrim (accent)
- **Vivid Blue** (`#0099ff`): Accent background (accent)
- **Near-transparent Vivid Green** (`#00bb881a`): Overlay / scrim (accent)

**Incidental (low usage, do not lead with these):** `#9999991a`, `#666666`

## Typography

**Primary font:** GT Walsheim Medium
**Secondary font:** Inter

**Fonts by role:**
- Headings: Inter, GT Walsheim Medium
- Body: Inter
- Buttons / nav: Inter Medium

**All detected fonts:** Inter (528), Input Mono Regular (28), GT Walsheim Medium (10), Input Mono Bold (6), Inter Medium (4), JetBrains Mono (2), Times (1)

**Type scale:**
- Headings: 44px, 54px
- Body / UI: 14px, 15px, 16px, 18px, 20px
- Captions / Small: 7px, 9px, 10px, 12px, 13px

**Weights in use:** 400, 500, 600, 700

**Line heights:** 14.5px, 14px, 21px, 12px, 17px, 16px, 15.5px, 24.5px, 18px, 15px

**Letter spacing:** -0.14px, -0.2px, -0.6px, -0.1px, 0.27px, -0.15px

## Layout

**Spacing scale:** 1px, 5px, 6px, 8px, 10px, 15px, 20px, 25px

## Elevation & Depth

Uses 5 shadow styles for layering and elevation:

- Level 1: `rgba(0, 0, 0, 0.25) 0px 4px 8px 0px`
- Level 2: `rgba(0, 0, 0, 0.2) 0px 2px 6px 0px`
- Level 3: `rgb(17, 17, 17) 0px 0px 0px 1.5px`
- Level 4: `rgba(0, 0, 0, 0.1) 0px 1px 2px 0px`
- Level 5: `rgba(0, 0, 0, 0.2) 0px 26px 41.6px 0px`

## Shapes

**Shape language:** Rounded, friendly aesthetic with generous corner radii.

**Border radii:** 4px, 5px, 6px, 8px, 15px, 20px, 50%, 100px

Asymmetric / percentage radii observed (50%); kept out of the ordinal `rounded` scale since they don't fit a magnitude order.

## Components

Observed from the live DOM. Machine-readable component tokens are in the `components` block above.

### Buttons
- Background: `#0066ff`
- Text color: `#ffffff`
- Corner radius: 0px
- Height: 16px
- Padding: 0px 0px 0px 0px
- Font: 16px, weight 500

### Inputs
- Border: 0px solid rgba(0, 0, 0, 0)
- Corner radius: 0px
- Padding: 0px 0px 0px 0px
- Font size: 12px

## Do's and Don'ts

- Do use `#0099ff65` for primary actions and CTAs
- Do stick to 4 font weights: 400, 500, 600, 700
- Do use `GT Walsheim Medium` as the primary typeface
- Don't introduce colors outside the palette above
- Don't mix fonts beyond GT Walsheim Medium and Inter
- Don't use border-radius values outside: 4px, 5px, 6px, 8px, 15px, 20px, 50%, 100px

---

*This DESIGN.md was generated by [brandmd](https://github.com/yuvrajangadsingh/brandmd) and validates against the official [@google/design.md](https://github.com/google-labs-code/design.md) linter. Drop it into your project root and AI coding agents (Claude Code, Cursor, Gemini CLI) will use it to generate on-brand UI.*