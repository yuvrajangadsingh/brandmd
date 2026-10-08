---
version: alpha
name: "Supabase | The Postgres Development Platform"
description: "Bright, high contrast"
colors:
  background: "#fdfdfd"
  on-background: "#030303"
  on-surface-variant: "#696969"
  outline: "#03030315"
  outline-variant: "#696969b3"
  primary: "#fc1a58"
  on-primary: "#1a1a1a"
  secondary: "#fc541f"
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
  body-sm:
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
  sm: 5.5px
  md: 8px
  lg: 9px
  xl: 10.5px
  2xl: 15px
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
    backgroundColor: "#0e7e4e"
    textColor: "#fafcfb"
    typography: "{typography.label-sm}"
    rounded: "{rounded.md}"
    padding: 4px
    height: 26px
  button-primary-gradient-stop-1:
    backgroundColor: "#ffffff04"
  button-primary-gradient-stop-2:
    backgroundColor: "#00000003"
  button-secondary:
    backgroundColor: transparent
    typography: "{typography.label-sm}"
    rounded: 0px
    padding: 16px
    height: 60px
  card:
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

**Visual character:** Bright, high contrast; white background dominates with black text and vivid red accents

**Density:** spacious. The layout uses a varied spacing scale.

## Colors

Palette extracted from the live page. Token names below map to the machine-readable `colors` block above.

- **Near-transparent Black** (`#03030315`): Divider / border (dominant)
- **Black** (`#000000`): Primary text (dominant)
- **White** (`#fdfdfd`): Page background (dominant)
- **Dark gray** (`#464646`): Primary text (accent)
- **Translucent Gray** (`#6969694d`): Overlay / scrim (accent)
- **Dark Blue** (`#0c0f24`): Dark background / footer (accent)
- **Vivid Red** (`#fc1a58`): Accent background (accent)
- **Vivid Red** (`#fc541f`): Accent background (accent)

**Incidental (low usage, do not lead with these):** `#fafcfb`, `#a0a0a0`, `#00000003`, `#696969b3`

## Typography

**Primary font:** Manrope
**Secondary font:** Inter

**Fonts by role:**
- Headings: Manrope
- Body: Inter

**All detected fonts:** Inter (4179), Source Code Pro (96), Manrope (42)

**Type scale:**
- Headings: 34px, 46px
- Body / UI: 14px, 15px, 16px, 22px
- Captions / Small: 12px, 13px

**Weights in use:** 450, 500, 600

**Line heights:** 24px, 20px, 22px, 16px, 22.5px, 38px, 14px, 19.5px, 30.5px, 46px

**Letter spacing:** -0.16px

## Layout

**Spacing scale:** 4px, 8px, 10px, 12px, 16px, 24px, 32px, 96px

**Base unit:** 4px grid — 87% of all weighted spacing values are multiples of 4.

## Elevation & Depth

Uses 5 shadow styles for layering and elevation:

- Level 1: `rgba(0, 0, 0, 0.04) 0px 1px 3px 0px, rgba(0, 0, 0, 0.027) 0px 1px 0px 0px inset, rgba(0, 0, 0, 0.04) 0px 0px 0px 1px inset, rgba(0, 0, 0, 0.04) 0px -1px 0px 0px inset, rgba(0, 0, 0, 0.067) 0px 0px 0px 1px inset`
- Level 2: `rgba(255, 255, 255, 0.12) 0px 0px 0px 1px inset`
- Level 3: `oklab(0.999994 0.0000455678 0.0000200868 / 0.3) 0px 0px 0px 1px`
- Level 4: `rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.1) 0px 4px 6px -4px`
- Level 5: `rgba(0, 0, 0, 0.04) 0px 1px 3px 0px, rgba(0, 0, 0, 0.027) 0px 1px 0px 0px inset, rgba(0, 0, 0, 0.04) 0px 0px 0px 1px inset, rgba(0, 0, 0, 0.067) 0px 0px 0px 1px inset`

## Shapes

**Shape language:** Rounded, friendly aesthetic with generous corner radii.

**Border radii:** 5.5px, 8px, 9px, 10.5px, 15px, 16px, 21.5px, 9999px (pill)

## Components

Observed from the live DOM. Machine-readable component tokens are in the `components` block above.

### Buttons
- Background: `#0e7e4e` under `linear-gradient(rgba(255, 255, 255, 0.016), rgba(0, 0, 0, 0.01))`
- Text color: `#fafcfb`
- Corner radius: 8px
- Height: 26px
- Padding: 4px 10px 4px 10px
- Font: 12px, weight 500

### Cards
- Corner radius: 0px
- Padding: 0px 0px 0px 0px

### Inputs
- Background: `#00000004`
- Border: 1px solid oklch(0.1 0 337.5 / 0.146418)
- Corner radius: 8px
- Padding: 8px 8px 8px 8px
- Font size: 14px

## Do's and Don'ts

- Do use a 4px grid for spacing
- Do use `#0e7e4e` for primary actions and CTAs
- Do stick to 3 font weights: 450, 500, 600
- Do use `Manrope` as the primary typeface
- Don't introduce colors outside the palette above
- Don't mix fonts beyond Manrope and Inter
- Don't use border-radius values outside: 5.5px, 8px, 9px, 10.5px, 15px, 16px, 21.5px, 9999px (pill)

---

*This DESIGN.md was generated by [brandmd](https://github.com/yuvrajangadsingh/brandmd) and validates against the official [@google/design.md](https://github.com/google-labs-code/design.md) linter. Drop it into your project root and AI coding agents (Claude Code, Cursor, Gemini CLI) will use it to generate on-brand UI.*