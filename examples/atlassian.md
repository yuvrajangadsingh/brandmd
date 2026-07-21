---
version: alpha
name: "Collaboration software for software, IT and business teams | Atlassian"
description: "Bright, high contrast"
colors:
  background: "#ffffff"
  on-background: "#292a2e"
  outline: "#dddee1"
  primary: "#c75300"
  on-primary: "#ffffff"
  secondary: "#09326c"
  on-secondary: "#ffffff"
typography:
  display:
    fontFamily: Charlie Display
    fontSize: 96px
    fontWeight: 700
    lineHeight: 1
  headline-lg:
    fontFamily: Charlie Display
    fontSize: 64px
    fontWeight: 700
    lineHeight: 1.19
  headline-md:
    fontFamily: Charlie Display
    fontSize: 28px
    fontWeight: 400
    lineHeight: 1.43
  body-md:
    fontFamily: Charlie Text
    fontSize: 16px
    fontWeight: 400
    lineHeight: 0.88
  body-lg:
    fontFamily: Charlie Text
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1
  label-sm:
    fontFamily: Charlie Text
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.29
rounded:
  sm: 3px
  md: 4px
  lg: 10px
  xl: 15px
  2xl: 20px
  full: 9999px
spacing:
  base: 8px
  xs: 1px
  sm: 4px
  md: 6px
  lg: 12px
  xl: 16px
components:
  button-primary:
    backgroundColor: "#101214"
    textColor: "#ffffff"
    typography: "{typography.label-sm}"
    padding: 20px
    height: 60px
  button-secondary:
    backgroundColor: transparent
    typography: "{typography.label-sm}"
    height: 40px
  card:
    rounded: 0px
  input:
    typography: "{typography.body-md}"
    rounded: 0px
---

> This is a real `DESIGN.md` example generated from [https://atlassian.com](https://atlassian.com) with `npx brandmd`.
>
> Drop a `DESIGN.md` like this in your project root so Claude Code, Cursor, Gemini CLI, Codex, or Google Stitch can use the colors, typography, spacing, and UI patterns when generating UI.
>
> Generate one for your site: `npx brandmd https://yoursite.com` ([npm](https://www.npmjs.com/package/brandmd) · [repo](https://github.com/yuvrajangadsingh/brandmd))


# Design System: Collaboration software for software, IT and business teams | Atlassian

> Extracted from [https://atlassian.com](https://atlassian.com) by brandmd

> ⚠️ **Provenance:** `https://atlassian.com` redirected to `https://www.atlassian.com/`. These tokens may describe that page, not the URL you asked for.

## Overview

**Visual character:** Bright, high contrast; white background dominates with dark gray text and dark blue accents

**Density:** spacious. The layout uses a varied spacing scale.

## Colors

Palette extracted from the live page. Token names below map to the machine-readable `colors` block above.

- **Dark gray** (`#292a2e`): Primary text (dominant)
- **White** (`#ffffff`): Page background (dominant)
- **Light gray** (`#dddee1`): Divider / border (dominant)
- **Black** (`#101214`): Dark background / footer (accent)
- **Dark Blue** (`#09326c`): Primary text (accent)
- **Green** (`#4c6b1f`): Accent background (accent)
- **Blue** (`#1868db`): Accent background (accent)
- **Vivid Orange** (`#c75300`): Accent background (accent)

**Incidental (low usage, do not lead with these):** `#803fa5`

## Typography

**Primary font:** Charlie Display
**Secondary font:** Charlie Text

**Fonts by role:**
- Headings: Charlie Display, Charlie Text
- Display / hero: Atlassian Mono
- Body: Charlie Text

**All detected fonts:** Charlie Text (2539), Charlie Display (704), Atlassian Mono (12)

**Type scale:**
- Headings: 24px, 28px, 64px, 96px
- Body / UI: 14px, 16px, 18px, 20px
- Captions / Small: 11.5px, 12px, 13px, 13.5px

**Weights in use:** 400, 500, 600, 700

**Line heights:** 14px, 15.5px, 24px, 32px, 26px, 16px, 21.5px, 18px, 76px, 17.5px

**Letter spacing:** 0.42px, 0.3px, 0.48px, -3px, 0.36px

## Layout

**Spacing scale:** 4px, 6px, 8px, 12px, 16px, 24px, 32px, 40px

## Elevation & Depth

Uses 3 shadow styles for layering and elevation:

- Level 1: `rgb(248, 248, 248) 0px 0px 0px 0px`
- Level 2: `rgb(221, 222, 225) 0px 0px 1px 0px, rgba(0, 0, 0, 0.1) 0px 5px 20px -5px`
- Level 3: `rgb(128, 128, 128) 0px 0px 5px 0px`

## Shapes

**Shape language:** Rounded, friendly aesthetic with generous corner radii.

**Border radii:** 3px, 4px, 8px 0px 0px 8px, 10px, 15px, 20px, 100%, 9999px (pill)

Asymmetric / percentage radii observed (8px 0px 0px 8px, 100%); kept out of the ordinal `rounded` scale since they don't fit a magnitude order.

## Components

Observed from the live DOM. Machine-readable component tokens are in the `components` block above.

### Buttons
- Background: `#101214`
- Text color: `#ffffff`
- Corner radius: 100%
- Height: 60px
- Padding: 19.5px 15px 19.5px 15px
- Font: 13.3333px, weight 400

### Cards
- Corner radius: 0px
- Padding: 0px 0px 0px 0px

### Inputs
- Border: 0px none rgb(66, 82, 110)
- Corner radius: 0px
- Padding: 0px 0px 0px 0px
- Font size: 14px

## Do's and Don'ts

- Do use `#c75300` for primary actions and CTAs
- Do stick to 4 font weights: 400, 500, 600, 700
- Do use `Charlie Display` as the primary typeface
- Don't introduce colors outside the palette above
- Don't mix fonts beyond Charlie Display and Charlie Text
- Don't use border-radius values outside: 3px, 4px, 8px 0px 0px 8px, 10px, 15px, 20px, 100%, 9999px (pill)

---

*This DESIGN.md was generated by [brandmd](https://github.com/yuvrajangadsingh/brandmd) and validates against the official [@google/design.md](https://github.com/google-labs-code/design.md) linter. Drop it into your project root and AI coding agents (Claude Code, Cursor, Gemini CLI) will use it to generate on-brand UI.*