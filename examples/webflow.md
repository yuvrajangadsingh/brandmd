---
version: alpha
name: "Webflow: The agentic web platform for modern businesses"
description: "Bright, high contrast"
colors:
  background: "#ffffff"
  on-background: "#000000"
  on-surface-variant: "#808080"
  outline: "#d8d8d8"
  outline-variant: "#080808"
  primary: "#146ef5"
  on-primary: "#ffffff"
typography:
  display:
    fontFamily: WF Visual Sans
    fontSize: 80px
    fontWeight: 600
    lineHeight: 1.04
  headline-lg:
    fontFamily: WF Visual Sans
    fontSize: 56px
    fontWeight: 600
    lineHeight: 1.04
  headline-md:
    fontFamily: WF Visual Sans
    fontSize: 40px
    fontWeight: 600
    lineHeight: 1.2
  body-md:
    fontFamily: WF Visual Sans
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.59
  body-sm:
    fontFamily: WF Visual Sans
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.61
  label-sm:
    fontFamily: WF Visual Sans
    fontSize: 10px
    fontWeight: 500
    lineHeight: 1.3
rounded:
  sm: 2px
  md: 4px
  lg: 8px
  full: 9999px
spacing:
  base: 16px
  xs: 1px
  sm: 4px
  md: 6px
  lg: 8px
  xl: 12px
components:
  button-primary:
    backgroundColor: "#146ef5"
    textColor: "#ffffff"
    typography: "{typography.label-sm}"
    rounded: "{rounded.md}"
    padding: 16px
    height: 51px
  button-secondary:
    backgroundColor: transparent
    typography: "{typography.label-sm}"
    rounded: 0px
    padding: 21px
    height: 67px
  card:
    rounded: 0px
  input:
    backgroundColor: "{colors.background}"
    textColor: "{colors.on-background}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 24px
---

> This is a real `DESIGN.md` example generated from [https://webflow.com](https://webflow.com) with `npx brandmd`.
>
> Drop a `DESIGN.md` like this in your project root so Claude Code, Cursor, Gemini CLI, Codex, or Google Stitch can use the colors, typography, spacing, and UI patterns when generating UI.
>
> Generate one for your site: `npx brandmd https://yoursite.com` ([npm](https://www.npmjs.com/package/brandmd) · [repo](https://github.com/yuvrajangadsingh/brandmd))


# Design System: Webflow: The agentic web platform for modern businesses

> Extracted from [https://webflow.com](https://webflow.com) by brandmd

## Overview

**Visual character:** Bright, high contrast; white background dominates with black text and vivid blue accents

**Density:** spacious. The layout uses a varied spacing scale.

**Motion:** Animation surfaces detected (scripted animation via requestAnimationFrame). The brand uses motion, so treat static tokens as a floor. Detection is presence-only; it does not describe the animations.

## Colors

Palette extracted from the live page. Token names below map to the machine-readable `colors` block above.

- **Black** (`#000000`): Primary text (dominant)
- **White** (`#ffffff`): Page background (dominant)
- **Light gray** (`#d8d8d8`): Divider / border (dominant)
- **Black** (`#080808`): Divider / border (dominant)
- **Gray** (`#808080`): Secondary text (accent)
- **Translucent Black** (`#08080899`): Dark background / footer (accent)
- **Vivid Blue** (`#146ef5`): Accent background (accent)
- **Near-transparent White** (`#ffffff29`): Overlay / scrim (accent)
- **Near-transparent Black** (`#08080833`): Overlay / scrim (accent)

## Typography

**Primary font:** WF Visual Sans

**Fonts by role:**
- Headings: WF Visual Sans
- Body: WF Visual Sans

**Type scale:**
- Headings: 32px, 40px, 56px, 80px
- Body / UI: 14px, 14.5px, 16px, 20px
- Captions / Small: 10px, 12px

**Weights in use:** 400, 500, 550, 600

**Line heights:** 25.5px, 24px, 22.5px, 16px, 19px, 28px, 30px, 38.5px, 23px, 48px

**Letter spacing:** -0.16px, -0.159808px, 1px, -0.8px, 0.6px

## Layout

**Spacing scale:** 1px, 4px, 6px, 8px, 12px, 16px, 24px, 32px

## Elevation & Depth

Uses 5 shadow styles for layering and elevation:

- Level 1: `rgba(0, 0, 0, 0.29) 0px 6px 13px 0px, rgba(0, 0, 0, 0.26) 0px 24px 24px 0px, rgba(0, 0, 0, 0.15) 0px 53px 32px 0px, rgba(0, 0, 0, 0.04) 0px 95px 38px 0px, rgba(0, 0, 0, 0.01) 0px 148px 42px 0px`
- Level 2: `rgba(0, 0, 0, 0.02) 0px 39px 16px 0px, rgba(0, 0, 0, 0.06) 0px 22px 13px 0px, rgba(0, 0, 0, 0.12) 0px 2px 5px 0px, rgba(0, 0, 0, 0.1) 0px 10px 10px 0px`
- Level 3: `rgba(8, 8, 8, 0.08) 0px 4px 4px 0px, rgba(8, 8, 8, 0.2) 0px 1px 2px 0px, rgba(255, 255, 255, 0.12) 0px 6px 12px 0px inset, rgba(255, 255, 255, 0.2) 0px 1px 1px 0px inset`
- Level 4: `rgba(0, 0, 0, 0.12) 0px 9px 4px 0px, rgba(0, 0, 0, 0.1) 0px 17px 17px 0px, rgba(0, 0, 0, 0.06) 0px 38px 23px 0px, rgba(0, 0, 0, 0.02) 0px 67px 27px 0px`
- Level 5: `rgb(128, 128, 128) 0px 0px 5px 0px`

## Shapes

**Shape language:** Subtle rounding on interactive elements.

**Border radii:** 0px 0px 8px 8px, 2px, 4px, 8px, 26%, 50%, 9999px (pill)

Asymmetric / percentage radii observed (0px 0px 8px 8px, 26%, 50%); kept out of the ordinal `rounded` scale since they don't fit a magnitude order.

## Components

Observed from the live DOM. Machine-readable component tokens are in the `components` block above.

### Buttons
- Background: `#146ef5`
- Text color: `#ffffff`
- Corner radius: 4px
- Height: 51px
- Padding: 16px 24px 16px 24px
- Font: 16px, weight 500

### Cards
- Corner radius: 0px
- Padding: 0px 0px 0px 0px

### Inputs
- Background: `#ffffff`
- Border: 1px solid rgb(216, 216, 216)
- Corner radius: 4px
- Padding: 24px 24px 24px 24px
- Font size: 16px

## Do's and Don'ts

- Do use `#146ef5` for primary actions and CTAs
- Do stick to 4 font weights: 400, 500, 550, 600
- Do use `WF Visual Sans` as the primary typeface
- Don't introduce colors outside the palette above
- Don't mix fonts; use WF Visual Sans everywhere
- Don't use border-radius values outside: 0px 0px 8px 8px, 2px, 4px, 8px, 26%, 50%, 9999px (pill)

---

*This DESIGN.md was generated by [brandmd](https://github.com/yuvrajangadsingh/brandmd) and validates against the official [@google/design.md](https://github.com/google-labs-code/design.md) linter. Drop it into your project root and AI coding agents (Claude Code, Cursor, Gemini CLI) will use it to generate on-brand UI.*