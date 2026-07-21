---
version: alpha
name: "Free screen recorder for Mac and PC | Loom"
description: "Bright, high contrast"
colors:
  background: "#efffd6"
  on-background: "#000000"
  surface: "#f8eefe"
  on-surface-variant: "#bf63f3"
  outline: "#292a2e"
  primary: "#1868db"
  on-primary: "#ffffff"
  secondary: "#123263"
  on-secondary: "#ffffff"
typography:
  display:
    fontFamily: Charlie Display
    fontSize: 63.5px
    fontWeight: 700
    lineHeight: 1.02
  headline-lg:
    fontFamily: Charlie Display
    fontSize: 44px
    fontWeight: 700
    lineHeight: 1.15
  headline-md:
    fontFamily: Charlie Display
    fontSize: 32.5px
    fontWeight: 700
    lineHeight: 1.28
  body-md:
    fontFamily: Charlie Text
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  body-lg:
    fontFamily: Charlie Text
    fontSize: 15.5px
    fontWeight: 400
    lineHeight: 1.74
  label-sm:
    fontFamily: Charlie Text
    fontSize: 12.5px
    fontWeight: 400
    lineHeight: 1.48
rounded:
  sm: 6px
  md: 12px
  lg: 16px
  xl: 41.5px
  2xl: 69px
  full: 9999px
spacing:
  base: 16px
  xs: 1.5px
  sm: 2px
  md: 6px
  lg: 8px
  xl: 15.5px
components:
  button-primary:
    backgroundColor: "#e9f2fe"
    textColor: "#000000"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: 8px
    height: 48px
  button-secondary:
    backgroundColor: transparent
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: 8px
    height: 40px
---

> This is a real `DESIGN.md` example generated from [https://loom.com](https://loom.com) with `npx brandmd`.
>
> Drop a `DESIGN.md` like this in your project root so Claude Code, Cursor, Gemini CLI, Codex, or Google Stitch can use the colors, typography, spacing, and UI patterns when generating UI.
>
> Generate one for your site: `npx brandmd https://yoursite.com` ([npm](https://www.npmjs.com/package/brandmd) · [repo](https://github.com/yuvrajangadsingh/brandmd))


# Design System: Free screen recorder for Mac and PC | Loom

> Extracted from [https://loom.com](https://loom.com) by brandmd

> ⚠️ **Provenance:** `https://loom.com` redirected to `https://www.loom.com/`. These tokens may describe that page, not the URL you asked for.

## Overview

**Visual character:** Bright, high contrast; off-white background dominates with black text and blue accents

**Density:** spacious. The layout uses a varied spacing scale.

## Colors

Palette extracted from the live page. Token names below map to the machine-readable `colors` block above.

- **Black** (`#000000`): Primary text (dominant)
- **Off-white** (`#f8eefe`): Surface / card background (dominant)
- **Dark gray** (`#292a2e`): Divider / border (dominant)
- **White** (`#ffffff`): Light text (on dark) (accent)
- **Blue** (`#1868db`): Accent background (accent)
- **Near-transparent Black** (`#00000012`): Overlay / scrim (accent)
- **Dark Blue** (`#123263`): Accent background (accent)
- **Off-white** (`#efffd6`): Page background (accent)
- **Purple** (`#bf63f3`): Secondary text (accent)
- **Green** (`#b3df72`): Accent background (accent)

## Typography

**Primary font:** Charlie Display
**Secondary font:** Charlie Text

**Fonts by role:**
- Headings: Charlie Display, Charlie Text
- Body: Charlie Text

**All detected fonts:** Charlie Text (839), Charlie Display (30), Segoe UI (1)

**Type scale:**
- Headings: 25.5px, 26.5px, 32.5px, 44px, 63.5px
- Body / UI: 15px, 15.5px, 16px, 18px, 18.5px
- Captions / Small: 12.5px

**Weights in use:** 400, 500, 700

**Line heights:** 24px, 27px, 18.5px, 16px, 30.5px, 33.5px, 65px, 40.5px, 15.5px, 18px

## Layout

**Spacing scale:** 2px, 6px, 15.5px, 16px, 24px, 36px, 70.5px, 111px

## Elevation & Depth

Uses 5 shadow styles for layering and elevation:

- Level 1: `rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.04) 0px 2px 6px 0px, rgba(0, 0, 0, 0.06) 0px 5px 18px 0px, rgba(0, 0, 0, 0.1) 0px 24px 83px 0px`
- Level 2: `rgba(0, 0, 0, 0) 0px 0px 0px 4.45038px`
- Level 3: `rgba(0, 0, 0, 0.04) 0px 2px 6px 0px, rgba(0, 0, 0, 0.06) 0px 5px 18px 0px, rgba(0, 0, 0, 0.1) 0px 24px 83px 0px`
- Level 4: `rgba(0, 0, 0, 0.03) 0px 4px 6.4px 0px, rgba(0, 0, 0, 0.05) 0px 3px 9.6px 0px, rgba(0, 0, 0, 0.07) 0px 8px 32px 0px, rgba(0, 0, 0, 0.1) 0px 32px 96px 0px`
- Level 5: `rgba(0, 0, 0, 0.25) 0px 15px 50px 0px`

## Shapes

**Shape language:** Rounded, friendly aesthetic with generous corner radii.

**Border radii:** 6px, 12px, 16px, 41.5px, 41.5px 0px 0px 41.5px, 50%, 69px, 9999px (pill)

Asymmetric / percentage radii observed (41.5px 0px 0px 41.5px, 50%); kept out of the ordinal `rounded` scale since they don't fit a magnitude order.

## Components

Observed from the live DOM. Machine-readable component tokens are in the `components` block above.

### Buttons
- Background: `#e9f2fe`
- Text color: `#000000`
- Corner radius: 9999px
- Height: 48px
- Padding: 7.80769px 15.6154px 7.80769px 15.6154px
- Font: 15.6154px, weight 400

## Do's and Don'ts

- Do use `#1868db` for primary actions and CTAs
- Do stick to 3 font weights: 400, 500, 700
- Do use `Charlie Display` as the primary typeface
- Don't introduce colors outside the palette above
- Don't mix fonts beyond Charlie Display and Charlie Text
- Don't use border-radius values outside: 6px, 12px, 16px, 41.5px, 41.5px 0px 0px 41.5px, 50%, 69px, 9999px (pill)

---

*This DESIGN.md was generated by [brandmd](https://github.com/yuvrajangadsingh/brandmd) and validates against the official [@google/design.md](https://github.com/google-labs-code/design.md) linter. Drop it into your project root and AI coding agents (Claude Code, Cursor, Gemini CLI) will use it to generate on-brand UI.*