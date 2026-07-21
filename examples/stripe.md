---
version: alpha
name: "Stripe | Financial Infrastructure to Grow Your Revenue"
description: "Bright, high contrast"
colors:
  background: "#ffffff"
  on-background: "#000000"
  on-surface-variant: "#64748d"
  primary: "#533afd"
  on-primary: "#ffffff"
  secondary: "#29227d"
  on-secondary: "#ffffff"
typography:
  display:
    fontFamily: sohne-var
    fontSize: 48px
    fontWeight: 300
    lineHeight: 1
  headline-lg:
    fontFamily: sohne-var
    fontSize: 32px
    fontWeight: 300
    lineHeight: 1.09
  headline-md:
    fontFamily: sohne-var
    fontSize: 26px
    fontWeight: 300
    lineHeight: 1.12
  body-md:
    fontFamily: sohne-var
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.25
  body-lg:
    fontFamily: sohne-var
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1
  label-sm:
    fontFamily: sohne-var
    fontSize: 10px
    fontWeight: 300
    lineHeight: 1.45
rounded:
  sm: 4px
  md: 5px
  lg: 6px
  xl: 8px
  2xl: 16px
spacing:
  base: 8px
  xs: 1px
  sm: 2px
  md: 4px
  lg: 6px
  xl: 10px
components:
  button-primary:
    backgroundColor: "#533afd"
    textColor: "#ffffff"
    typography: "{typography.label-sm}"
    rounded: "{rounded.sm}"
    padding: 16px
    height: 40px
  button-secondary:
    backgroundColor: transparent
    typography: "{typography.label-sm}"
    rounded: 0px
    height: 676px
  card:
    rounded: 0px
---

> This is a real `DESIGN.md` example generated from [https://stripe.com](https://stripe.com) with `npx brandmd`.
>
> Drop a `DESIGN.md` like this in your project root so Claude Code, Cursor, Gemini CLI, Codex, or Google Stitch can use the colors, typography, spacing, and UI patterns when generating UI.
>
> Generate one for your site: `npx brandmd https://yoursite.com` ([npm](https://www.npmjs.com/package/brandmd) · [repo](https://github.com/yuvrajangadsingh/brandmd))


# Design System: Stripe | Financial Infrastructure to Grow Your Revenue

> Extracted from [https://stripe.com](https://stripe.com) by brandmd

> ⚠️ **Provenance:** `https://stripe.com` redirected to `https://stripe.com/in`. These tokens may describe that page, not the URL you asked for.

## Overview

**Visual character:** Bright, high contrast; white background dominates with black text and blue accents

**Density:** spacious. The layout uses a varied spacing scale.

**Motion:** Animation surfaces detected (canvas rendering). The brand uses motion, so treat static tokens as a floor. Detection is presence-only; it does not describe the animations.

## Colors

Palette extracted from the live page. Token names below map to the machine-readable `colors` block above.

- **Black** (`#000000`): Primary text (dominant)
- **White** (`#ffffff`): Page background (dominant)
- **Muted Blue** (`#64748d`): Secondary text (accent)
- **Blue** (`#29227d`): Accent background (accent)
- **Light Purple** (`#dac0ff`): Accent background (accent)
- **Vivid Blue** (`#533afd`): Accent background (accent)
- **Blue** (`#7f7dfc`): Accent background (accent)
- **Orange** (`#ffcf5e`): Accent background (accent)

## Typography

**Primary font:** sohne-var
**Secondary font:** SourceCodePro

**Fonts by role:**
- Headings: sohne-var
- Body: sohne-var

**Type scale:**
- Headings: 26px, 32px, 48px
- Body / UI: 14px, 16px, 18px, 22px
- Captions / Small: 8px, 9px, 10px, 11px, 12px

**Weights in use:** 300, 400, 500, 700

**Line heights:** 16px, 14.5px, 20px, 22.5px, 24px, 14px, 11.5px, 9px, 15.5px, 29px

**Letter spacing:** -0.3px, 0.1px, -0.42px, -0.33px, -0.26px, -0.22px

## Layout

**Spacing scale:** 2px, 4px, 6px, 8px, 12px, 16px, 24px, 32px

## Elevation & Depth

Uses 5 shadow styles for layering and elevation:

- Level 1: `rgba(3, 3, 39, 0.25) 0px 14.088px 21.132px -14.088px, rgba(0, 0, 0, 0.1) 0px 8.453px 16.906px -8.453px`
- Level 2: `rgba(50, 50, 93, 0.25) 0px 30px 45px -30px, rgba(0, 0, 0, 0.1) 0px 18px 36px -18px`
- Level 3: `rgba(23, 23, 23, 0.08) 0px 15px 35px 0px`
- Level 4: `rgba(23, 23, 23, 0.06) 0px 3px 6px 0px`
- Level 5: `rgba(0, 0, 0, 0.1) 0px 20.187px 40.374px -20.187px`

## Shapes

**Shape language:** Rounded, friendly aesthetic with generous corner radii.

**Border radii:** 0px 0px 6px 6px, 4px, 5px, 6px, 6px 6px 0px 0px, 8px, 16px, 100%

Asymmetric / percentage radii observed (0px 0px 6px 6px, 6px 6px 0px 0px, 100%); kept out of the ordinal `rounded` scale since they don't fit a magnitude order.

## Components

Observed from the live DOM. Machine-readable component tokens are in the `components` block above.

### Buttons
- Background: `#533afd`
- Text color: `#ffffff`
- Corner radius: 4px
- Height: 40px
- Padding: 15.5px 20px 16.5px 20px
- Font: 14px, weight 400

### Cards
- Corner radius: 0px
- Padding: 0px 0px 0px 0px

## Do's and Don'ts

- Do use `#533afd` for primary actions and CTAs
- Do stick to 4 font weights: 300, 400, 500, 700
- Do use `sohne-var` as the primary typeface
- Don't introduce colors outside the palette above
- Don't mix fonts beyond sohne-var and SourceCodePro
- Don't use border-radius values outside: 0px 0px 6px 6px, 4px, 5px, 6px, 6px 6px 0px 0px, 8px, 16px, 100%

---

*This DESIGN.md was generated by [brandmd](https://github.com/yuvrajangadsingh/brandmd) and validates against the official [@google/design.md](https://github.com/google-labs-code/design.md) linter. Drop it into your project root and AI coding agents (Claude Code, Cursor, Gemini CLI) will use it to generate on-brand UI.*