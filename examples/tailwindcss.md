---
version: alpha
name: "Tailwind CSS - Rapidly build modern websites without ever leaving your HTML."
description: "Bright, high contrast"
colors:
  background: "#ffffff"
  on-background: "#000000"
  on-surface-variant: "#90a1b9"
  outline: "#0000000d"
  primary: "#00a6f4"
  on-primary: "#1a1a1a"
  secondary: "#00bcff1a"
  on-secondary: "#1a1a1a"
typography:
  display:
    fontFamily: inter
    fontSize: 96px
    fontWeight: 400
    lineHeight: 1
  headline-lg:
    fontFamily: inter
    fontSize: 40px
    fontWeight: 500
    lineHeight: 1
  headline-md:
    fontFamily: inter
    fontSize: 36px
    fontWeight: 600
    lineHeight: 1.33
  body-md:
    fontFamily: inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  body-lg:
    fontFamily: inter
    fontSize: 14px
    fontWeight: 400
    lineHeight: 2
  label-sm:
    fontFamily: inter
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.85
rounded:
  sm: 4px
  md: 8px
  lg: 12px
  xl: 16px
  2xl: 24px
  3xl: 32px
  full: 9999px
spacing:
  base: 8px
  xs: 2px
  sm: 4px
  md: 10px
  lg: 12px
  xl: 16px
components:
  button-primary:
    backgroundColor: "#f6339a"
    textColor: "#1a1a1a"
    typography: "{typography.label-sm}"
    rounded: "{rounded.md}"
    padding: 8px
    height: 40px
  button-secondary:
    backgroundColor: transparent
    typography: "{typography.label-sm}"
    rounded: "{rounded.sm}"
    padding: 4px
    height: 28px
  input:
    typography: "{typography.body-md}"
    rounded: 0px
---

> This is a real `DESIGN.md` example generated from [https://tailwindcss.com](https://tailwindcss.com) with `npx brandmd`.
>
> Drop a `DESIGN.md` like this in your project root so Claude Code, Cursor, Gemini CLI, Codex, or Google Stitch can use the colors, typography, spacing, and UI patterns when generating UI.
>
> Generate one for your site: `npx brandmd https://yoursite.com` ([npm](https://www.npmjs.com/package/brandmd) · [repo](https://github.com/yuvrajangadsingh/brandmd))


# Design System: Tailwind CSS - Rapidly build modern websites without ever leaving your HTML.

> Extracted from [https://tailwindcss.com](https://tailwindcss.com) by brandmd

## Overview

**Visual character:** Bright, high contrast; white background dominates with black text and vivid cyan accents

**Density:** spacious. The layout uses a varied spacing scale.

## Colors

Palette extracted from the live page. Token names below map to the machine-readable `colors` block above.

- **Black** (`#000000`): Primary text (dominant)
- **Near-transparent Dark Blue** (`#0307120d`): Overlay / scrim (dominant)
- **White** (`#ffffff`): Page background (dominant)
- **Near-transparent Black** (`#0000000d`): Divider / border (dominant)
- **Muted Blue** (`#90a1b9`): Muted text (accent)
- **Vivid Cyan** (`#00a6f4`): Link / accent text (accent)
- **Near-transparent Vivid Cyan** (`#00bcff1a`): Overlay / scrim (accent)
- **Vivid Purple** (`#5d0ec0`): Accent background (accent)
- **Vivid Pink** (`#f6339a`): Accent background (accent)
- **Orange** (`#7e2a0c`): Accent background (accent)

## Typography

**Primary font:** inter
**Secondary font:** plexMono

**Fonts by role:**
- Headings: inter
- Body: inter

**Type scale:**
- Headings: 24px, 30px, 36px, 40px, 96px
- Body / UI: 14px, 16px, 17px, 18px, 20px
- Captions / Small: 12px, 13px

**Weights in use:** 400, 500, 600, 700

**Line heights:** 24px, 28px, 20px, 40px, 16px, 48px, 96px, 36px

**Letter spacing:** 1.2px, -2px, 1.4px, -4.8px

## Layout

**Spacing scale:** 4px, 8px, 12px, 16px, 24px, 32px, 36px, 40px

**Base unit:** 4px grid — 97% of all weighted spacing values are multiples of 4.

## Elevation & Depth

Uses 5 shadow styles for layering and elevation:

- Level 1: `rgba(0, 0, 0, 0) 0px 0px 0px 0px, oklab(0.129999 -0.00404751 -0.027702 / 0.1) 0px 0px 0px 1px inset, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px`
- Level 2: `rgba(0, 0, 0, 0) 0px 0px 0px 0px, oklab(0.999994 0.0000455678 0.0000200868 / 0.2) 0px 0px 0px 1px inset, rgba(0, 0, 0, 0) 0px 0px 0px 0px, oklab(0.129999 -0.00404751 -0.027702 / 0.1) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(0, 0, 0, 0.1) 0px 1px 2px -1px`
- Level 3: `rgba(0, 0, 0, 0) 0px 0px 0px 0px, oklab(0.999994 0.0000455678 0.0000200868 / 0.05) 0px 0px 0px 1px inset, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px`
- Level 4: `rgba(0, 0, 0, 0) 0px 0px 0px 0px, oklab(0.999994 0.0000455678 0.0000200868 / 0.1) 0px 0px 0px 1px inset, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px`
- Level 5: `rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(0, 0, 0, 0.1) 0px 1px 2px -1px`

## Shapes

**Shape language:** Rounded, friendly aesthetic with generous corner radii.

**Border radii:** 4px, 8px, 12px, 16px, 16px 16px 0px 0px, 24px, 32px, 9999px (pill)

Asymmetric / percentage radii observed (16px 16px 0px 0px); kept out of the ordinal `rounded` scale since they don't fit a magnitude order.

## Components

Observed from the live DOM. Machine-readable component tokens are in the `components` block above.

### Buttons
- Background: `#f6339a`
- Text color: `#ffffff`
- Corner radius: 8px
- Height: 40px
- Padding: 8px 12px 8px 12px
- Font: 14px, weight 700

### Inputs
- Border: 0px solid rgb(0, 0, 0)
- Corner radius: 0px
- Padding: 0px 0px 0px 0px
- Font size: 16px

## Do's and Don'ts

- Do use a 4px grid for spacing
- Do use `#00a6f4` for primary actions and CTAs
- Do stick to 4 font weights: 400, 500, 600, 700
- Do use `inter` as the primary typeface
- Don't introduce colors outside the palette above
- Don't mix fonts beyond inter and plexMono
- Don't use border-radius values outside: 4px, 8px, 12px, 16px, 16px 16px 0px 0px, 24px, 32px, 9999px (pill)

---

*This DESIGN.md was generated by [brandmd](https://github.com/yuvrajangadsingh/brandmd) and validates against the official [@google/design.md](https://github.com/google-labs-code/design.md) linter. Drop it into your project root and AI coding agents (Claude Code, Cursor, Gemini CLI) will use it to generate on-brand UI.*