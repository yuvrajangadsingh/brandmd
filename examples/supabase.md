---
version: alpha
name: "Supabase | The Postgres Development Platform"
description: "Bright, high contrast"
colors:
  background: "#fdfdfd"
  on-background: "#000000"
  surface: "#696969"
  on-surface-variant: "#a0a0a0"
  outline: "#03030314"
  outline-variant: "#16b674bf"
  primary: "#16b674bf"
  on-primary: "#1a1a1a"
  secondary: "#72e3ad"
  on-secondary: "#1a1a1a"
typography:
  display:
    fontFamily: Manrope
    fontSize: 46px
    fontWeight: 500
    lineHeight: 1
  headline-lg:
    fontFamily: Manrope
    fontSize: 34px
    fontWeight: 600
    lineHeight: 1.12
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 450
    lineHeight: 1.5
  body-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 450
    lineHeight: 1.43
  label-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.69
rounded:
  sm: 4px
  md: 6px
  lg: 8px
  xl: 11px
  2xl: 12px
  3xl: 16px
  full: 9999px
spacing:
  base: 8px
  xs: 1px
  sm: 4px
  md: 6px
  lg: 10px
  xl: 12px
components:
  button-primary:
    backgroundColor: "#72e3ad"
    textColor: "#030303"
    typography: "{typography.label-sm}"
    rounded: "{rounded.md}"
    padding: 4px
    height: 26px
  button-secondary:
    backgroundColor: transparent
    typography: "{typography.label-sm}"
    rounded: 0px
    padding: 16px
    height: 60px
  card:
    backgroundColor: "{colors.surface}"
    rounded: 0px
  input:
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 8px
---

> This is a real `DESIGN.md` example generated from [https://supabase.com](https://supabase.com) with `npx brandmd`.
>
> Drop a `DESIGN.md` like this in your project root so Claude Code, Cursor, Gemini CLI, Codex, or Google Stitch can use the colors, typography, spacing, and UI patterns when generating UI.
>
> Generate one for your site: `npx brandmd https://yoursite.com` ([npm](https://www.npmjs.com/package/brandmd) · [repo](https://github.com/yuvrajangadsingh/brandmd))


# Design System: Supabase | The Postgres Development Platform

> Extracted from [https://supabase.com](https://supabase.com) by brandmd

## Overview

**Visual character:** Bright, high contrast; white background dominates with black text and green accents

**Density:** spacious. The layout uses a varied spacing scale.

## Colors

Palette extracted from the live page. Token names below map to the machine-readable `colors` block above.

- **Near-transparent Black** (`#03030315`): Divider / border (dominant)
- **Black** (`#000000`): Primary text (dominant)
- **White** (`#fdfdfd`): Page background (dominant)
- **Dark gray** (`#464646`): Primary text (accent)
- **Near-transparent Black** (`#00000000`): Overlay / scrim (accent)
- **Gray** (`#696969`): Secondary background (accent)
- **Green** (`#72e3ad`): Accent background (accent)
- **Green** (`#16b674bf`): Focus / active border (accent)
- **Near-transparent Blue** (`#635bff0d`): Overlay / scrim (accent)
- **Purple** (`#be93e4`): Accent background (accent)

**Incidental (low usage, do not lead with these):** `#a0a0a0`, `#ffffff`

## Typography

**Primary font:** Manrope
**Secondary font:** Inter

**Fonts by role:**
- Headings: Manrope
- Body: Inter

**All detected fonts:** Inter (4165), Source Code Pro (96), Manrope (42)

**Type scale:**
- Headings: 34px, 46px
- Body / UI: 14px, 15px, 16px, 22px
- Captions / Small: 12px, 13px

**Weights in use:** 450, 500, 600

**Line heights:** 24px, 20px, 22px, 16px, 22.5px, 38px, 14px, 19.5px, 30.5px, 46px

**Letter spacing:** -0.16px

## Layout

**Spacing scale:** 1px, 4px, 8px, 12px, 16px, 24px, 32px, 96px

**Base unit:** 4px grid — 89% of all weighted spacing values are multiples of 4.

## Elevation & Depth

Uses 4 shadow styles for layering and elevation:

- Level 1: `rgba(255, 255, 255, 0.12) 0px 0px 0px 1px inset`
- Level 2: `rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, oklab(0.999994 0.0000455678 0.0000200868 / 0.3) 0px 0px 0px 1px, rgba(0, 0, 0, 0) 0px 0px 0px 0px`
- Level 3: `rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px`
- Level 4: `rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.1) 0px 4px 6px -4px`

## Shapes

**Shape language:** Rounded, friendly aesthetic with generous corner radii.

**Border radii:** 4px, 6px, 8px, 8px 8px 0px 0px, 11px, 12px, 16px, 9999px (pill)

Asymmetric / percentage radii observed (8px 8px 0px 0px); kept out of the ordinal `rounded` scale since they don't fit a magnitude order.

## Components

Observed from the live DOM. Machine-readable component tokens are in the `components` block above.

### Buttons
- Background: `#72e3ad`
- Text color: `#030303`
- Corner radius: 6px
- Height: 26px
- Padding: 4px 10px 4px 10px
- Font: 12px, weight 450

### Cards
- Corner radius: 0px
- Padding: 0px 0px 0px 0px

### Inputs
- Background: `#03030307`
- Border: 1px solid oklch(0.1 0 34 / 0.146418)
- Corner radius: 6px
- Padding: 8px 8px 8px 8px
- Font size: 14px

## Do's and Don'ts

- Do use a 4px grid for spacing
- Do use `#16b674bf` for primary actions and CTAs
- Do stick to 3 font weights: 450, 500, 600
- Do use `Manrope` as the primary typeface
- Don't introduce colors outside the palette above
- Don't mix fonts beyond Manrope and Inter
- Don't use border-radius values outside: 4px, 6px, 8px, 8px 8px 0px 0px, 11px, 12px, 16px, 9999px (pill)

---

*This DESIGN.md was generated by [brandmd](https://github.com/yuvrajangadsingh/brandmd) and validates against the official [@google/design.md](https://github.com/google-labs-code/design.md) linter. Drop it into your project root and AI coding agents (Claude Code, Cursor, Gemini CLI) will use it to generate on-brand UI.*