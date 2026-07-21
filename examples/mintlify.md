---
version: alpha
name: "Mintlify - The Knowledge Platform Built for Agents"
description: "Bright, soft contrast"
colors:
  background: "#ffffff"
  on-background: "#000000"
  on-surface-variant: "#0c8c5e"
  outline: "#08090a12"
  outline-variant: "#f1f0ee"
  primary: "#004cff"
  on-primary: "#ffffff"
  secondary: "#0c8c5e"
  on-secondary: "#ffffff"
  surface: "#faf8f5"
typography:
  display:
    fontFamily: inter
    fontSize: 50px
    fontWeight: 400
    lineHeight: 1.04
  headline-lg:
    fontFamily: inter
    fontSize: 44px
    fontWeight: 400
    lineHeight: 1.09
  headline-md:
    fontFamily: inter
    fontSize: 36px
    fontWeight: 500
    lineHeight: 1.11
  body-md:
    fontFamily: paperMono
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  body-lg:
    fontFamily: paperMono
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.14
  label-sm:
    fontFamily: paperMono
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1
rounded:
  sm: 2px
  md: 4px
  lg: 6px
  xl: 12px
  full: 9999px
spacing:
  base: 16px
  xs: 4px
  sm: 6px
  md: 8px
  lg: 10px
  xl: 12px
components:
  button-primary:
    backgroundColor: "#fefdfb"
    textColor: "#121715"
    typography: "{typography.label-sm}"
    rounded: "{rounded.md}"
    padding: 12px
    height: 42px
  button-secondary:
    backgroundColor: transparent
    typography: "{typography.label-sm}"
    rounded: 0px
    padding: 4px
    height: 64px
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
---

> This is a real `DESIGN.md` example generated from [https://mintlify.com](https://mintlify.com) with `npx brandmd`.
>
> Drop a `DESIGN.md` like this in your project root so Claude Code, Cursor, Gemini CLI, Codex, or Google Stitch can use the colors, typography, spacing, and UI patterns when generating UI.
>
> Generate one for your site: `npx brandmd https://yoursite.com` ([npm](https://www.npmjs.com/package/brandmd) · [repo](https://github.com/yuvrajangadsingh/brandmd))


# Design System: Mintlify - The Knowledge Platform Built for Agents

> Extracted from [https://mintlify.com](https://mintlify.com) by brandmd

> ⚠️ **Provenance:** `https://mintlify.com` redirected to `https://www.mintlify.com/`. These tokens may describe that page, not the URL you asked for.

## Overview

**Visual character:** Bright, soft contrast; white background dominates with green text and vivid orange accents

**Density:** spacious. The layout uses a varied spacing scale.

**Motion:** Animation surfaces detected (canvas rendering). The brand uses motion, so treat static tokens as a floor. Detection is presence-only; it does not describe the animations.

## Colors

Palette extracted from the live page. Token names below map to the machine-readable `colors` block above.

- **Green** (`#0c8c5e`): Secondary text (dominant)
- **Black** (`#000000`): Primary text (dominant)
- **White** (`#ffffff`): Page background (dominant)
- **Near-transparent Black** (`#08090a12`): Divider / border (dominant)
- **Black** (`#08090a`): Dark background / footer (accent)
- **Vivid Orange** (`#ef6333`): Accent background (accent)
- **Near-transparent Green** (`#1fa77a14`): Overlay / scrim (accent)
- **Translucent Vivid Blue** (`#44aeff80`): Accent background (accent)
- **Vivid Blue** (`#004cff`): Accent background (accent)
- **Off-white** (`#f1f0ee`): Divider / border (accent)

**Incidental (low usage, do not lead with these):** `#717d79`

## Typography

**Primary font:** inter
**Secondary font:** arizonaFlare

**Fonts by role:**
- Headings: inter, arizonaFlare
- Body: paperMono
- Buttons / nav: inter

**All detected fonts:** inter (816), paperMono (779), arizonaFlare (2), Segoe UI Symbol (1)

**Type scale:**
- Headings: 24px, 35px, 36px, 44px, 50px
- Body / UI: 14px, 16px, 18px
- Captions / Small: 12px

**Weights in use:** 400, 500

**Line heights:** 12px, 24px, 16px, 20px, 40px, 48px, 28px, 52px

**Letter spacing:** 0.24px, -0.72px, -0.35px, -0.88px, -0.1px, -0.24px

## Layout

**Spacing scale:** 4px, 8px, 12px, 16px, 24px, 32px, 40px, 176px

**Base unit:** 4px grid — 94% of all weighted spacing values are multiples of 4.

## Elevation & Depth

Flat design: hierarchy comes from color contrast and borders, not shadows.

## Shapes

**Shape language:** Rounded, friendly aesthetic with generous corner radii.

**Border radii:** 2px, 4px, 6px, 12px, 12px 12px 0px 0px, 23.5px 23.5px 0px 0px, 9999px (pill)

Asymmetric / percentage radii observed (12px 12px 0px 0px, 23.5px 23.5px 0px 0px); kept out of the ordinal `rounded` scale since they don't fit a magnitude order.

## Components

Observed from the live DOM. Machine-readable component tokens are in the `components` block above.

### Buttons
- Background: `#fefdfb`
- Text color: `#121715`
- Corner radius: 4px
- Height: 42px
- Padding: 12px 12px 12px 12px
- Font: 16px, weight 400

### Cards
- Background: `#faf8f5`
- Corner radius: 6px
- Padding: 0px 0px 0px 0px

## Do's and Don'ts

- Do use a 4px grid for spacing
- Do use `#004cff` for primary actions and CTAs
- Do stick to 2 font weights: 400, 500
- Do use `inter` as the primary typeface
- Don't introduce colors outside the palette above
- Don't mix fonts beyond inter and arizonaFlare
- Don't use border-radius values outside: 2px, 4px, 6px, 12px, 12px 12px 0px 0px, 23.5px 23.5px 0px 0px, 9999px (pill)

---

*This DESIGN.md was generated by [brandmd](https://github.com/yuvrajangadsingh/brandmd) and validates against the official [@google/design.md](https://github.com/google-labs-code/design.md) linter. Drop it into your project root and AI coding agents (Claude Code, Cursor, Gemini CLI) will use it to generate on-brand UI.*