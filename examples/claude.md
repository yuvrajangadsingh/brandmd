---
version: alpha
name: "Claude"
description: "Bright, high contrast"
colors:
  background: "#faf9f5"
  on-background: "#000000"
  surface: "#5e5d59"
  on-surface-variant: "#87867f"
  outline: "#d1cfc5"
  outline-variant: "#30302e"
  primary: "#c6613f"
  on-primary: "#1a1a1a"
typography:
  display:
    fontFamily: anthropicSerif
    fontSize: 72px
    fontWeight: 330
    lineHeight: 1.1
  headline-lg:
    fontFamily: anthropicSerif
    fontSize: 52px
    fontWeight: 500
    lineHeight: 1.2
  headline-md:
    fontFamily: anthropicSerif
    fontSize: 30px
    fontWeight: 400
    lineHeight: 1.2
  body-md:
    fontFamily: anthropicSans
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.5
  body-lg:
    fontFamily: anthropicSans
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.63
  label-sm:
    fontFamily: anthropicSans
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.58
rounded:
  sm: 4px
  md: 8px
  lg: 9.5px
  xl: 12px
  2xl: 16px
  3xl: 24px
spacing:
  base: 4px
  xs: 6px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 20px
components:
  button-primary:
    backgroundColor: "#c6613f"
    typography: "{typography.label-sm}"
    rounded: "{rounded.md}"
    padding: 4px
    height: 28px
  button-secondary:
    backgroundColor: transparent
    typography: "{typography.label-sm}"
    rounded: "{rounded.sm}"
    padding: 8px
    height: 35px
  card:
    backgroundColor: "{colors.surface}"
    rounded: 0px
  input:
    typography: "{typography.body-md}"
    rounded: 0px
    padding: 4px
---

> This is a real `DESIGN.md` example generated from [https://claude.com](https://claude.com) with `npx brandmd`.
>
> Drop a `DESIGN.md` like this in your project root so Claude Code, Cursor, Gemini CLI, Codex, or Google Stitch can use the colors, typography, spacing, and UI patterns when generating UI.
>
> Generate one for your site: `npx brandmd https://yoursite.com` ([npm](https://www.npmjs.com/package/brandmd) · [repo](https://github.com/yuvrajangadsingh/brandmd))


# Design System: Claude

> Extracted from [https://claude.com](https://claude.com) by brandmd

## Overview

**Visual character:** Bright, high contrast; cream background dominates with black text and orange accents

**Density:** spacious. The layout uses a varied spacing scale.

**Motion:** Animation surfaces detected (scripted animation via requestAnimationFrame). The brand uses motion, so treat static tokens as a floor. Detection is presence-only; it does not describe the animations.

## Colors

Palette extracted from the live page. Token names below map to the machine-readable `colors` block above.

- **Black** (`#000000`): Primary text (dominant)
- **Cream** (`#faf9f5`): Page background (dominant)
- **Light gray** (`#d1cfc5`): Divider / border (dominant)
- **Dark gray** (`#30302e`): Divider / border (dominant)
- **Gray** (`#87867f`): Secondary text (accent)
- **Black** (`#141413`): Dark background / footer (accent)
- **Orange** (`#c6613f`): Accent background (accent)

**Incidental (low usage, do not lead with these):** `#5e5d59`

## Typography

**Primary font:** anthropicSerif
**Secondary font:** anthropicSans

**Fonts by role:**
- Headings: anthropicSans, anthropicSerif
- Body: anthropicSans

**All detected fonts:** anthropicSans (819), anthropicSerif (12), Segoe UI (1)

**Type scale:**
- Headings: 24px, 30px, 52px, 72px
- Body / UI: 14px, 15px, 16px, 17px, 19px, 23px
- Captions / Small: 11px, 12px

**Weights in use:** 330, 400, 500, 600, 700

**Line heights:** 22.5px, 26px, 19px, 24px, 18px, 17.5px, 19.5px, 27px, 20px, 62.5px

**Letter spacing:** 0.12px

## Layout

**Spacing scale:** 4px, 8px, 12px, 16px, 20px, 24px, 32px, 64px

**Base unit:** 4px grid — 99% of all weighted spacing values are multiples of 4.

## Elevation & Depth

Uses 5 shadow styles for layering and elevation:

- Level 1: `rgba(0, 0, 0, 0.1) 0px 4px 16px 0px`
- Level 2: `rgb(20, 20, 19) 0px 0px 0px 0px`
- Level 3: `rgb(250, 249, 245) 0px 0px 0px 0px, rgb(209, 207, 197) 0px 0px 0px 1px`
- Level 4: `rgba(0, 0, 0, 0.016) 0px 4px 24px 0px, rgba(0, 0, 0, 0.016) 0px 4px 32px 0px, rgba(0, 0, 0, 0.01) 0px 2px 64px 0px, rgba(0, 0, 0, 0.01) 0px 16px 32px 0px`
- Level 5: `color(srgb 0.85098 0.466667 0.341177 / 0.1) 0px 4px 20px 0px`

## Shapes

**Shape language:** Rounded, friendly aesthetic with generous corner radii.

**Border radii:** 4px, 8px, 9.5px, 12px, 12px 12px 0px 0px, 16px, 24px, 32px

Asymmetric / percentage radii observed (12px 12px 0px 0px); kept out of the ordinal `rounded` scale since they don't fit a magnitude order.

## Components

Observed from the live DOM. Machine-readable component tokens are in the `components` block above.

### Buttons
- Background: `#c6613f`
- Text color: `#ffffff`
- Corner radius: 8px
- Height: 28px
- Padding: 4px 4px 4px 4px
- Font: 12px, weight 400

### Cards
- Corner radius: 0px
- Padding: 0px 0px 0px 0px

### Inputs
- Border: 0px none rgb(250, 249, 245)
- Corner radius: 0px
- Padding: 4px 0px 4px 0px
- Font size: 12px

## Do's and Don'ts

- Do use a 4px grid for spacing
- Do use `#c6613f` for primary actions and CTAs
- Do use `anthropicSerif` as the primary typeface
- Don't introduce colors outside the palette above
- Don't mix fonts beyond anthropicSerif and anthropicSans
- Don't use border-radius values outside: 4px, 8px, 9.5px, 12px, 12px 12px 0px 0px, 16px, 24px, 32px

---

*This DESIGN.md was generated by [brandmd](https://github.com/yuvrajangadsingh/brandmd) and validates against the official [@google/design.md](https://github.com/google-labs-code/design.md) linter. Drop it into your project root and AI coding agents (Claude Code, Cursor, Gemini CLI) will use it to generate on-brand UI.*