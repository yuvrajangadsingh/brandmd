---
version: alpha
name: "Cursor: AI coding agent"
description: "Bright, high contrast"
colors:
  background: "#f7f7f4"
  on-background: "#000000"
  surface: "#f2f1ed"
  on-surface-variant: "#e7000b"
  outline: "#f2f1ed"
  primary: "#c08532"
  on-primary: "#1a1a1a"
  secondary: "#e7000b"
  on-secondary: "#ffffff"
typography:
  headline-lg:
    fontFamily: CursorGothic
    fontSize: 26px
    fontWeight: 400
    lineHeight: 1.25
  body-md:
    fontFamily: CursorGothic
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  body-lg:
    fontFamily: CursorGothic
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  label-sm:
    fontFamily: CursorGothic
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.63
rounded:
  sm: 2px
  md: 3px
  lg: 4px
  xl: 8px
  2xl: 10px
  3xl: 12px
  full: 9999px
spacing:
  base: 8px
  xs: 2px
  sm: 3px
  md: 4px
  lg: 4.5px
  xl: 6px
components:
  button-primary:
    backgroundColor: "#c08532"
    textColor: "#1a1a1a"
    typography: "{typography.label-sm}"
    rounded: "{rounded.lg}"
    padding: 2px
    height: 20px
  button-secondary:
    backgroundColor: transparent
    typography: "{typography.label-sm}"
    rounded: 0px
    padding: 6px
    height: 34px
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: 8px
  input:
    typography: "{typography.body-md}"
    rounded: 0px
    padding: 8px
---

> This is a real `DESIGN.md` example generated from [https://cursor.com](https://cursor.com) with `npx brandmd`.
>
> Drop a `DESIGN.md` like this in your project root so Claude Code, Cursor, Gemini CLI, Codex, or Google Stitch can use the colors, typography, spacing, and UI patterns when generating UI.
>
> Generate one for your site: `npx brandmd https://yoursite.com` ([npm](https://www.npmjs.com/package/brandmd) · [repo](https://github.com/yuvrajangadsingh/brandmd))


# Design System: Cursor: AI coding agent

> Extracted from [https://cursor.com](https://cursor.com) by brandmd

## Overview

**Visual character:** Bright, high contrast; cream background dominates with black text and vivid red accents

**Density:** spacious. The layout uses a varied spacing scale.

**Motion:** Animation surfaces detected (scripted animation via requestAnimationFrame). The brand uses motion, so treat static tokens as a floor. Detection is presence-only; it does not describe the animations.

## Colors

Palette extracted from the live page. Token names below map to the machine-readable `colors` block above.

- **Black** (`#000000`): Primary text (dominant)
- **Cream** (`#f7f7f4`): Page background (dominant)
- **Dark gray** (`#26251e`): Dark background / footer (accent)
- **Vivid Red** (`#e7000b`): Secondary text (accent)
- **Orange** (`#c08532`): Accent background (accent)

**Incidental (low usage, do not lead with these):** `#f2f1ed`, `#3a6a9f14`, `#34785c`

## Typography

**Primary font:** CursorGothic
**Secondary font:** Segoe UI

**Fonts by role:**
- Headings: CursorGothic, Segoe UI
- Body: CursorGothic

**All detected fonts:** CursorGothic (1051), Segoe UI (305), berkeleyMono (179), EB Garamond (135), Lato (69), CursorIcons16 (9)

**Type scale:**
- Headings: 26px
- Body / UI: 14px, 16px, 17.5px, 19px, 20px, 22px
- Captions / Small: 6px, 10px, 11px, 12px, 13px

**Weights in use:** 400, 500, 600, 700

**Line heights:** 24px, 21px, 16px, 19.5px, 14px, 20px, 18.5px, 23.5px, 17.5px, 18px

**Letter spacing:** 0.14px, 0.0484px, 0.08px, -0.11px, 0.0528px, -0.325px

## Layout

**Spacing scale:** 4px, 4.5px, 6px, 8px, 12px, 15px, 16px, 17.5px

## Elevation & Depth

Uses 5 shadow styles for layering and elevation:

- Level 1: `rgba(0, 0, 0, 0.14) 0px 28px 70px 0px, rgba(0, 0, 0, 0.1) 0px 14px 32px 0px, oklab(0.263084 -0.00230259 0.0124794 / 0.1) 0px 0px 0px 1px`
- Level 2: `rgb(235, 234, 229) 0px 0px 0px 2px`
- Level 3: `rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.02) 0px 0px 16px 0px, rgba(0, 0, 0, 0.008) 0px 0px 8px 0px`
- Level 4: `rgba(0, 0, 0, 0.3) 0px 22px 70px 4px, rgba(0, 0, 0, 0.15) 0px 0px 0px 0.5px`
- Level 5: `rgba(0, 0, 0, 0.25) 0px 25px 50px -12px, rgba(0, 0, 0, 0.15) 0px 12px 24px -8px, oklab(0.263084 -0.00230259 0.0124794 / 0.1) 0px 0px 0px 0.5px`

## Shapes

**Shape language:** Subtle rounding on interactive elements.

**Border radii:** 2px, 3px, 4px, 8px, 10px, 12px, 9999px (pill)

## Components

Observed from the live DOM. Machine-readable component tokens are in the `components` block above.

### Buttons
- Background: `#c08532`
- Text color: `#ffffff`
- Corner radius: 4px
- Height: 20px
- Padding: 2px 8px 2px 8px
- Font: 12px, weight 500

### Cards
- Background: `#f2f1ed`
- Corner radius: 4px
- Shadow: `rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.02) 0px 0px 16px 0px, rgba(0, 0, 0, 0.008) 0px 0px 8px 0px`
- Padding: 7.9px 15px 12.8px 15px

### Inputs
- Border: 0px solid rgb(38, 37, 30)
- Corner radius: 0px
- Padding: 8px 8px 6px 8px
- Font size: 13px

## Do's and Don'ts

- Do use `#c08532` for primary actions and CTAs
- Do stick to 4 font weights: 400, 500, 600, 700
- Do use `CursorGothic` as the primary typeface
- Don't introduce colors outside the palette above
- Don't mix fonts beyond CursorGothic and Segoe UI
- Don't use border-radius values outside: 2px, 3px, 4px, 8px, 10px, 12px, 9999px (pill)

---

*This DESIGN.md was generated by [brandmd](https://github.com/yuvrajangadsingh/brandmd) and validates against the official [@google/design.md](https://github.com/google-labs-code/design.md) linter. Drop it into your project root and AI coding agents (Claude Code, Cursor, Gemini CLI) will use it to generate on-brand UI.*