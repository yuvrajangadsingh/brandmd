---
version: alpha
name: "Raycast - Your shortcut to everything"
description: "Dark, high contrast"
colors:
  background: "#07080a"
  on-background: "#ffffff"
  outline: "#ffffff1a"
  outline-variant: "#ff6363"
  primary: "#ff6363"
  on-primary: "#1a1a1a"
  secondary: "#043f96b3"
  on-secondary: "#ffffff"
  surface: "#ffffff"
typography:
  display:
    fontFamily: Inter
    fontSize: 41px
    fontWeight: 400
    lineHeight: 1
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: 500
    lineHeight: 1.16
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: 500
    lineHeight: 1.15
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.16
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.61
  label-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.81
rounded:
  sm: 6px
  md: 10px
  lg: 11px
  xl: 12px
  2xl: 16px
  3xl: 20px
spacing:
  base: 8px
  xs: 1px
  sm: 4px
  md: 6px
  lg: 12px
  xl: 14.5px
components:
  button-primary:
    backgroundColor: "#e6e6e6"
    textColor: "#2f3031"
    typography: "{typography.label-sm}"
    rounded: 8px
    padding: 8px
    height: 36px
  button-secondary:
    backgroundColor: transparent
    typography: "{typography.label-sm}"
    rounded: 0px
    height: 67px
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    padding: 4px
  input:
    typography: "{typography.body-md}"
    rounded: 0px
---

> This is a real `DESIGN.md` example generated from [https://raycast.com](https://raycast.com) with `npx brandmd`.
>
> Drop a `DESIGN.md` like this in your project root so Claude Code, Cursor, Gemini CLI, Codex, or Google Stitch can use the colors, typography, spacing, and UI patterns when generating UI.
>
> Generate one for your site: `npx brandmd https://yoursite.com` ([npm](https://www.npmjs.com/package/brandmd) · [repo](https://github.com/yuvrajangadsingh/brandmd))


# Design System: Raycast - Your shortcut to everything

> Extracted from [https://raycast.com](https://raycast.com) by brandmd

> ⚠️ **Provenance:** `https://raycast.com` redirected to `https://www.raycast.com/`. These tokens may describe that page, not the URL you asked for.

## Overview

**Visual character:** Dark, high contrast; dark muted blue background dominates with white text and vivid blue accents

**Density:** spacious. The layout uses a varied spacing scale.

**Motion:** Animation surfaces detected (WebGL / 3D canvas). The brand uses motion, so treat static tokens as a floor. Detection is presence-only; it does not describe the animations.

## Colors

Palette extracted from the live page. Token names below map to the machine-readable `colors` block above.

_The page background `#07080a` is the surface that fills the viewport; it is not among the most frequent fills listed below._

- **Black** (`#0d0d0d`): Dark background / footer (dominant)
- **Near-transparent White** (`#ffffff0d`): Overlay / scrim (dominant)
- **Near-transparent White** (`#ffffff1a`): Divider / border (dominant)
- **Translucent White** (`#ffffff99`): Light text (on dark) (accent)
- **Gray** (`#6a6b6c`): Secondary text (accent)
- **White** (`#ffffff`): Page background (accent)
- **Vivid Blue** (`#043f96b3`): Accent background (accent)
- **Red** (`#ff6363`): Focus / active border (accent)

**Incidental (low usage, do not lead with these):** `#9c9c9d`, `#00000070`, `#434345`

## Typography

**Primary font:** Inter
**Secondary font:** SF Pro Text

**Fonts by role:**
- Headings: Inter
- Body: Inter

**All detected fonts:** Inter (2115), SF Pro Text (522), SF Pro (37), GeistMono (31), jetBrainsMono (1)

**Type scale:**
- Headings: 24px, 32px, 41px
- Body / UI: 14px, 15px, 16px, 18px, 20px
- Captions / Small: 10px, 11px, 12px, 13px

**Weights in use:** 300, 350, 400, 500, 600, 700

**Line heights:** 18.5px, 27.5px, 23.5px, 16px, 37px, 41px, 22.5px, 11px, 20.5px, 32px

**Letter spacing:** 0.2px, 0.3px, 0.5px, 0.4px, 1.44px, -0.8px

## Layout

**Spacing scale:** 4px, 8px, 12px, 14.5px, 15px, 16px, 20px, 24px

## Elevation & Depth

Uses 5 shadow styles for layering and elevation:

- Level 1: `rgba(0, 0, 0, 0.4) 0px 1.5px 0.5px 2.5px, rgb(0, 0, 0) 0px 0px 0.5px 1px, rgba(0, 0, 0, 0.25) 0px 2px 1px 1px inset, rgba(255, 255, 255, 0.2) 0px 1px 1px 1px inset`
- Level 2: `rgb(27, 28, 30) 0px 0px 0px 1px, rgb(7, 8, 10) 0px 0px 0px 1px inset`
- Level 3: `rgba(255, 255, 255, 0.2) 0px 0px 0px 1px inset`
- Level 4: `rgba(0, 0, 0, 0.25) 0px 0px 0px 0.5px`
- Level 5: `rgba(215, 201, 175, 0.05) 0px 0px 20px 5px, rgba(215, 201, 175, 0.05) 0px 0px 16px -7px`

## Shapes

**Shape language:** Rounded, friendly aesthetic with generous corner radii.

**Border radii:** 6px, 10px, 11px, 12px, 16px, 20px, 25%, 100%

Asymmetric / percentage radii observed (25%, 100%); kept out of the ordinal `rounded` scale since they don't fit a magnitude order.

## Components

Observed from the live DOM. Machine-readable component tokens are in the `components` block above.

### Buttons
- Background: `#e6e6e6`
- Text color: `#2f3031`
- Corner radius: 8px
- Height: 36px
- Padding: 8px 12px 8px 12px
- Font: 14px, weight 500
- Sampled from: `<a>` labelled `Download`

### Cards
- Background: `#ffffff`
- Corner radius: 12px
- Padding: 4px 4px 4px 4px

### Inputs
- Border: 0px none rgb(255, 255, 255)
- Corner radius: 0px
- Padding: 0px 4px 0px 4px
- Font size: 14px

## Do's and Don'ts

- Do use `#e6e6e6` for primary actions and CTAs
- Do use `Inter` as the primary typeface
- Don't introduce colors outside the palette above
- Don't mix fonts beyond Inter and SF Pro Text
- Don't use border-radius values outside: 6px, 10px, 11px, 12px, 16px, 20px, 25%, 100%

---

*This DESIGN.md was generated by [brandmd](https://github.com/yuvrajangadsingh/brandmd) and validates against the official [@google/design.md](https://github.com/google-labs-code/design.md) linter. Drop it into your project root and AI coding agents (Claude Code, Cursor, Gemini CLI) will use it to generate on-brand UI.*