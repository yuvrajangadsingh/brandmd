---
version: alpha
name: "The AI workspace that works for you. | Notion"
description: "Bright, high contrast"
colors:
  background: "#ffffff"
  on-background: "#000000f2"
  on-surface-variant: "#097fe8"
  outline: "#ffffff00"
  outline-variant: "#0000001a"
  primary: "#ffc95e"
  on-primary: "#1a1a1a"
  secondary: "#097fe8"
  on-secondary: "#1a1a1a"
typography:
  display:
    fontFamily: NotionInter
    fontSize: 72px
    fontWeight: 500
    lineHeight: 1.21
  headline-lg:
    fontFamily: NotionInter
    fontSize: 54px
    fontWeight: 700
    lineHeight: 1.04
  headline-md:
    fontFamily: NotionInter
    fontSize: 48px
    fontWeight: 600
    lineHeight: 1.1
  body-md:
    fontFamily: NotionInter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  body-lg:
    fontFamily: NotionInter
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.43
  label-sm:
    fontFamily: NotionInter
    fontSize: 12px
    fontWeight: 450
    lineHeight: 1.33
rounded:
  sm: 4px
  md: 8px
  lg: 12px
  xl: 16px
  2xl: 20px
  full: 9999px
spacing:
  base: 8px
  xs: 2px
  sm: 3px
  md: 4px
  lg: 5px
  xl: 6px
components:
  button-primary:
    backgroundColor: "#0075de"
    textColor: "#ffffff"
    typography: "{typography.label-sm}"
    rounded: "{rounded.md}"
    padding: 4px
    height: 36px
  button-secondary:
    backgroundColor: transparent
    typography: "{typography.label-sm}"
    rounded: "{rounded.md}"
    padding: 6px
    height: 36px
  card:
    backgroundColor: "{colors.background}"
    rounded: "{rounded.lg}"
    padding: 24px
---

> This is a real `DESIGN.md` example generated from [https://notion.so](https://notion.so) with `npx brandmd`.
>
> Drop a `DESIGN.md` like this in your project root so Claude Code, Cursor, Gemini CLI, Codex, or Google Stitch can use the colors, typography, spacing, and UI patterns when generating UI.
>
> Generate one for your site: `npx brandmd https://yoursite.com` ([npm](https://www.npmjs.com/package/brandmd) · [repo](https://github.com/yuvrajangadsingh/brandmd))


# Design System: The AI workspace that works for you. | Notion

> Extracted from [https://notion.so](https://notion.so) by brandmd

> ⚠️ **Provenance:** `https://notion.so` landed on a different origin (`https://www.notion.com/`). These tokens may describe that page, not the URL you asked for.

## Overview

**Visual character:** Bright, high contrast; white background dominates with black text and vivid blue accents

**Density:** spacious. The layout uses a varied spacing scale.

## Colors

Palette extracted from the live page. Token names below map to the machine-readable `colors` block above.

- **Black** (`#000000f2`): Primary text (dominant)
- **White** (`#ffffff`): Page background (dominant)
- **Near-transparent White** (`#ffffff00`): Divider / border (dominant)
- **Near-transparent Black** (`#0000001a`): Divider / border (dominant)
- **Gray** (`#a39e98`): Muted text (accent)
- **Vivid Blue** (`#097fe8`): Secondary text (accent)
- **Blue** (`#62aef0`): Accent background (accent)
- **Red** (`#f77463`): Accent background (accent)
- **Orange** (`#ffc95e`): Accent background (accent)
- **Cyan** (`#2a9d99`): Accent background (accent)

**Incidental (low usage, do not lead with these):** `#78736f`, `#0000000d`

## Typography

**Primary font:** NotionInter
**Secondary font:** Segoe UI Variable Display

**Fonts by role:**
- Headings: NotionInter, Segoe UI Variable Display
- Body: NotionInter

**All detected fonts:** NotionInter (1048), Segoe UI Variable Display (138), Lyon Text (2)

**Type scale:**
- Headings: 24px, 26px, 32px, 40px, 48px, 54px, 72px
- Body / UI: 14px, 16px, 20px, 22px
- Captions / Small: 12px

**Weights in use:** 400, 450, 500, 550, 600, 700

**Line heights:** 24px, 20px, 16px, 30px, 28px, 60px, 72px, 56px, 87px, 33px

**Letter spacing:** 0.125px, -0.25px, -0.125px, -1.875px, -2px, -0.625px

## Layout

**Spacing scale:** 3px, 4px, 6px, 8px, 12px, 15px, 16px, 24px

## Elevation & Depth

Uses 4 shadow styles for layering and elevation:

- Level 1: `rgba(0, 0, 0, 0.01) 0px 0.175px 1.041px 0px, rgba(0, 0, 0, 0.02) 0px 0.8px 2.925px 0px, rgba(0, 0, 0, 0.027) 0px 2.025px 7.847px 0px, rgba(0, 0, 0, 0.04) 0px 4px 18px 0px`
- Level 2: `rgba(0, 0, 0, 0.008) 0px 0.667px 3.502px 0px, rgba(0, 0, 0, 0.016) 0px 2.933px 7.252px 0px, rgba(0, 0, 0, 0.02) 0px 7.2px 14.462px 0px, rgba(0, 0, 0, 0.024) 0px 13.867px 28.348px 0px, rgba(0, 0, 0, 0.03) 0px 23.333px 52.123px 0px, rgba(0, 0, 0, 0.04) 0px 36px 89px 0px`
- Level 3: `rgba(0, 0, 0, 0.01) 0px 1px 3px 0px, rgba(0, 0, 0, 0.02) 0px 3px 7px 0px, rgba(0, 0, 0, 0.02) 0px 7px 15px 0px, rgba(0, 0, 0, 0.04) 0px 14px 28px 0px, rgba(0, 0, 0, 0.05) 0px 23px 52px 0px`
- Level 4: `rgba(0, 0, 0, 0.1) 0px 1px 0px 0px`

## Shapes

**Shape language:** Rounded, friendly aesthetic with generous corner radii.

**Border radii:** 4px, 8px, 12px, 12px 0px 0px, 16px, 20px, 100%, 9999px (pill)

Asymmetric / percentage radii observed (12px 0px 0px, 100%); kept out of the ordinal `rounded` scale since they don't fit a magnitude order.

## Components

Observed from the live DOM. Machine-readable component tokens are in the `components` block above.

### Buttons
- Background: `#0075de`
- Text color: `#ffffff`
- Corner radius: 8px
- Height: 36px
- Padding: 4px 14px 4px 14px
- Font: 16px, weight 500

### Cards
- Background: `#ffffff`
- Corner radius: 12px
- Padding: 24px 24px 24px 24px

## Do's and Don'ts

- Do use `#ffc95e` for primary actions and CTAs
- Do use `NotionInter` as the primary typeface
- Don't introduce colors outside the palette above
- Don't mix fonts beyond NotionInter and Segoe UI Variable Display
- Don't use border-radius values outside: 4px, 8px, 12px, 12px 0px 0px, 16px, 20px, 100%, 9999px (pill)

---

*This DESIGN.md was generated by [brandmd](https://github.com/yuvrajangadsingh/brandmd) and validates against the official [@google/design.md](https://github.com/google-labs-code/design.md) linter. Drop it into your project root and AI coding agents (Claude Code, Cursor, Gemini CLI) will use it to generate on-brand UI.*