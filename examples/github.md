---
version: alpha
name: "GitHub · Change is constant. GitHub keeps you ahead. · GitHub"
description: "Dark, high contrast"
colors:
  background: "#ffffff"
  on-background: "#000000"
  on-surface-variant: "#a4aea6"
  outline: "#484f58"
  primary: "#1f6feb"
  on-primary: "#ffffff"
  secondary: "#8dd6ff"
  on-secondary: "#1a1a1a"
typography:
  display:
    fontFamily: Mona Sans
    fontSize: 64px
    fontWeight: 425
    lineHeight: 1.08
  headline-lg:
    fontFamily: Mona Sans
    fontSize: 48px
    fontWeight: 800
    lineHeight: 1
  headline-md:
    fontFamily: Mona Sans
    fontSize: 40px
    fontWeight: 460
    lineHeight: 1.2
  body-md:
    fontFamily: Mona Sans
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  body-lg:
    fontFamily: Mona Sans
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  label-sm:
    fontFamily: Mona Sans
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: 6px
  md: 8px
  lg: 16px
  xl: 24px
  2xl: 60px
spacing:
  base: 4px
  xs: 2px
  sm: 2.5px
  md: 8px
  lg: 12px
  xl: 16px
components:
  button-primary:
    backgroundColor: "#08872b"
    textColor: "#ffffff"
    typography: "{typography.label-sm}"
    rounded: "{rounded.sm}"
    padding: 6px
    height: 48px
  button-secondary:
    backgroundColor: transparent
    typography: "{typography.label-sm}"
    rounded: 0px
    padding: 8px
    height: 40px
  input:
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
---

> This is a real `DESIGN.md` example generated from [https://github.com](https://github.com) with `npx brandmd`.
>
> Drop a `DESIGN.md` like this in your project root so Claude Code, Cursor, Gemini CLI, Codex, or Google Stitch can use the colors, typography, spacing, and UI patterns when generating UI.
>
> Generate one for your site: `npx brandmd https://yoursite.com` ([npm](https://www.npmjs.com/package/brandmd) · [repo](https://github.com/yuvrajangadsingh/brandmd))


# Design System: GitHub · Change is constant. GitHub keeps you ahead. · GitHub

> Extracted from [https://github.com](https://github.com) by brandmd

## Overview

**Visual character:** Dark, high contrast; dark muted blue background dominates with off-white text and light blue accents

**Density:** spacious. The layout uses a varied spacing scale.

**Motion:** Animation surfaces detected (canvas rendering). The brand uses motion, so treat static tokens as a floor. Detection is presence-only; it does not describe the animations.

## Colors

Palette extracted from the live page. Token names below map to the machine-readable `colors` block above.

- **Off-white** (`#f0f6fc`): Light text (on dark) (dominant)
- **Dark Muted Blue** (`#0d1117`): Dark background / footer (dominant)
- **Black** (`#000000`): Primary text (accent)
- **White** (`#ffffff`): Page background (accent)
- **Light Blue** (`#8dd6ff`): Link / accent text (accent)
- **Gray** (`#a4aea6`): Muted text (accent)
- **Near-transparent Blue** (`#2732e700`): Overlay / scrim (accent)
- **Blue** (`#1f6feb`): Accent background (accent)
- **Light Purple** (`#e6b7fe`): Accent background (accent)
- **Dark Blue** (`#000240`): Dark background / footer (accent)
- **Dark gray** (`#484f58`): Divider / border (accent)

## Typography

**Primary font:** Mona Sans
**Secondary font:** Mona Sans Mono

**Fonts by role:**
- Headings: Mona Sans, Mona Sans Mono
- Body: Mona Sans

**Type scale:**
- Headings: 24px, 40px, 48px, 64px
- Body / UI: 14px, 16px, 18px, 22px
- Captions / Small: 12px

**Weights in use:** 400, 425, 460, 480, 500, 600

**Line heights:** 24px, 21px, 27px, 18px, 31px, 48px, 20px, 14px, 36px, 52px

**Letter spacing:** 0.24px, 0.21px, 0.18px, 0.16px, 0.5px, -2.24px

## Layout

**Spacing scale:** 2px, 4px, 8px, 12px, 16px, 20px, 24px, 32px

**Base unit:** 4px grid — 85% of all weighted spacing values are multiples of 4.

## Elevation & Depth

Uses 1 shadow style for layering and elevation:

- Level 1: `rgba(209, 217, 224, 0.25) 0px 0px 0px 1px, rgba(37, 41, 46, 0.04) 0px 6px 12px -3px, rgba(37, 41, 46, 0.12) 0px 6px 18px 0px`

## Shapes

**Shape language:** Rounded, friendly aesthetic with generous corner radii.

**Border radii:** 6px, 8px, 16px 0px 0px, 16px, 24px 24px 0px 0px, 24px, 50%, 60px

Asymmetric / percentage radii observed (16px 0px 0px, 24px 24px 0px 0px, 50%); kept out of the ordinal `rounded` scale since they don't fit a magnitude order.

## Components

Observed from the live DOM. Machine-readable component tokens are in the `components` block above.

### Buttons
- Background: `#08872b`
- Text color: `#ffffff`
- Corner radius: 6px
- Height: 48px
- Padding: 6px 20px 6px 20px
- Font: 16px, weight 400

### Inputs
- Border: 0px none rgba(0, 0, 0, 0)
- Corner radius: 6px
- Padding: 0px 0px 0px 0px
- Font size: 14px

## Do's and Don'ts

- Do use a 4px grid for spacing
- Do use `#1f6feb` for primary actions and CTAs
- Do use `Mona Sans` as the primary typeface
- Don't introduce colors outside the palette above
- Don't mix fonts beyond Mona Sans and Mona Sans Mono
- Don't use border-radius values outside: 6px, 8px, 16px 0px 0px, 16px, 24px 24px 0px 0px, 24px, 50%, 60px

---

*This DESIGN.md was generated by [brandmd](https://github.com/yuvrajangadsingh/brandmd) and validates against the official [@google/design.md](https://github.com/google-labs-code/design.md) linter. Drop it into your project root and AI coding agents (Claude Code, Cursor, Gemini CLI) will use it to generate on-brand UI.*