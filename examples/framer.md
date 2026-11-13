---
version: alpha
name: "Framer: Free website builder and AI design agent"
description: "Dark, high contrast"
colors:
  background: "#000000"
  on-background: "#ffffff"
  surface: "#666666"
  outline: "#ffffff0f"
  primary: "#ffffff"
  on-primary: "#1a1a1a"
  secondary: "#0099ff"
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
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.36
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.39
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
  3xl: 18px
spacing:
  base: 10px
  xs: 1px
  sm: 2px
  md: 3px
  lg: 5px
  xl: 6px
components:
  button-primary:
    backgroundColor: "#ffffff"
    textColor: "#000000"
    typography: "{typography.label-sm}"
    rounded: "{rounded.xl}"
    padding: 8px
    height: 30px
  button-secondary:
    backgroundColor: transparent
    typography: "{typography.label-sm}"
    rounded: "{rounded.xl}"
    padding: 10px
    height: 34px
  input:
    typography: "{typography.body-md}"
    rounded: 0px
---

> This is a real `DESIGN.md` example generated from [https://framer.com](https://framer.com) with `npx brandmd`.
>
> Drop a `DESIGN.md` like this in your project root so Claude Code, Cursor, Gemini CLI, Codex, or Google Stitch can use the colors, typography, spacing, and UI patterns when generating UI.
>
> Generate one for your site: `npx brandmd https://yoursite.com` ([npm](https://www.npmjs.com/package/brandmd) · [repo](https://github.com/yuvrajangadsingh/brandmd))


# Design System: Framer: Free website builder and AI design agent

> Extracted from [https://framer.com](https://framer.com) by brandmd

> ⚠️ **Provenance:** `https://framer.com` redirected to `https://www.framer.com/`. These tokens may describe that page, not the URL you asked for.

## Overview

**Visual character:** Dark, high contrast; black background dominates with white text and vivid blue accents

**Density:** spacious. The layout uses a varied spacing scale.

**Motion:** Animation surfaces detected (scripted animation via requestAnimationFrame). The brand uses motion, so treat static tokens as a floor. Detection is presence-only; it does not describe the animations.

## Colors

Palette extracted from the live page. Token names below map to the machine-readable `colors` block above.

- **Black** (`#000000`): Dark background / footer (dominant)
- **Vivid Blue** (`#0099ff`): Focus / active border (dominant)
- **Near-transparent White** (`#ffffff0f`): Divider / border (dominant)
- **Vivid Blue** (`#0000ee`): Primary text (accent)
- **Gray** (`#999999`): Muted text (accent)
- **Near-transparent White** (`#ffffff1a`): Overlay / scrim (accent)
- **Near-transparent Vivid Blue** (`#0099ff38`): Overlay / scrim (accent)
- **Near-transparent Vivid Green** (`#00bb881a`): Overlay / scrim (accent)

**Incidental (low usage, do not lead with these):** `#ffffff`, `#666666`

## Typography

**Primary font:** GT Walsheim Medium
**Secondary font:** Inter

**Fonts by role:**
- Headings: Inter, GT Walsheim Medium
- Body: Inter

**All detected fonts:** Inter (652), Input Mono Regular (23), GT Walsheim Medium (13), Input Mono Bold (6), Inter Medium (3), JetBrains Mono (2), Times (1)

**Type scale:**
- Headings: 44px, 54px
- Body / UI: 14px, 15px, 16px, 17px, 18px
- Captions / Small: 7px, 9px, 10px, 12px, 13px

**Weights in use:** 400, 500, 600, 700

**Line heights:** 19.5px, 21px, 14.5px, 15.5px, 13px, 12px, 24.5px, 16px, 17px, 20.5px

**Letter spacing:** -0.1px, -0.2px, -0.28px, -1.76px, -0.16px, 0.21px

## Layout

**Spacing scale:** 1px, 5px, 6px, 8px, 10px, 15px, 20px, 25px

## Elevation & Depth

Uses 5 shadow styles for layering and elevation:

- Level 1: `rgba(0, 0, 0, 0.15) 0px 0.3px 0.78px -1.33px, rgba(0, 0, 0, 0.13) 0px 1.14px 2.98px -2.67px, rgba(0, 0, 0, 0.04) 0px 5px 13px -4px`
- Level 2: `rgb(17, 17, 17) 0px 0px 0px 1.5px`
- Level 3: `rgba(255, 255, 255, 0.35) 0px 1px 1px 0px inset, rgba(255, 255, 255, 0.35) 0px -1px 1px 0px inset`
- Level 4: `rgba(0, 0, 0, 0.1) 0px 1px 2px 0px`
- Level 5: `rgba(255, 255, 255, 0.1) 0px 0px 0px 1px`

## Shapes

**Shape language:** Rounded, friendly aesthetic with generous corner radii.

**Border radii:** 4px, 5px, 6px, 8px, 15px, 18px, 20px, 100px

## Components

Observed from the live DOM. Machine-readable component tokens are in the `components` block above.

### Buttons
- Background: `#ffffff`
- Text color: `#000000`
- Corner radius: 8px
- Height: 30px
- Padding: 8px 10px 8px 10px
- Font: 12px, weight 400
- Sampled from: `<a>` labelled `Sign up`

### Inputs
- Border: 0px solid rgba(0, 0, 0, 0)
- Corner radius: 0px
- Padding: 0px 0px 0px 0px
- Font size: 12px

## Do's and Don'ts

- Do use `#ffffff` for primary actions and CTAs
- Do stick to 4 font weights: 400, 500, 600, 700
- Do use `GT Walsheim Medium` as the primary typeface
- Don't introduce colors outside the palette above
- Don't mix fonts beyond GT Walsheim Medium and Inter
- Don't use border-radius values outside: 4px, 5px, 6px, 8px, 15px, 18px, 20px, 100px

---

*This DESIGN.md was generated by [brandmd](https://github.com/yuvrajangadsingh/brandmd) and validates against the official [@google/design.md](https://github.com/google-labs-code/design.md) linter. Drop it into your project root and AI coding agents (Claude Code, Cursor, Gemini CLI) will use it to generate on-brand UI.*