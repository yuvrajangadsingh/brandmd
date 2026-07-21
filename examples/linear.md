---
version: alpha
name: "Linear – The system for product development"
description: "Dark, high contrast"
colors:
  background: "#08090a"
  on-background: "#f7f8f8"
  surface: "#e5e5e6"
  on-surface-variant: "#62666d"
  outline: "#24282c"
  primary: "#06b6d4"
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
  body-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.71
  label-sm:
    fontFamily: Inter
    fontSize: 13.5px
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: 2px
  md: 4px
  lg: 6px
  xl: 8px
  2xl: 12px
  full: 9999px
spacing:
  base: 8px
  xs: 1px
  sm: 2px
  md: 4px
  lg: 5px
  xl: 6px
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
    rounded: "{rounded.sm}"
    height: 20px
  card:
    backgroundColor: "{colors.surface}"
    rounded: 0px
    padding: 12px
  input:
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 12px
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
- **Light gray** (`#e5e5e6`): Surface / card background (dominant)
- **Gray** (`#62666d`): Secondary text (accent)
- **Gray** (`#8a8f98`): Secondary text (accent)
- **Light Pink** (`#f79ce0`): Link / accent text (accent)
- **Near-transparent Vivid Green** (`#00ff051a`): Overlay / scrim (accent)
- **Dark gray** (`#24282c`): Divider / border (accent)
- **Blue** (`#5e6ad2`): Accent background (accent)
- **Red** (`#eb5757`): Accent background (accent)
- **Vivid Cyan** (`#06b6d4`): Accent background (accent)

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

**Weights in use:** 300, 400, 510, 590

**Line heights:** 24px, 17px, 19.5px, 15px, 21px, 32px, 18px, 29px, 48px, 64px

**Letter spacing:** -0.13px, -0.165px, -0.182px, -0.15px, -0.12px, -1.056px

## Layout

**Spacing scale:** 2px, 4px, 5px, 6px, 8px, 12px, 24px, 32px

## Elevation & Depth

Uses 5 shadow styles for layering and elevation:

- Level 1: `rgba(0, 0, 0, 0.03) 0px 1.2px 0px 0px`
- Level 2: `rgba(0, 0, 0, 0.4) 0px 2px 4px 0px`
- Level 3: `rgba(0, 0, 0, 0.2) 0px 0px 12px 0px inset`
- Level 4: `rgb(35, 37, 42) 0px 0px 0px 1px inset`
- Level 5: `rgba(0, 0, 0, 0.2) 0px 0px 0px 1px`

## Shapes

**Shape language:** Subtle rounding on interactive elements.

**Border radii:** 2px, 4px, 6px, 8px, 12px, 12px 12px 0px 0px, 50%, 9999px (pill)

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
- Corner radius: 0px
- Padding: 12px 12px 0px 12px

### Inputs
- Background: `#ffffff05`
- Border: 1px solid rgba(255, 255, 255, 0.08)
- Corner radius: 6px
- Padding: 12px 14px 12px 14px
- Font size: 13.3333px

## Do's and Don'ts

- Do use `#06b6d4` for primary actions and CTAs
- Do stick to 4 font weights: 300, 400, 510, 590
- Do use `Inter` as the primary typeface
- Don't introduce colors outside the palette above
- Don't mix fonts beyond Inter and Berkeley Mono
- Don't use border-radius values outside: 2px, 4px, 6px, 8px, 12px, 12px 12px 0px 0px, 50%, 9999px (pill)

---

*This DESIGN.md was generated by [brandmd](https://github.com/yuvrajangadsingh/brandmd) and validates against the official [@google/design.md](https://github.com/google-labs-code/design.md) linter. Drop it into your project root and AI coding agents (Claude Code, Cursor, Gemini CLI) will use it to generate on-brand UI.*