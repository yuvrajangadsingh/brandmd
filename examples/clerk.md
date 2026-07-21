---
version: alpha
name: "Clerk | Authentication and User Management"
description: "Bright, high contrast"
colors:
  background: "#f7f7f8"
  on-background: "#000000"
  on-surface-variant: "#5e5f6e"
  outline: "#d9d9de"
  outline-variant: "#13131600"
  primary: "#6c47ff"
  on-primary: "#ffffff"
  secondary: "#3ad4fd14"
  on-secondary: "#1a1a1a"
typography:
  display:
    fontFamily: geistNumbers
    fontSize: 32px
    fontWeight: 600
    lineHeight: 1.25
  body-md:
    fontFamily: geistNumbers
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  body-lg:
    fontFamily: geistNumbers
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.6
  label-sm:
    fontFamily: geistNumbers
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.54
rounded:
  sm: 4px
  md: 6px
  lg: 8px
  xl: 10px
  2xl: 12px
  3xl: 16px
  full: 9999px
spacing:
  base: 8px
  xs: 1px
  sm: 2px
  md: 4px
  lg: 6px
  xl: 10px
components:
  button-primary:
    backgroundColor: "#212126"
    textColor: "#ffffff"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    height: 40px
  button-secondary:
    backgroundColor: transparent
    typography: "{typography.label-sm}"
    rounded: 0px
    height: 20px
---

> This is a real `DESIGN.md` example generated from [https://clerk.com](https://clerk.com) with `npx brandmd`.
>
> Drop a `DESIGN.md` like this in your project root so Claude Code, Cursor, Gemini CLI, Codex, or Google Stitch can use the colors, typography, spacing, and UI patterns when generating UI.
>
> Generate one for your site: `npx brandmd https://yoursite.com` ([npm](https://www.npmjs.com/package/brandmd) · [repo](https://github.com/yuvrajangadsingh/brandmd))


# Design System: Clerk | Authentication and User Management

> Extracted from [https://clerk.com](https://clerk.com) by brandmd

## Overview

**Visual character:** Bright, high contrast; white background dominates with black text and near-transparent vivid cyan accents

**Density:** spacious. The layout uses a varied spacing scale.

**Motion:** Animation surfaces detected (canvas rendering). The brand uses motion, so treat static tokens as a floor. Detection is presence-only; it does not describe the animations.

## Colors

Palette extracted from the live page. Token names below map to the machine-readable `colors` block above.

- **Light gray** (`#d9d9de`): Divider / border (dominant)
- **Black** (`#000000`): Primary text (dominant)
- **White** (`#f7f7f8`): Page background (dominant)
- **Gray** (`#5e5f6e`): Secondary text (accent)
- **Near-transparent Black** (`#13131626`): Overlay / scrim (accent)
- **Dark gray** (`#42434d`): Dark background / footer (accent)
- **Near-transparent Vivid Cyan** (`#3ad4fd14`): Overlay / scrim (accent)
- **Vivid Purple** (`#6c47ff`): Accent background (accent)

**Incidental (low usage, do not lead with these):** `#ffffff`, `#9394a1`, `#13131600`, `#7476860d`

## Typography

**Primary font:** geistNumbers
**Secondary font:** Segoe UI Symbol

**Fonts by role:**
- Headings: geistNumbers, Segoe UI Symbol
- Body: geistNumbers
- Buttons / nav: soehneMono

**All detected fonts:** geistNumbers (1806), Segoe UI Symbol (795), Inter (169), soehneMono (53)

**Type scale:**
- Headings: 32px
- Body / UI: 14px, 15px, 16px, 17px, 18px
- Captions / Small: 8px, 9px, 10px, 11px, 12px, 13px

**Weights in use:** 400, 450, 500, 600, 700

**Line heights:** 24px, 18px, 20px, 16px, 14px, 13px, 12px, 15px, 40px, 28px

**Letter spacing:** -0.12px, 1.2px, -0.48px, 1px, 0.12px, -0.17px

## Layout

**Spacing scale:** 4px, 6px, 8px, 10px, 12px, 16px, 20px, 24px

## Elevation & Depth

Uses 5 shadow styles for layering and elevation:

- Level 1: `rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, oklab(0.188081 0.0016512 -0.00579907 / 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.08) 0px 5px 15px 0px, rgba(25, 28, 33, 0.2) 0px 15px 35px -5px`
- Level 2: `rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(0, 0, 0, 0.1) 0px 1px 2px -1px`
- Level 3: `rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, oklab(0.999994 0.0000455678 0.0000200868 / 0.05) 0px 0px 0px 1px inset, rgba(0, 0, 0, 0) 0px 0px 0px 0px`
- Level 4: `rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, lab(84.5189 -31.4667 -23.9754 / 0.08) 0px 0px 0px 1px inset, rgba(0, 0, 0, 0) 0px 0px 0px 0px`
- Level 5: `rgba(0, 0, 0, 0) 0px 0px 0px 0px, oklab(0.249859 0.00254738 -0.00901626 / 0.1) 0px 0px 0px 1px inset, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px`

## Shapes

**Shape language:** Rounded, friendly aesthetic with generous corner radii.

**Border radii:** 4px, 6px, 8px, 10px, 12px, 16px, 50%, 9999px (pill)

Asymmetric / percentage radii observed (50%); kept out of the ordinal `rounded` scale since they don't fit a magnitude order.

## Components

Observed from the live DOM. Machine-readable component tokens are in the `components` block above.

### Buttons
- Background: `#212126`
- Text color: `#000000`
- Corner radius: 3.35544e+07px
- Height: 40px
- Padding: 0px 0px 0px 0px
- Font: 16px, weight 400

## Do's and Don'ts

- Do use `#6c47ff` for primary actions and CTAs
- Do use `geistNumbers` as the primary typeface
- Don't introduce colors outside the palette above
- Don't mix fonts beyond geistNumbers and Segoe UI Symbol
- Don't use border-radius values outside: 4px, 6px, 8px, 10px, 12px, 16px, 50%, 9999px (pill)

---

*This DESIGN.md was generated by [brandmd](https://github.com/yuvrajangadsingh/brandmd) and validates against the official [@google/design.md](https://github.com/google-labs-code/design.md) linter. Drop it into your project root and AI coding agents (Claude Code, Cursor, Gemini CLI) will use it to generate on-brand UI.*