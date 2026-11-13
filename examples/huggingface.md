---
version: alpha
name: "Hugging Face – The AI community building the future."
description: "Bright, high contrast"
colors:
  background: "#ffffff"
  on-background: "#000000"
  on-surface-variant: "#4a5565"
  outline: "#e5e7eb"
  outline-variant: "#ffffff1a"
  primary: "#ff6900"
  on-primary: "#1a1a1a"
  secondary: "#8e51ff"
  on-secondary: "#ffffff"
typography:
  display:
    fontFamily: Source Sans Pro
    fontSize: 96px
    fontWeight: 600
    lineHeight: 1.1
  headline-lg:
    fontFamily: Source Sans Pro
    fontSize: 60px
    fontWeight: 600
    lineHeight: 1.1
  headline-md:
    fontFamily: Source Sans Pro
    fontSize: 48px
    fontWeight: 700
    lineHeight: 1
  body-md:
    fontFamily: Source Sans Pro
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: Source Sans Pro
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.25
  label-sm:
    fontFamily: Source Sans Pro
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.33
rounded:
  sm: 4px
  md: 6px
  lg: 8px
  xl: 12px
  2xl: 25.5px
  full: 9999px
spacing:
  base: 8px
  xs: 2px
  sm: 4px
  md: 6px
  lg: 12px
  xl: 16px
components:
  button-primary:
    backgroundColor: "#000000"
    textColor: "#ffffff"
    typography: "{typography.label-sm}"
    rounded: "{rounded.lg}"
    padding: 4px
    height: 34px
  button-secondary:
    backgroundColor: transparent
    typography: "{typography.label-sm}"
    rounded: "{rounded.lg}"
    padding: 8px
    height: 38px
  card:
    rounded: "{rounded.lg}"
---

> This is a real `DESIGN.md` example generated from [https://huggingface.co](https://huggingface.co) with `npx brandmd`.
>
> Drop a `DESIGN.md` like this in your project root so Claude Code, Cursor, Gemini CLI, Codex, or Google Stitch can use the colors, typography, spacing, and UI patterns when generating UI.
>
> Generate one for your site: `npx brandmd https://yoursite.com` ([npm](https://www.npmjs.com/package/brandmd) · [repo](https://github.com/yuvrajangadsingh/brandmd))


# Design System: Hugging Face – The AI community building the future.

> Extracted from [https://huggingface.co](https://huggingface.co) by brandmd

## Overview

**Visual character:** Bright, high contrast; white background dominates with black text and vivid orange accents

**Density:** spacious. The layout uses a varied spacing scale.

## Colors

Palette extracted from the live page. Token names below map to the machine-readable `colors` block above.

- **Off-white** (`#e5e7eb`): Divider / border (dominant)
- **Black** (`#000000`): Primary text (dominant)
- **White** (`#ffffff`): Page background (dominant)
- **Muted Blue** (`#99a1af`): Muted text (accent)
- **Muted Blue** (`#4a5565`): Primary text (accent)
- **White** (`#ffffffcc`): Page background (accent)
- **Dark Blue** (`#0b0f19`): Dark background / footer (accent)
- **Translucent White** (`#ffffff66`): Overlay / scrim (accent)
- **Vivid Orange** (`#ff6900`): Accent background (accent)
- **Purple** (`#8e51ff`): Accent background (accent)

**Incidental (low usage, do not lead with these):** `#ffffff1a`

## Typography

**Primary font:** Source Sans Pro
**Secondary font:** IBM Plex Mono

**Fonts by role:**
- Headings: Source Sans Pro, IBM Plex Mono
- Body: Source Sans Pro

**Type scale:**
- Headings: 24px, 30px, 48px, 60px, 96px
- Body / UI: 14px, 15px, 16px, 18px, 20px
- Captions / Small: 12px, 13.5px

**Weights in use:** 400, 600, 700

**Line heights:** 24px, 20px, 17.5px, 28px, 16px, 25px, 12px, 36px, 60px, 14px

## Layout

**Spacing scale:** 2px, 4px, 6px, 8px, 12px, 16px, 24px, 32px

## Elevation & Depth

Uses 4 shadow styles for layering and elevation:

- Level 1: `rgba(0, 0, 0, 0.05) 0px 1px 2px 0px`
- Level 2: `rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(0, 0, 0, 0.1) 0px 1px 2px -1px`
- Level 3: `rgba(0, 0, 0, 0.05) 0px 2px 4px 0px inset`
- Level 4: `rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.1) 0px 8px 10px -6px`

## Shapes

**Shape language:** Rounded, friendly aesthetic with generous corner radii.

**Border radii:** 0px 12px 12px 0px, 4px, 6px, 8px, 12px, 25.5px, 50%, 9999px (pill)

Asymmetric / percentage radii observed (0px 12px 12px 0px, 50%); kept out of the ordinal `rounded` scale since they don't fit a magnitude order.

## Components

Observed from the live DOM. Machine-readable component tokens are in the `components` block above.

### Buttons
- Background: `#000000`
- Text color: `#ffffff`
- Corner radius: 8px
- Height: 34px
- Padding: 4px 14px 4px 14px
- Font: 16px, weight 400
- Sampled from: `<a>` labelled `Explore Models`

### Cards
- Corner radius: 8px
- Shadow: `rgba(0, 0, 0, 0.05) 0px 1px 2px 0px`
- Padding: 0px 0px 0px 0px

## Do's and Don'ts

- Do use `#000000` for primary actions and CTAs
- Do stick to 3 font weights: 400, 600, 700
- Do use `Source Sans Pro` as the primary typeface
- Don't introduce colors outside the palette above
- Don't mix fonts beyond Source Sans Pro and IBM Plex Mono
- Don't use border-radius values outside: 0px 12px 12px 0px, 4px, 6px, 8px, 12px, 25.5px, 50%, 9999px (pill)

---

*This DESIGN.md was generated by [brandmd](https://github.com/yuvrajangadsingh/brandmd) and validates against the official [@google/design.md](https://github.com/google-labs-code/design.md) linter. Drop it into your project root and AI coding agents (Claude Code, Cursor, Gemini CLI) will use it to generate on-brand UI.*