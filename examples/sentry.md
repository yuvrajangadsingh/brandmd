---
version: alpha
name: "Application Performance Monitoring & Error Tracking Software | Sentry"
description: "Dark, high contrast"
colors:
  background: "#ffffff"
  on-background: "#9ecbff"
  surface: "#c2ef4e"
  outline: "#584674"
  primary: "#f97583"
  on-primary: "#1a1a1a"
  secondary: "#9ecbff"
  on-secondary: "#1a1a1a"
typography:
  display:
    fontFamily: Dammit Sans
    fontSize: 88px
    fontWeight: 700
    lineHeight: 1.2
  headline-lg:
    fontFamily: Dammit Sans
    fontSize: 60px
    fontWeight: 500
    lineHeight: 1.1
  headline-md:
    fontFamily: Dammit Sans
    fontSize: 30px
    fontWeight: 400
    lineHeight: 1.2
  body-md:
    fontFamily: Monaco
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  body-lg:
    fontFamily: Monaco
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.29
  label-sm:
    fontFamily: Monaco
    fontSize: 12px
    fontWeight: 400
    lineHeight: 2
rounded:
  sm: 8px
  md: 10px
  lg: 10.5px
  xl: 12px
  2xl: 13px
  3xl: 18px
  full: 9999px
spacing:
  base: 8px
  xs: 2px
  sm: 4px
  md: 12px
  lg: 16px
  xl: 20.5px
components:
  button-primary:
    backgroundColor: "#fa7faa"
    textColor: "#1f1633"
    typography: "{typography.label-sm}"
    rounded: "{rounded.sm}"
    padding: 12px
    height: 40px
  button-primary-gradient-stop-2:
    backgroundColor: "#ff9691"
  button-primary-gradient-stop-3:
    backgroundColor: "#ffb287"
  button-primary-gradient-stop-4:
    backgroundColor: "#ffffff"
  button-secondary:
    backgroundColor: transparent
    typography: "{typography.label-sm}"
    rounded: 0px
    height: 102px
  input:
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: 8px
---

> This is a real `DESIGN.md` example generated from [https://sentry.io](https://sentry.io) with `npx brandmd`.
>
> Drop a `DESIGN.md` like this in your project root so Claude Code, Cursor, Gemini CLI, Codex, or Google Stitch can use the colors, typography, spacing, and UI patterns when generating UI.
>
> Generate one for your site: `npx brandmd https://yoursite.com` ([npm](https://www.npmjs.com/package/brandmd) · [repo](https://github.com/yuvrajangadsingh/brandmd))


# Design System: Application Performance Monitoring & Error Tracking Software | Sentry

> Extracted from [https://sentry.io](https://sentry.io) by brandmd

> ⚠️ **Provenance:** `https://sentry.io` redirected to `https://sentry.io/welcome/`. These tokens may describe that page, not the URL you asked for.

## Overview

**Visual character:** Dark, high contrast; dark purple background dominates with white text and light blue accents

**Density:** spacious. The layout uses a varied spacing scale.

**Motion:** Animation surfaces detected (canvas rendering, scripted animation via requestAnimationFrame). The brand uses motion, so treat static tokens as a floor. Detection is presence-only; it does not describe the animations.

## Colors

Palette extracted from the live page. Token names below map to the machine-readable `colors` block above.

- **Dark Purple** (`#1f1633`): Dark background / footer (dominant)
- **Light Blue** (`#9ecbff`): Link / accent text (accent)
- **Red** (`#f97583`): Link / accent text (accent)
- **Light Purple** (`#b392f0`): Link / accent text (accent)
- **Green** (`#c2ef4e`): Surface / card background (accent)
- **Pink** (`#fa7faa`): Accent background (accent)

**Incidental (low usage, do not lead with these):** `#b44092`, `#ffffff`, `#6a5fc1`, `#584674`

## Typography

**Primary font:** Dammit Sans
**Secondary font:** Rubik

**Fonts by role:**
- Headings: Dammit Sans, Rubik
- Body: Monaco
- Buttons / nav: Rubik

**All detected fonts:** Rubik (1245), Monaco (1128), IBM Plex Mono (57), Segoe UI (41), Dammit Sans (17)

**Type scale:**
- Headings: 24px, 27px, 30px, 60px, 88px
- Body / UI: 14px, 15px, 16px, 20px
- Captions / Small: 12px

**Weights in use:** 400, 500, 600, 700

**Line heights:** 24px, 32px, 18px, 14px, 66px, 34px, 16px, 21px, 30px, 20px

**Letter spacing:** 0.2px, 0%

## Layout

**Spacing scale:** 2px, 4px, 8px, 12px, 16px, 20.5px, 24px, 32px

## Elevation & Depth

Uses 5 shadow styles for layering and elevation:

- Level 1: `rgba(0, 0, 0, 0.15) 0px 2px 10px 0px inset`
- Level 2: `rgba(0, 0, 0, 0.08) 0px 2px 8px 0px`
- Level 3: `rgba(0, 0, 0, 0.1) 0px 1px 3px 0px inset`
- Level 4: `rgba(0, 0, 0, 0.2) 0px 1px 3px 0px`
- Level 5: `rgb(128, 128, 128) 0px 0px 5px 0px`

## Shapes

**Shape language:** Rounded, friendly aesthetic with generous corner radii.

**Border radii:** 8px, 10px, 10.5px, 12px, 13px, 18px, 50%, 9999px (pill)

Asymmetric / percentage radii observed (50%); kept out of the ordinal `rounded` scale since they don't fit a magnitude order.

## Components

Observed from the live DOM. Machine-readable component tokens are in the `components` block above.

### Buttons
- Background: `linear-gradient(120deg, rgb(250, 127, 170), rgb(255, 150, 145), rgb(255, 178, 135) 50%, rgb(255, 255, 255) 55%, rgb(255, 255, 255) 100%)` (gradient; first stop `#fa7faa`)
- Text color: `#1f1633`
- Corner radius: 8px
- Height: 40px
- Padding: 12px 16px 12px 16px
- Font: 14px, weight 700

### Inputs
- Background: `#422082`
- Border: 0px solid rgb(255, 255, 255)
- Corner radius: 8px
- Padding: 8px 16px 8px 16px
- Font size: 16px

## Do's and Don'ts

- Do use `#f97583` for primary actions and CTAs
- Do stick to 4 font weights: 400, 500, 600, 700
- Do use `Dammit Sans` as the primary typeface
- Don't introduce colors outside the palette above
- Don't mix fonts beyond Dammit Sans and Rubik
- Don't use border-radius values outside: 8px, 10px, 10.5px, 12px, 13px, 18px, 50%, 9999px (pill)

---

*This DESIGN.md was generated by [brandmd](https://github.com/yuvrajangadsingh/brandmd) and validates against the official [@google/design.md](https://github.com/google-labs-code/design.md) linter. Drop it into your project root and AI coding agents (Claude Code, Cursor, Gemini CLI) will use it to generate on-brand UI.*