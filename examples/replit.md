---
version: alpha
name: "Welcome to Replit - Replit"
description: "Bright, high contrast"
colors:
  background: "#f6f6f4"
  on-background: "#1d1d1d"
  surface: "#f1f1ee"
  on-surface-variant: "#5c5c5c"
  outline: "#f5efee"
  outline-variant: "#6d483a1f"
  primary: "#ff3c00"
  on-primary: "#1a1a1a"
  secondary: "#ff9a78"
  on-secondary: "#1a1a1a"
typography:
  display:
    fontFamily: ABC Diatype Plus
    fontSize: 56px
    fontWeight: 700
    lineHeight: 1.1
  headline-lg:
    fontFamily: ABC Diatype Plus
    fontSize: 40px
    fontWeight: 700
    lineHeight: 1
  headline-md:
    fontFamily: ABC Diatype Plus
    fontSize: 27px
    fontWeight: 700
    lineHeight: 1
  body-md:
    fontFamily: ABC Diatype Plus
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.75
  body-sm:
    fontFamily: ABC Diatype Plus
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.43
  label-sm:
    fontFamily: ABC Diatype Plus
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.77
rounded:
  sm: 6px
  md: 9px
  lg: 10px
  xl: 11px
  2xl: 12px
  3xl: 13px
  full: 9999px
spacing:
  base: 12px
  xs: 4px
  sm: 6px
  md: 7.5px
  lg: 8px
  xl: 9px
components:
  button-primary:
    backgroundColor: "#ffffff80"
    textColor: "#57514f"
    typography: "{typography.label-sm}"
    rounded: "{rounded.2xl}"
    padding: 8px
    height: 34px
  button-secondary:
    backgroundColor: transparent
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    height: 36px
  card:
    backgroundColor: "{colors.surface}"
    rounded: 16px
    padding: 52px
  input:
    typography: "{typography.body-md}"
    rounded: 0px
    padding: 10px
---

> This is a real `DESIGN.md` example generated from [https://docs.replit.com](https://docs.replit.com) with `npx brandmd`.
>
> Drop a `DESIGN.md` like this in your project root so Claude Code, Cursor, Gemini CLI, Codex, or Google Stitch can use the colors, typography, spacing, and UI patterns when generating UI.
>
> Generate one for your site: `npx brandmd https://yoursite.com` ([npm](https://www.npmjs.com/package/brandmd) · [repo](https://github.com/yuvrajangadsingh/brandmd))


# Design System: Welcome to Replit - Replit

> Extracted from [https://docs.replit.com](https://docs.replit.com) by brandmd

> ⚠️ **Provenance:** `https://docs.replit.com` redirected to `https://docs.replit.com/welcome`. These tokens may describe that page, not the URL you asked for.

## Overview

**Visual character:** Bright, high contrast; off-white background dominates with black text and vivid red accents

**Density:** spacious. The layout uses a varied spacing scale.

**Motion:** Animation surfaces detected (scripted animation via requestAnimationFrame). The brand uses motion, so treat static tokens as a floor. Detection is presence-only; it does not describe the animations.

## Colors

Palette extracted from the live page. Token names below map to the machine-readable `colors` block above.

- **Off-white** (`#f5efee`): Divider / border (dominant)
- **Off-white** (`#f6f6f4`): Page background (dominant)
- **Black** (`#000000`): Primary text (dominant)
- **Gray** (`#77716f`): Secondary text (dominant)
- **Near-transparent White** (`#ffffff29`): Overlay / scrim (accent)
- **Gray** (`#a6a09e`): Muted text (accent)
- **Muted Orange** (`#bca39a`): Secondary background (accent)
- **Vivid Red** (`#ff3c00`): Accent background (accent)
- **Orange** (`#ff9a78`): Accent background (accent)

**Incidental (low usage, do not lead with these):** `#ffffff`, `#6d483a1f`, `#191818`

## Typography

**Primary font:** ABC Diatype Plus

**Fonts by role:**
- Headings: ABC Diatype Plus
- Body: ABC Diatype Plus

**Type scale:**
- Headings: 25px, 27px, 40px, 56px
- Body / UI: 14px, 15px, 16px, 17px, 19px
- Captions / Small: 11px, 12px, 13px

**Weights in use:** 400, 600, 650, 700

**Line heights:** 28px, 24px, 20px, 19px, 40px, 23px, 61.5px, 17.5px, 18px, 27px

**Letter spacing:** -0.8px, -0.3px, -1.68px, -0.54px, -0.875px

## Layout

**Spacing scale:** 4px, 6px, 8px, 10px, 12px, 14px, 16px, 18px

## Elevation & Depth

Uses 5 shadow styles for layering and elevation:

- Level 1: `rgba(74, 18, 0, 0.18) 0px 12px 24px 0px`
- Level 2: `rgba(90, 54, 39, 0.08) 0px 16px 30px 0px`
- Level 3: `oklab(0.710195 0.00588661 0.00483012 / 0.3) 0px 0px 0px 1px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px`
- Level 4: `rgba(89, 50, 34, 0.08) 0px 20px 40px 0px`
- Level 5: `rgba(44, 16, 8, 0.16) 0px 10px 20px 0px`

## Shapes

**Shape language:** Rounded, friendly aesthetic with generous corner radii.

**Border radii:** 6px, 9px, 10px, 11px, 12px, 13px, 14px, 9999px (pill)

## Components

Observed from the live DOM. Machine-readable component tokens are in the `components` block above.

### Buttons
- Background: `#ffffff80`
- Text color: `#57514f`
- Corner radius: 12px
- Height: 34px
- Padding: 8px 14px 8px 14px
- Font: 16px, weight 400

### Cards
- Background: `#f1f1ee`
- Corner radius: 16px
- Padding: 52px 52px 52px 52px

### Inputs
- Border: 0px solid rgb(245, 239, 238)
- Corner radius: 0px
- Padding: 10px 40px 10px 14px
- Font size: 14px

## Do's and Don'ts

- Do use `#ff3c00` for primary actions and CTAs
- Do stick to 4 font weights: 400, 600, 650, 700
- Do use `ABC Diatype Plus` as the primary typeface
- Don't introduce colors outside the palette above
- Don't mix fonts; use ABC Diatype Plus everywhere
- Don't use border-radius values outside: 6px, 9px, 10px, 11px, 12px, 13px, 14px, 9999px (pill)

---

*This DESIGN.md was generated by [brandmd](https://github.com/yuvrajangadsingh/brandmd) and validates against the official [@google/design.md](https://github.com/google-labs-code/design.md) linter. Drop it into your project root and AI coding agents (Claude Code, Cursor, Gemini CLI) will use it to generate on-brand UI.*