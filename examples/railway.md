---
version: alpha
name: "Railway | The all-in-one intelligent cloud provider"
description: "Dark, high contrast"
colors:
  background: "#13111c"
  on-background: "#545260"
  on-surface-variant: "#a1a0ab"
  outline: "#33323e"
  outline-variant: "#ffffff26"
  primary: "#180d43"
  on-primary: "#ffffff"
typography:
  display:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: 400
    lineHeight: 1.4
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.25
  body-md:
    fontFamily: SFMono-Regular
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.63
  body-lg:
    fontFamily: SFMono-Regular
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.64
  label-sm:
    fontFamily: SFMono-Regular
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.63
rounded:
  sm: 4px
  md: 6px
  lg: 8px
  xl: 12px
  2xl: 16px
  full: 9999px
spacing:
  base: 24px
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
components:
  button-primary:
    backgroundColor: "#291839"
    textColor: "#f7f7f8"
    typography: "{typography.label-sm}"
    rounded: "{rounded.lg}"
    height: 32px
  button-secondary:
    backgroundColor: transparent
    typography: "{typography.label-sm}"
    rounded: "{rounded.md}"
    padding: 6px
    height: 32px
---

> This is a real `DESIGN.md` example generated from [https://railway.app](https://railway.app) with `npx brandmd`.
>
> Drop a `DESIGN.md` like this in your project root so Claude Code, Cursor, Gemini CLI, Codex, or Google Stitch can use the colors, typography, spacing, and UI patterns when generating UI.
>
> Generate one for your site: `npx brandmd https://yoursite.com` ([npm](https://www.npmjs.com/package/brandmd) · [repo](https://github.com/yuvrajangadsingh/brandmd))


# Design System: Railway | The all-in-one intelligent cloud provider

> Extracted from [https://railway.app](https://railway.app) by brandmd

> ⚠️ **Provenance:** `https://railway.app` landed on a different origin (`https://railway.com/`). These tokens may describe that page, not the URL you asked for.

## Overview

**Visual character:** Dark, high contrast; dark muted purple background dominates with white text and dark purple accents

**Density:** spacious. The layout uses a varied spacing scale.

## Colors

Palette extracted from the live page. Token names below map to the machine-readable `colors` block above.

- **Dark gray** (`#33323e`): Divider / border (dominant)
- **White** (`#ffffff`): Light text (on dark) (dominant)
- **Dark Muted Purple** (`#13111c`): Dark background / footer (dominant)
- **Dark gray** (`#545260`): Primary text (accent)
- **Near-transparent White** (`#ffffff26`): Divider / border (accent)
- **Near-transparent White** (`#ffffff33`): Overlay / scrim (accent)
- **Dark Purple** (`#180d43`): Accent background (accent)

**Incidental (low usage, do not lead with these):** `#a1a0ab`, `#313c3c`, `#428a7233`, `#553f83`

## Typography

**Primary font:** Inter
**Secondary font:** IBM Plex Serif

**Fonts by role:**
- Headings: IBM Plex Serif
- Display / hero: SFMono-Regular, Inter
- Body: SFMono-Regular
- Buttons / nav: Inter

**All detected fonts:** Inter (7146), SFMono-Regular (2165), JetBrains Mono (306), Helvetica (17), SF Mono (16), IBM Plex Serif (8), Inter Tight (4)

**Type scale:**
- Headings: 24px, 40px
- Body / UI: 14px, 16px, 18px, 20px
- Captions / Small: 6px, 6.5px, 11px, 12px, 13px, 13.5px

**Weights in use:** 400, 500, 600, 700, 800

**Line heights:** 26px, 56px, 65px, 19.5px, 23px, 9.5px, 11px, 18px, 20px, 21px

**Letter spacing:** -0.22px, -0.24px, 0.24px, -0.09px, -0.06px, -0.8px

## Layout

**Spacing scale:** 4px, 6px, 8px, 12px, 16px, 24px, 32px, 40px

**Base unit:** 4px grid — 90% of all weighted spacing values are multiples of 4.

## Elevation & Depth

Uses 5 shadow styles for layering and elevation:

- Level 1: `rgba(65, 78, 166, 0.1) 0px -12px 127px 0px, rgba(65, 78, 166, 0.07) 0px -4.38px 46.357px 0px, rgba(65, 78, 166, 0.06) 0px -2.127px 22.506px 0px, rgba(65, 78, 166, 0.04) 0px -1.042px 11.033px 0px, rgba(65, 78, 166, 0.03) 0px -0.412px 4.362px 0px`
- Level 2: `rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(255, 255, 255, 0.1) 0px 0px 0px 1px inset`
- Level 3: `rgb(204, 204, 204) 0px 0px 2px 2px`
- Level 4: `rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(255, 255, 255, 0.2) 0px 0px 0px 1.5px inset`
- Level 5: `rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(62, 45, 45, 0.24) 0px 100px 191px 0px, rgba(62, 45, 45, 0.165) 0px 36.5016px 69.7181px 0px, rgba(62, 45, 45, 0.133) 0px 17.7209px 33.8469px 0px, rgba(62, 45, 45, 0.106) 0px 8.6871px 16.5924px 0px, rgba(62, 45, 45, 0.075) 0px 3.43489px 6.56065px 0px`

## Shapes

**Shape language:** Rounded, friendly aesthetic with generous corner radii.

**Border radii:** 0px 0px 4px 4px, 4px, 4px 4px 0px 0px, 6px, 8px, 12px, 16px, 9999px (pill)

Asymmetric / percentage radii observed (0px 0px 4px 4px, 4px 4px 0px 0px); kept out of the ordinal `rounded` scale since they don't fit a magnitude order.

## Components

Observed from the live DOM. Machine-readable component tokens are in the `components` block above.

### Buttons
- Background: `#291839`
- Text color: `#f7f7f8`
- Corner radius: 8px
- Height: 32px
- Padding: 0px 0px 0px 0px
- Font: 16px, weight 400

## Do's and Don'ts

- Do use a 4px grid for spacing
- Do use `#180d43` for primary actions and CTAs
- Do use `Inter` as the primary typeface
- Don't introduce colors outside the palette above
- Don't mix fonts beyond Inter and IBM Plex Serif
- Don't use border-radius values outside: 0px 0px 4px 4px, 4px, 4px 4px 0px 0px, 6px, 8px, 12px, 16px, 9999px (pill)

---

*This DESIGN.md was generated by [brandmd](https://github.com/yuvrajangadsingh/brandmd) and validates against the official [@google/design.md](https://github.com/google-labs-code/design.md) linter. Drop it into your project root and AI coding agents (Claude Code, Cursor, Gemini CLI) will use it to generate on-brand UI.*