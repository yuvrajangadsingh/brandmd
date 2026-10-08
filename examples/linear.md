---
version: alpha
name: "Linear – The system for product development"
description: "Dark, high contrast"
colors:
  background: "#08090a"
  on-background: "#f7f8f8"
  surface: "#0f1011"
  on-surface-variant: "#8a8f98"
  outline: "#ffffff14"
  primary: "#4ea7fc"
  on-primary: "#1a1a1a"
  secondary: "#f79ce0"
  on-secondary: "#1a1a1a"
typography:
  display:
    fontFamily: Inter
    fontSize: 64px
    fontWeight: 510
    lineHeight: 1
  headline-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: 510
    lineHeight: 1
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: 400
    lineHeight: 1.33
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.71
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.17
rounded:
  sm: 4px
  md: 6px
  lg: 8px
  xl: 9px
  2xl: 12px
  full: 9999px
spacing:
  base: 8px
  xs: 2px
  sm: 3px
  md: 4px
  lg: 6px
  xl: 7px
components:
  button-primary:
    backgroundColor: "#e5e5e6"
    textColor: "#08090a"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    height: 44px
  button-secondary:
    backgroundColor: transparent
    typography: "{typography.label-sm}"
    rounded: 0px
    padding: 1px
    height: 28px
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    padding: 12px
  input:
    typography: "{typography.body-md}"
    rounded: 0px
---

> This is a real `DESIGN.md` example generated from [https://linear.app](https://linear.app) with `npx brandmd`.
>
> Drop a `DESIGN.md` like this in your project root so Claude Code, Cursor, Gemini CLI, Codex, or Google Stitch can use the colors, typography, spacing, and UI patterns when generating UI.
>
> Generate one for your site: `npx brandmd https://yoursite.com` ([npm](https://www.npmjs.com/package/brandmd) · [repo](https://github.com/yuvrajangadsingh/brandmd))


# Design System: Linear – The system for product development

> Extracted from [https://linear.app](https://linear.app) by brandmd

## Overview

**Visual character:** Dark, high contrast; black background dominates with white text and light pink accents

**Density:** spacious. The layout uses a varied spacing scale.

## Colors

Palette extracted from the live page. Token names below map to the machine-readable `colors` block above.

- **White** (`#f7f8f8`): Light text (on dark) (dominant)
- **Black** (`#08090a`): Dark background / footer (dominant)
- **Near-transparent White** (`#ffffff05`): Overlay / scrim (dominant)
- **Near-transparent White** (`#ffffff14`): Divider / border (dominant)
- **Gray** (`#8a8f98`): Secondary text (accent)
- **Gray** (`#62666d`): Secondary text (accent)
- **Light Pink** (`#f79ce0`): Link / accent text (accent)
- **Near-transparent Vivid Green** (`#00ff051a`): Overlay / scrim (accent)
- **Vivid Blue** (`#4ea7fc`): Accent background (accent)
- **Near-transparent Vivid Red** (`#f34e521a`): Overlay / scrim (accent)

**Incidental (low usage, do not lead with these):** `#e5e5e6`

## Typography

**Primary font:** Inter
**Secondary font:** Berkeley Mono

**Fonts by role:**
- Headings: Inter
- Body: Inter

**Type scale:**
- Headings: 24px, 48px, 64px
- Body / UI: 14px, 15px, 16px, 18px
- Captions / Small: 10px, 11px, 12px, 13px, 13.5px

**Weights in use:** 300, 400, 500, 510, 590

**Line heights:** 24px, 14px, 19.5px, 16px, 17px, 20px, 29px, 32px, 21px, 48px

**Letter spacing:** -0.13px, -0.165px, -0.15px, -0.182px, -0.039px, -0.06px

## Layout

**Spacing scale:** 3px, 4px, 6px, 7px, 8px, 10px, 12px, 32px

## Elevation & Depth

Uses 5 shadow styles for layering and elevation:

- Level 1: `rgba(0, 0, 0, 0.2) 0px 0px 0px 1px`
- Level 2: `rgba(0, 0, 0, 0.2) 0px 0px 12px 0px inset`
- Level 3: `rgba(0, 0, 0, 0.25) 0px 2px 32px 0px`
- Level 4: `rgba(255, 255, 255, 0.08) 0px 0px 0px 0.5px inset`
- Level 5: `rgba(255, 255, 255, 0.05) 0px 0px 0px 1px inset`

## Shapes

**Shape language:** Subtle rounding on interactive elements.

**Border radii:** 4px, 6px, 8px, 9px, 12px, 12px 12px 0px 0px, 50%, 9999px (pill)

Asymmetric / percentage radii observed (12px 12px 0px 0px, 50%); kept out of the ordinal `rounded` scale since they don't fit a magnitude order.

## Components

Observed from the live DOM. Machine-readable component tokens are in the `components` block above.

### Buttons
- Background: `#e5e5e6`
- Text color: `#08090a`
- Corner radius: 9999px
- Height: 44px
- Padding: 0px 20px 0px 20px
- Font: 16px, weight 510

### Cards
- Background: `#0f1011`
- Corner radius: 9px
- Shadow: `rgba(0, 0, 0, 0.2) 0px 0px 0px 1px`
- Padding: 12px 16px 16px 16px

### Inputs
- Border: 0px none rgba(0, 0, 0, 0)
- Corner radius: 0px
- Padding: 0px 32px 0px 63.8px
- Font size: 14px

## Do's and Don'ts

- Do use `#e5e5e6` for primary actions and CTAs
- Do use `Inter` as the primary typeface
- Don't introduce colors outside the palette above
- Don't mix fonts beyond Inter and Berkeley Mono
- Don't use border-radius values outside: 4px, 6px, 8px, 9px, 12px, 12px 12px 0px 0px, 50%, 9999px (pill)

---

*This DESIGN.md was generated by [brandmd](https://github.com/yuvrajangadsingh/brandmd) and validates against the official [@google/design.md](https://github.com/google-labs-code/design.md) linter. Drop it into your project root and AI coding agents (Claude Code, Cursor, Gemini CLI) will use it to generate on-brand UI.*