---
version: alpha
name: "Raycast - Your shortcut to everything"
description: "Dark, high contrast"
colors:
  background: "#07080a"
  on-background: "#2f3031"
  surface: "#e6e6e6"
  on-surface-variant: "#6a6b6c"
  outline: "#ffffff0f"
  primary: "#56c2ff"
  on-primary: "#1a1a1a"
  secondary: "#eca5a7"
  on-secondary: "#1a1a1a"
typography:
  display:
    fontFamily: Inter
    fontSize: 64px
    fontWeight: 600
    lineHeight: 1.1
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
  body-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.61
  label-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1
rounded:
  sm: 6px
  md: 8px
  lg: 11px
  xl: 12px
  2xl: 16px
  3xl: 20px
  full: 9999px
spacing:
  base: 8px
  xs: 2.5px
  sm: 4px
  md: 10px
  lg: 12px
  xl: 14.5px
components:
  button-primary:
    backgroundColor: "#111214"
    textColor: "#ffffff"
    typography: "{typography.label-sm}"
    rounded: 86px
    padding: 20px
    height: 57px
  button-primary-gradient-stop-2:
    backgroundColor: "#0c0d0f"
  button-secondary:
    backgroundColor: transparent
    typography: "{typography.label-sm}"
    rounded: 0px
    height: 67px
  card:
    backgroundColor: "{colors.surface}"
    rounded: 0px
  input:
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 8px
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

**Visual character:** Dark, high contrast; dark muted blue background dominates with white text and blue accents

**Density:** spacious. The layout uses a varied spacing scale.

**Motion:** Animation surfaces detected (canvas rendering). The brand uses motion, so treat static tokens as a floor. Detection is presence-only; it does not describe the animations.

## Colors

Palette extracted from the live page. Token names below map to the machine-readable `colors` block above.

- **White** (`#ffffff`): Light text (on dark) (dominant)
- **Dark Muted Blue** (`#07080a`): Dark background / footer (dominant)
- **Off-white** (`#e6e6e6`): Surface / card background (dominant)
- **Near-transparent White** (`#ffffff0f`): Divider / border (dominant)
- **Gray** (`#6a6b6c`): Secondary text (accent)
- **Dark gray** (`#2f3031`): Primary text (accent)
- **Gray** (`#9c9c9d`): Muted text (accent)
- **Blue** (`#56c2ff`): Accent background (accent)
- **Light Red** (`#eca5a7`): Accent background (accent)

**Incidental (low usage, do not lead with these):** `#20235bb3`, `#434345`

## Typography

**Primary font:** Inter
**Secondary font:** SF Pro Text

**Fonts by role:**
- Headings: Inter
- Body: Inter

**All detected fonts:** Inter (1910), SF Pro Text (523), SF Pro (37), GeistMono (29)

**Type scale:**
- Headings: 24px, 32px, 64px
- Body / UI: 14px, 16px, 18px, 20px, 22px
- Captions / Small: 10px, 11px, 12px, 13px

**Weights in use:** 300, 400, 500, 600, 700

**Line heights:** 18.5px, 27.5px, 37px, 16px, 22.5px, 25.5px, 38.5px, 19.5px, 20.5px, 13px

**Letter spacing:** 0.1px, 0.2px, 0.3px, 0.8px, 0.5px, -0.05px

## Layout

**Spacing scale:** 8px, 10px, 12px, 14.5px, 15px, 16px, 20px, 24px

## Elevation & Depth

Uses 5 shadow styles for layering and elevation:

- Level 1: `rgba(0, 0, 0, 0.4) 0px 1.5px 0.5px 2.5px, rgb(0, 0, 0) 0px 0px 0.5px 1px, rgba(0, 0, 0, 0.25) 0px 2px 1px 1px inset, rgba(255, 255, 255, 0.2) 0px 1px 1px 1px inset, rgba(0, 0, 0, 0) 0px 0px 0px 0px inset`
- Level 2: `rgb(27, 28, 30) 0px 0px 0px 1px, rgb(7, 8, 10) 0px 0px 0px 1px inset`
- Level 3: `rgba(215, 201, 175, 0.05) 0px 0px 20px 5px, rgba(215, 201, 175, 0.05) 0px 0px 16px -7px`
- Level 4: `rgba(0, 0, 0, 0.28) 0px 1.189px 2.377px 0px`
- Level 5: `rgba(255, 255, 255, 0.05) 0px 1px 0px 0px inset, rgba(255, 255, 255, 0.25) 0px 0px 0px 1px, rgba(0, 0, 0, 0.2) 0px -1px 0px 0px inset`

## Shapes

**Shape language:** Rounded, friendly aesthetic with generous corner radii.

**Border radii:** 6px, 8px, 11px, 12px, 16px, 20px, 100%, 9999px (pill)

Asymmetric / percentage radii observed (100%); kept out of the ordinal `rounded` scale since they don't fit a magnitude order.

## Components

Observed from the live DOM. Machine-readable component tokens are in the `components` block above.

### Buttons
- Background: `linear-gradient(137deg, rgb(17, 18, 20) 4.87%, rgb(12, 13, 15) 75.88%)` (gradient; first stop `#111214`)
- Text color: `#6a6b6c`
- Corner radius: 86px
- Height: 57px
- Padding: 20px 20px 20px 20px
- Font: 16px, weight 400

### Cards
- Corner radius: 0px
- Padding: 0px 0px 0px 0px

### Inputs
- Background: `#ffffff0d`
- Border: 1px solid rgba(255, 255, 255, 0.05)
- Corner radius: 8px
- Padding: 8px 12px 8px 12px
- Font size: 14px

## Do's and Don'ts

- Do use `#56c2ff` for primary actions and CTAs
- Do use `Inter` as the primary typeface
- Don't introduce colors outside the palette above
- Don't mix fonts beyond Inter and SF Pro Text
- Don't use border-radius values outside: 6px, 8px, 11px, 12px, 16px, 20px, 100%, 9999px (pill)

---

*This DESIGN.md was generated by [brandmd](https://github.com/yuvrajangadsingh/brandmd) and validates against the official [@google/design.md](https://github.com/google-labs-code/design.md) linter. Drop it into your project root and AI coding agents (Claude Code, Cursor, Gemini CLI) will use it to generate on-brand UI.*