---
version: alpha
name: "Shopify: The All-in-One Commerce Platform for Businesses - Shopify"
description: "Dark, high contrast"
colors:
  background: "#02090a"
  on-background: "#a1a1aa"
  outline: "#e5e7eb"
  outline-variant: "#1e2c31"
  primary: "#36f4a4"
  on-primary: "#1a1a1a"
typography:
  display:
    fontFamily: Shopify-Inter
    fontSize: 96px
    fontWeight: 300
    lineHeight: 1.08
  headline-lg:
    fontFamily: Shopify-Inter
    fontSize: 64px
    fontWeight: 330
    lineHeight: 1.08
  headline-md:
    fontFamily: Shopify-Inter
    fontSize: 56px
    fontWeight: 330
    lineHeight: 1.08
  body-md:
    fontFamily: Shopify-Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: Shopify-Inter
    fontSize: 14px
    fontWeight: 420
    lineHeight: 1.43
  label-sm:
    fontFamily: Shopify-Inter
    fontSize: 12px
    fontWeight: 420
    lineHeight: 1.21
rounded:
  sm: 4px
  md: 5px
  lg: 8px
  xl: 12px
  2xl: 340px
  full: 9999px
spacing:
  base: 12px
  xs: 2px
  sm: 4px
  md: 5px
  lg: 8px
  xl: 10px
components:
  button-primary:
    backgroundColor: "#ffffff"
    textColor: "#000000"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: 8px
    height: 44px
  button-secondary:
    backgroundColor: transparent
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: 12px
    height: 56px
  card:
    backgroundColor: "{colors.background}"
    rounded: 0px
    padding: 72px
  input:
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 24px
---

> This is a real `DESIGN.md` example generated from [https://shopify.com](https://shopify.com) with `npx brandmd`.
>
> Drop a `DESIGN.md` like this in your project root so Claude Code, Cursor, Gemini CLI, Codex, or Google Stitch can use the colors, typography, spacing, and UI patterns when generating UI.
>
> Generate one for your site: `npx brandmd https://yoursite.com` ([npm](https://www.npmjs.com/package/brandmd) · [repo](https://github.com/yuvrajangadsingh/brandmd))


# Design System: Shopify: The All-in-One Commerce Platform for Businesses - Shopify

> Extracted from [https://shopify.com](https://shopify.com) by brandmd

> ⚠️ **Provenance:** `https://shopify.com` redirected to `https://www.shopify.com/`. These tokens may describe that page, not the URL you asked for.

## Overview

**Visual character:** Dark, high contrast; dark cyan background dominates with white text and vivid green accents

**Density:** spacious. The layout uses a varied spacing scale.

**Motion:** Animation surfaces detected (canvas rendering). The brand uses motion, so treat static tokens as a floor. Detection is presence-only; it does not describe the animations.

## Colors

Palette extracted from the live page. Token names below map to the machine-readable `colors` block above.

_The page background `#02090a` is the surface that fills the viewport; it is not among the most frequent fills listed below._

- **Off-white** (`#e5e7eb`): Divider / border (dominant)
- **Black** (`#000000`): Dark background / footer (dominant)
- **Gray** (`#a1a1aa`): Muted text (accent)
- **White** (`#ffffff`): Page background (accent)
- **Near-transparent White** (`#ffffff0f`): Overlay / scrim (accent)
- **Vivid Green** (`#36f4a4`): Link / accent text (accent)
- **Translucent Vivid Blue** (`#1260ff59`): Overlay / scrim (accent)
- **Dark Green** (`#0d3a2d`): Dark background / footer (accent)

**Incidental (low usage, do not lead with these):** `#3f3f4b80`, `#1e2c31`

## Typography

**Primary font:** Shopify-Inter
**Secondary font:** SFMono-Regular

**Fonts by role:**
- Headings: Shopify-Inter
- Body: Shopify-Inter

**Type scale:**
- Headings: 24px, 34px, 44px, 56px, 64px, 96px
- Body / UI: 14px, 16px, 18px, 20px
- Captions / Small: 12px, 13px

**Weights in use:** 300, 330, 400, 420, 450, 550

**Line heights:** 24px, 20px, 103.5px, 19px, 25px, 28px, 26px, 18px, 14.5px, 31px

**Letter spacing:** -1.92px, 0.72px, -1.68px, 0.28px, -0.44px, -0.24px

## Layout

**Spacing scale:** 4px, 8px, 10px, 12px, 16px, 24px, 32px, 90px

## Elevation & Depth

Uses 5 shadow styles for layering and elevation:

- Level 1: `rgba(255, 255, 255, 0.03) 0px 0.929px 0px 0px inset, rgba(0, 0, 0, 0.1) 0px 0px 0px 0.929px, rgba(0, 0, 0, 0.1) 0px 1.858px 1.858px 0px, rgba(0, 0, 0, 0.1) 0px 3.717px 3.717px 0px`
- Level 2: `rgba(0, 0, 0, 0.25) 0px 25px 50px -12px`
- Level 3: `rgba(255, 255, 255, 0.08) 0px 0px 0px 1px, rgba(0, 0, 0, 0.3) 0px 1px 3px 0px, rgba(0, 0, 0, 0.2) 0px 5px 10px 0px`
- Level 4: `rgba(0, 0, 0, 0.1) 0px 8px 8px 0px, rgba(0, 0, 0, 0.1) 0px 4px 4px 0px, rgba(0, 0, 0, 0.1) 0px 2px 2px 0px, rgba(0, 0, 0, 0.1) 0px 0px 0px 1px, rgba(255, 255, 255, 0.03) 0px 1px 0px 0px inset`
- Level 5: `rgba(255, 255, 255, 0.05) 0px 1px 2px 0px, rgba(255, 255, 255, 0.04) 0px 1px 0px 0px inset`

## Shapes

**Shape language:** Rounded, friendly aesthetic with generous corner radii.

**Border radii:** 0px 0px 12px 12px, 4px, 5px, 8px, 12px, 20px 20px 0px 0px, 340px, 9999px (pill)

Asymmetric / percentage radii observed (0px 0px 12px 12px, 20px 20px 0px 0px); kept out of the ordinal `rounded` scale since they don't fit a magnitude order.

## Components

Observed from the live DOM. Machine-readable component tokens are in the `components` block above.

### Buttons
- Background: `#ffffff`
- Text color: `#000000`
- Corner radius: 9999px
- Height: 44px
- Padding: 8px 20px 8px 20px
- Font: 16px, weight 550

### Cards
- Background: `#02090a`
- Corner radius: 0px
- Padding: 72px 0px 0px 0px

### Inputs
- Border: 0px solid rgb(229, 231, 235)
- Corner radius: 8px
- Padding: 24px 16px 8px 16px
- Font size: 16px

## Do's and Don'ts

- Do use `#36f4a4` for primary actions and CTAs
- Do use `Shopify-Inter` as the primary typeface
- Don't introduce colors outside the palette above
- Don't mix fonts beyond Shopify-Inter and SFMono-Regular
- Don't use border-radius values outside: 0px 0px 12px 12px, 4px, 5px, 8px, 12px, 20px 20px 0px 0px, 340px, 9999px (pill)

---

*This DESIGN.md was generated by [brandmd](https://github.com/yuvrajangadsingh/brandmd) and validates against the official [@google/design.md](https://github.com/google-labs-code/design.md) linter. Drop it into your project root and AI coding agents (Claude Code, Cursor, Gemini CLI) will use it to generate on-brand UI.*