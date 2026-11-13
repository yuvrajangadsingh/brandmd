---
version: alpha
name: "Collaboration software for software, IT and business teams | Atlassian"
description: "Bright, high contrast"
colors:
  background: "#ffffff"
  on-background: "#292a2e"
  on-surface-variant: "#1868db"
  outline: "#101214"
  outline-variant: "#dddee1"
  primary: "#c75300"
  on-primary: "#ffffff"
  secondary: "#1868db"
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
    fontSize: 48px
    fontWeight: 500
    lineHeight: 1.16
  body-md:
    fontFamily: Charlie Text
    fontSize: 16px
    fontWeight: 400
    lineHeight: 0.88
  body-sm:
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
  lg: 15px
  xl: 20px
  2xl: 24px
  full: 9999px
spacing:
  base: 24px
  xs: 1px
  sm: 4px
  md: 6px
  lg: 8px
  xl: 10px
components:
  button-primary:
    backgroundColor: "#1868db"
    textColor: "#ffffff"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: 10px
    height: 48px
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

**Visual character:** Bright, high contrast; white background dominates with dark gray text and blue accents

**Density:** spacious. The layout uses a varied spacing scale.

## Colors

Palette extracted from the live page. Token names below map to the machine-readable `colors` block above.

- **Dark gray** (`#292a2e`): Primary text (dominant)
- **White** (`#ffffff`): Page background (dominant)
- **Black** (`#101214`): Divider / border (dominant)
- **Light gray** (`#dddee1`): Divider / border (dominant)
- **Dark gray** (`#1e1f21`): Dark background / footer (accent)
- **Blue** (`#1868db`): Secondary text (accent)
- **Green** (`#4c6b1f`): Accent background (accent)
- **Blue** (`#1558bc`): Accent background (accent)
- **Vivid Orange** (`#c75300`): Accent background (accent)

**Incidental (low usage, do not lead with these):** `#42526e`, `#803fa5`

## Typography

**Primary font:** Charlie Display
**Secondary font:** Charlie Text

**Fonts by role:**
- Headings: Charlie Display, Charlie Text
- Display / hero: Atlassian Mono
- Body: Charlie Text

**All detected fonts:** Charlie Text (1625), Charlie Display (651), Atlassian Mono (27)

**Type scale:**
- Headings: 24px, 40px, 48px, 64px, 96px
- Body / UI: 14px, 16px, 18px, 20px
- Captions / Small: 11.5px, 12px, 13.5px

**Weights in use:** 400, 500, 600, 700

**Line heights:** 14px, 24px, 15.5px, 31px, 16px, 18px, 30px, 25px, 96px, 32.5px

**Letter spacing:** 0.42px, -0.2px, -3px, 0.8px, -0.16px, -0.24px

## Layout

**Spacing scale:** 4px, 6px, 8px, 12px, 16px, 24px, 32px, 40px

**Base unit:** 4px grid — 81% of all weighted spacing values are multiples of 4.

## Elevation & Depth

Uses 3 shadow styles for layering and elevation:

- Level 1: `rgb(248, 248, 248) 0px 0px 0px 0px`
- Level 2: `rgba(30, 31, 33, 0.15) 0px 8px 12px 0px, rgba(30, 31, 33, 0.31) 0px 0px 1px 0px`
- Level 3: `rgb(128, 128, 128) 0px 0px 5px 0px`

## Shapes

**Shape language:** Rounded, friendly aesthetic with generous corner radii.

**Border radii:** 3px, 4px, 8px 0px 0px 8px, 15px, 20px, 24px, 100%, 9999px (pill)

Asymmetric / percentage radii observed (8px 0px 0px 8px, 100%); kept out of the ordinal `rounded` scale since they don't fit a magnitude order.

## Components

Observed from the live DOM. Machine-readable component tokens are in the `components` block above.

### Buttons
- Background: `#1868db`
- Text color: `#ffffff`
- Corner radius: 9999px
- Height: 48px
- Padding: 10px 26px 10px 26px
- Font: 20px, weight 400
- Sampled from: `<a>` labelled `Get started with Jira`

### Cards
- Corner radius: 0px
- Padding: 0px 0px 0px 0px

### Inputs
- Border: 0px none rgb(66, 82, 110)
- Corner radius: 0px
- Padding: 0px 0px 0px 0px
- Font size: 14px

## Do's and Don'ts

- Do use a 4px grid for spacing
- Do use `#1868db` for primary actions and CTAs
- Do stick to 4 font weights: 400, 500, 600, 700
- Do use `Charlie Display` as the primary typeface
- Don't introduce colors outside the palette above
- Don't mix fonts beyond Charlie Display and Charlie Text
- Don't use border-radius values outside: 3px, 4px, 8px 0px 0px 8px, 15px, 20px, 24px, 100%, 9999px (pill)

---

*This DESIGN.md was generated by [brandmd](https://github.com/yuvrajangadsingh/brandmd) and validates against the official [@google/design.md](https://github.com/google-labs-code/design.md) linter. Drop it into your project root and AI coding agents (Claude Code, Cursor, Gemini CLI) will use it to generate on-brand UI.*