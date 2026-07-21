---
version: alpha
name: "Shopify: The All-in-One Commerce Platform for Businesses - Shopify"
description: "Dark, high contrast"
colors:
  background: "#ffffff"
  on-background: "#a1a1aa"
  outline: "#e5e7eb"
  outline-variant: "#1e2c31"
  primary: "#865cff"
  on-primary: "#ffffff"
  secondary: "#36f4a4"
  on-secondary: "#1a1a1a"
  surface: "#02090a"
typography:
  display:
    fontFamily: NeueHaasGrotesk
    fontSize: 96px
    fontWeight: 400
    lineHeight: 1
  headline-lg:
    fontFamily: NeueHaasGrotesk
    fontSize: 55px
    fontWeight: 330
    lineHeight: 1.16
  headline-md:
    fontFamily: NeueHaasGrotesk
    fontSize: 48px
    fontWeight: 330
    lineHeight: 1.14
  body-md:
    fontFamily: NeueHaasGrotesk
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  body-lg:
    fontFamily: NeueHaasGrotesk
    fontSize: 14px
    fontWeight: 420
    lineHeight: 1.43
  label-sm:
    fontFamily: NeueHaasGrotesk
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
  xs: 4px
  sm: 8px
  md: 10px
  lg: 13px
  xl: 16px
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
    padding: 8px
    height: 44px
  card:
    backgroundColor: "{colors.surface}"
    rounded: 0px
    padding: 72px
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

**Visual character:** Dark, high contrast; black background dominates with white text and purple accents

**Density:** spacious. The layout uses a varied spacing scale.

**Motion:** Animation surfaces detected (canvas rendering). The brand uses motion, so treat static tokens as a floor. Detection is presence-only; it does not describe the animations.

## Colors

Palette extracted from the live page. Token names below map to the machine-readable `colors` block above.

- **Off-white** (`#e5e7eb`): Divider / border (dominant)
- **Black** (`#000000`): Dark background / footer (dominant)
- **Gray** (`#a1a1aa`): Muted text (accent)
- **White** (`#ffffff`): Page background (accent)
- **Dark Green** (`#0d3a2d`): Dark background / footer (accent)
- **Purple** (`#865cff`): Accent background (accent)
- **Vivid Green** (`#36f4a4`): Link / accent text (accent)
- **Dark Purple** (`#2c007f`): Accent background (accent)

**Incidental (low usage, do not lead with these):** `#3f3f4b80`, `#1e2c31`

## Typography

**Primary font:** NeueHaasGrotesk
**Secondary font:** Inter-Variable

**Fonts by role:**
- Headings: NeueHaasGrotesk, Inter-Variable
- Body: NeueHaasGrotesk

**All detected fonts:** NeueHaasGrotesk (629), Inter-Variable (418), SFMono-Regular (8)

**Type scale:**
- Headings: 24px, 28px, 32px, 48px, 55px, 96px
- Body / UI: 14px, 16px, 18px, 20px
- Captions / Small: 12px, 13px

**Weights in use:** 330, 360, 400, 420, 500, 550

**Line heights:** 24px, 20px, 96px, 28px, 22.5px, 21px, 64px, 18px, 14.5px, 54.5px

**Letter spacing:** 0.72px, 0.28px, 0.3px, 0.32px, 0.42px, 2.4px

## Layout

**Spacing scale:** 4px, 8px, 10px, 12px, 16px, 24px, 32px, 90px

## Elevation & Depth

Uses 5 shadow styles for layering and elevation:

- Level 1: `rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 8px 8px 0px, rgba(0, 0, 0, 0.1) 0px 4px 4px 0px, rgba(0, 0, 0, 0.1) 0px 2px 2px 0px, rgba(0, 0, 0, 0.1) 0px 0px 0px 1px, rgba(255, 255, 255, 0.03) 0px 1px 0px 0px inset`
- Level 2: `rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(255, 255, 255, 0.03) 0px 0.929px 0px 0px inset, rgba(0, 0, 0, 0.1) 0px 0px 0px 0.929px, rgba(0, 0, 0, 0.1) 0px 1.858px 1.858px 0px, rgba(0, 0, 0, 0.1) 0px 3.717px 3.717px 0px`
- Level 3: `rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.25) 0px 25px 50px -12px`
- Level 4: `rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(255, 255, 255, 0.08) 0px 0px 0px 1px, rgba(0, 0, 0, 0.3) 0px 1px 3px 0px, rgba(0, 0, 0, 0.2) 0px 5px 10px 0px`
- Level 5: `rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(255, 255, 255, 0.05) 0px 1px 2px 0px, rgba(255, 255, 255, 0.04) 0px 1px 0px 0px inset`

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

## Do's and Don'ts

- Do use `#865cff` for primary actions and CTAs
- Do use `NeueHaasGrotesk` as the primary typeface
- Don't introduce colors outside the palette above
- Don't mix fonts beyond NeueHaasGrotesk and Inter-Variable
- Don't use border-radius values outside: 0px 0px 12px 12px, 4px, 5px, 8px, 12px, 20px 20px 0px 0px, 340px, 9999px (pill)

---

*This DESIGN.md was generated by [brandmd](https://github.com/yuvrajangadsingh/brandmd) and validates against the official [@google/design.md](https://github.com/google-labs-code/design.md) linter. Drop it into your project root and AI coding agents (Claude Code, Cursor, Gemini CLI) will use it to generate on-brand UI.*