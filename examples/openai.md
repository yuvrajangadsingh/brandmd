---
version: alpha
name: "OpenAI API Platform Documentation"
description: "Bright, high contrast"
colors:
  background: "#ffffff"
  on-background: "#000000e6"
  on-surface-variant: "#5d5d5d"
  outline: "#000000"
  outline-variant: "#ededed"
  primary: "#181818"
  on-primary: "#ffffff"
typography:
  headline-lg:
    fontFamily: OpenAI Sans
    fontSize: 26px
    fontWeight: 600
    lineHeight: 1.5
  headline-md:
    fontFamily: OpenAI Sans
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.25
  body-md:
    fontFamily: OpenAI Sans
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.43
  body-lg:
    fontFamily: OpenAI Sans
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: 6px
  md: 8px
  lg: 10px
  xl: 12px
  2xl: 16px
  full: 9999px
spacing:
  base: 12px
  xs: 1px
  sm: 2px
  md: 4px
  lg: 6px
  xl: 8px
components:
  button-primary:
    backgroundColor: "#181818"
    textColor: "#ffffff"
    typography: "{typography.body-md}"
    rounded: "{rounded.full}"
    height: 44px
  button-secondary:
    backgroundColor: transparent
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    height: 28px
  card:
    rounded: "{rounded.xl}"
    padding: 16px
  input:
    typography: "{typography.body-md}"
    rounded: 0px
---

> This is a real `DESIGN.md` example generated from [https://platform.openai.com/docs](https://platform.openai.com/docs) with `npx brandmd`.
>
> Drop a `DESIGN.md` like this in your project root so Claude Code, Cursor, Gemini CLI, Codex, or Google Stitch can use the colors, typography, spacing, and UI patterns when generating UI.
>
> Generate one for your site: `npx brandmd https://yoursite.com` ([npm](https://www.npmjs.com/package/brandmd) · [repo](https://github.com/yuvrajangadsingh/brandmd))


# Design System: OpenAI API Platform Documentation

> Extracted from [https://platform.openai.com/docs](https://platform.openai.com/docs) by brandmd

> ⚠️ **Provenance:** `https://platform.openai.com/docs` redirected to `https://developers.openai.com/api/docs`. These tokens may describe that page, not the URL you asked for.

## Overview

**Visual character:** Bright, high contrast; white background dominates with black text

**Density:** spacious. The layout uses a varied spacing scale.

**Motion:** Animation surfaces detected (scripted animation via requestAnimationFrame). The brand uses motion, so treat static tokens as a floor. Detection is presence-only; it does not describe the animations.

## Colors

Palette extracted from the live page. Token names below map to the machine-readable `colors` block above.

- **Black** (`#000000e6`): Primary text (dominant)
- **White** (`#ffffff`): Page background (dominant)
- **Black** (`#000000`): Divider / border (dominant)
- **Off-white** (`#ededed`): Divider / border (dominant)
- **Gray** (`#5d5d5d`): Secondary text (accent)

**Incidental (low usage, do not lead with these):** `#8f8f8f`, `#181818`

## Typography

**Primary font:** OpenAI Sans
**Secondary font:** SF Mono

**Fonts by role:**
- Headings: OpenAI Sans
- Body: OpenAI Sans

**Type scale:**
- Headings: 24px, 26px, 30px
- Body / UI: 14px, 16px, 18px

**Weights in use:** 400, 500, 600

**Line heights:** 20px, 24px, 14px, 29px, 39px, 42px

**Letter spacing:** -0.14px, -0.16px, -0.18px, -0.52px, -0.6px

## Layout

**Spacing scale:** 4px, 6px, 8px, 10px, 12px, 16px, 20px, 24px

## Elevation & Depth

Uses 2 shadow styles for layering and elevation:

- Level 1: `rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, oklab(0 0 0 / 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.08) 0px 2px 4px -1px`
- Level 2: `rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(15, 23, 42, 0.45) 0px 16px 48px -18px`

## Shapes

**Shape language:** Rounded, friendly aesthetic with generous corner radii.

**Border radii:** 4px 4px 0px 0px, 6px, 8px, 8px 8px 0px 0px, 10px, 12px, 16px, 9999px (pill)

Asymmetric / percentage radii observed (4px 4px 0px 0px, 8px 8px 0px 0px); kept out of the ordinal `rounded` scale since they don't fit a magnitude order.

## Components

Observed from the live DOM. Machine-readable component tokens are in the `components` block above.

### Buttons
- Background: `#181818`
- Text color: `#ffffff`
- Corner radius: 9999px
- Height: 44px
- Padding: 0px 16px 0px 16px
- Font: 14px, weight 500

### Cards
- Corner radius: 12px
- Padding: 16px 16px 16px 16px

### Inputs
- Border: 0px solid rgb(40, 40, 40)
- Corner radius: 0px
- Padding: 0px 56px 0px 0px
- Font size: 18px

## Do's and Don'ts

- Do use `#181818` for primary actions and CTAs
- Do stick to 3 font weights: 400, 500, 600
- Do use `OpenAI Sans` as the primary typeface
- Don't introduce colors outside the palette above
- Don't mix fonts beyond OpenAI Sans and SF Mono
- Don't use border-radius values outside: 4px 4px 0px 0px, 6px, 8px, 8px 8px 0px 0px, 10px, 12px, 16px, 9999px (pill)

---

*This DESIGN.md was generated by [brandmd](https://github.com/yuvrajangadsingh/brandmd) and validates against the official [@google/design.md](https://github.com/google-labs-code/design.md) linter. Drop it into your project root and AI coding agents (Claude Code, Cursor, Gemini CLI) will use it to generate on-brand UI.*