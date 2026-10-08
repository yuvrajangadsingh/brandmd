---
version: alpha
name: "AI Coding Agent for Building Ambitious Software | Cursor"
description: "Bright, high contrast"
colors:
  background: "#f7f7f4"
  on-background: "#26251e"
  on-surface-variant: "#14141499"
  outline: "#26251e33"
  primary: "#65afe0"
  on-primary: "#1a1a1a"
  secondary: "#e7000b"
  on-secondary: "#ffffff"
  surface: "#f2f1ed"
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
  body-sm:
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
  sm: 3px
  md: 4px
  lg: 8px
  xl: 10px
  2xl: 12px
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
    rounded: "{rounded.md}"
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
    rounded: "{rounded.md}"
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


# Design System: AI Coding Agent for Building Ambitious Software | Cursor

> Extracted from [https://cursor.com](https://cursor.com) by brandmd

## Overview

**Visual character:** Bright, high contrast; cream background dominates with dark gray text and blue accents

**Density:** spacious. The layout uses a varied spacing scale.

**Motion:** Animation surfaces detected (scripted animation via requestAnimationFrame). The brand uses motion, so treat static tokens as a floor. Detection is presence-only; it does not describe the animations.

## Colors

Palette extracted from the live page. Token names below map to the machine-readable `colors` block above.

- **Black** (`#000000`): Primary text (dominant)
- **Cream** (`#f7f7f4`): Page background (dominant)
- **Near-transparent Dark gray** (`#26251e33`): Divider / border (dominant)
- **Translucent Dark gray** (`#26251e66`): Primary text (accent)
- **Dark gray** (`#26251e`): Dark background / footer (accent)
- **Near-transparent Dark gray** (`#26251e1a`): Overlay / scrim (accent)
- **Blue** (`#65afe0`): Accent background (accent)
- **Vivid Red** (`#e7000b`): Secondary text (accent)
- **Orange** (`#c08532`): Accent background (accent)

**Incidental (low usage, do not lead with these):** `#fbfbfb59`

## Typography

**Primary font:** CursorGothic
**Secondary font:** Segoe UI

**Fonts by role:**
- Headings: CursorGothic, Segoe UI
- Body: CursorGothic

**All detected fonts:** CursorGothic (1011), Segoe UI (470), berkeleyMono (237), EB Garamond (135), Lato (69), CursorIcons16 (11)

**Type scale:**
- Headings: 26px
- Body / UI: 14px, 16px, 17.5px, 19px, 20px, 22px
- Captions / Small: 6px, 10px, 11px, 12px, 13px

**Weights in use:** 400, 500, 510, 600, 700

**Line heights:** 24px, 19.5px, 21px, 16px, 14px, 20px, 18.5px, 18px, 23.5px, 15px

**Letter spacing:** 0.14px, 0.0484px, 0.08px, -0.11px, 0.0528px, -0.15px

## Layout

**Spacing scale:** 2px, 4px, 4.5px, 6px, 8px, 12px, 16px, 17.5px

## Elevation & Depth

Uses 5 shadow styles for layering and elevation:

- Level 1: `rgba(0, 0, 0, 0.14) 0px 28px 70px 0px, rgba(0, 0, 0, 0.1) 0px 14px 32px 0px, oklab(0.263084 -0.00230259 0.0124794 / 0.1) 0px 0px 0px 1px`
- Level 2: `rgba(0, 0, 0, 0.02) 0px 0px 16px 0px, rgba(0, 0, 0, 0.008) 0px 0px 8px 0px`
- Level 3: `rgb(252, 252, 252) 0px 0px 0px 2px`
- Level 4: `rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.1) 0px 4px 6px -4px`
- Level 5: `rgba(0, 0, 0, 0.3) 0px 22px 70px 4px, rgba(0, 0, 0, 0.15) 0px 0px 0px 0.5px`

## Shapes

**Shape language:** Subtle rounding on interactive elements.

**Border radii:** 2px 0px 0px 2px, 3px, 4px, 8px, 10px, 12px, 50%, 9999px (pill)

Asymmetric / percentage radii observed (2px 0px 0px 2px, 50%); kept out of the ordinal `rounded` scale since they don't fit a magnitude order.

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
- Shadow: `rgba(0, 0, 0, 0.02) 0px 0px 16px 0px, rgba(0, 0, 0, 0.008) 0px 0px 8px 0px`
- Padding: 7.9px 15px 12.8px 15px

### Inputs
- Border: 0px solid rgb(38, 37, 30)
- Corner radius: 0px
- Padding: 8px 8px 6px 8px
- Font size: 13px

## Do's and Don'ts

- Do use `#c08532` for primary actions and CTAs
- Do use `CursorGothic` as the primary typeface
- Don't introduce colors outside the palette above
- Don't mix fonts beyond CursorGothic and Segoe UI
- Don't use border-radius values outside: 2px 0px 0px 2px, 3px, 4px, 8px, 10px, 12px, 50%, 9999px (pill)

---

*This DESIGN.md was generated by [brandmd](https://github.com/yuvrajangadsingh/brandmd) and validates against the official [@google/design.md](https://github.com/google-labs-code/design.md) linter. Drop it into your project root and AI coding agents (Claude Code, Cursor, Gemini CLI) will use it to generate on-brand UI.*