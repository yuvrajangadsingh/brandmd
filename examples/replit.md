---
version: alpha
name: "Replit Docs"
description: "Dark, strong contrast"
colors:
  background: "#1e1e1f"
  on-background: "#57514f"
  surface: "#77716f"
  on-surface-variant: "#a6a09e"
  outline: "#2d2725"
  outline-variant: "#ffffff1a"
  primary: "#ff3c00"
  on-primary: "#1a1a1a"
typography:
  display:
    fontFamily: ABC Diatype Plus
    fontSize: 36px
    fontWeight: 700
    lineHeight: 1.1
  headline-lg:
    fontFamily: ABC Diatype Plus
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1
  body-md:
    fontFamily: ABC Diatype Plus
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.43
  body-lg:
    fontFamily: ABC Diatype Plus
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  label-sm:
    fontFamily: ABC Diatype Plus
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.33
rounded:
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  full: 9999px
spacing:
  base: 6px
  xs: 1px
  sm: 2px
  md: 4px
  lg: 8px
  xl: 9px
components:
  button-primary:
    backgroundColor: "#f26207"
    textColor: "#1a1a1a"
    typography: "{typography.label-sm}"
    rounded: "{rounded.md}"
    padding: 8px
    height: 35px
  button-secondary:
    backgroundColor: transparent
    typography: "{typography.label-sm}"
    rounded: "{rounded.md}"
    padding: 8px
    height: 35px
  card:
    backgroundColor: "{colors.background}"
    rounded: "{rounded.xl}"
  input:
    typography: "{typography.body-md}"
    rounded: 0px
    padding: 10px
---

> This is a real `DESIGN.md` example generated from [https://docs.replit.com](https://docs.replit.com) with `npx brandmd`.
>
> Drop a `DESIGN.md` like this in your project root so Claude Code, Cursor, Gemini CLI, Codex, or Google Stitch can use the colors, typography, spacing, and UI patterns when generating UI.
>
> Generate one for your site: `npx brandmd https://yoursite.com` ([npm](https://www.npmjs.com/package/brandmd) · [repo](https://github.com/yuvrajangadsingh/brandmd))


# Design System: Replit Docs

> Extracted from [https://docs.replit.com](https://docs.replit.com) by brandmd

> ⚠️ **Provenance:** `https://docs.replit.com` redirected to `https://docs.replit.com/build/welcome`. These tokens may describe that page, not the URL you asked for.

## Overview

**Visual character:** Dark, strong contrast; black background dominates with gray text and vivid red accents

**Density:** spacious. The layout uses a varied spacing scale.

**Motion:** Animation surfaces detected (scripted animation via requestAnimationFrame). The brand uses motion, so treat static tokens as a floor. Detection is presence-only; it does not describe the animations.

## Colors

Palette extracted from the live page. Token names below map to the machine-readable `colors` block above.

- **Dark gray** (`#2d2725`): Divider / border (dominant)
- **Gray** (`#a6a09e`): Muted text (dominant)
- **Black** (`#1e1e1f`): Dark background / footer (dominant)
- **White** (`#ffffff`): Light text (on dark) (accent)
- **Gray** (`#77716f`): Secondary background (accent)
- **Vivid Red** (`#ff3c00`): Accent background (accent)
- **Near-transparent White** (`#ffffff08`): Overlay / scrim (accent)

**Incidental (low usage, do not lead with these):** `#ffffff1a`, `#57514f`

## Typography

**Primary font:** ABC Diatype Plus

**Fonts by role:**
- Headings: ABC Diatype Plus
- Body: ABC Diatype Plus

**All detected fonts:** ABC Diatype Plus (610), Inter (1), paperMono (1)

**Type scale:**
- Headings: 24px, 36px
- Body / UI: 14px, 16px, 18px
- Captions / Small: 12px

**Weights in use:** 400, 500, 600, 700

**Line heights:** 20px, 24px, 28px, 16px, 17px, 39.5px, 23.5px, 21px, 18px

**Letter spacing:** -0.48px, -0.32px, -1.08px

## Layout

**Spacing scale:** 4px, 6px, 8px, 10px, 12px, 16px, 20px, 24px

## Elevation & Depth

Uses 4 shadow styles for layering and elevation:

- Level 1: `rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 2px, rgba(0, 0, 0, 0) 0px 0px 0px 0px`
- Level 2: `rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, oklab(0.376839 0.00693397 0.00568405 / 0.25) 0px 0px 0px 1px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px`
- Level 3: `rgba(255, 255, 255, 0.5) 0px 0px 1px 0px`
- Level 4: `rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, oklab(0.440044 0.00665669 0.00545922 / 0.3) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px`

## Shapes

**Shape language:** Rounded, friendly aesthetic with generous corner radii.

**Border radii:** 0px 12px 12px 0px, 6px, 8px, 12px, 12px 0px 0px 12px, 16px, 50%, 9999px (pill)

Asymmetric / percentage radii observed (0px 12px 12px 0px, 12px 0px 0px 12px, 50%); kept out of the ordinal `rounded` scale since they don't fit a magnitude order.

## Components

Observed from the live DOM. Machine-readable component tokens are in the `components` block above.

### Buttons
- Background: `#f26207`
- Text color: `#ffffff`
- Corner radius: 8px
- Height: 35px
- Padding: 8px 16px 8px 16px
- Font: 14px, weight 500

### Cards
- Background: `#1e1e1f`
- Corner radius: 16px
- Shadow: `rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 2px, rgba(0, 0, 0, 0) 0px 0px 0px 0px`
- Padding: 0px 0px 0px 0px

### Inputs
- Border: 0px solid rgb(45, 39, 37)
- Corner radius: 0px
- Padding: 10px 40px 10px 14px
- Font size: 14px

## Do's and Don'ts

- Do use `#ff3c00` for primary actions and CTAs
- Do stick to 4 font weights: 400, 500, 600, 700
- Do use `ABC Diatype Plus` as the primary typeface
- Don't introduce colors outside the palette above
- Don't mix fonts; use ABC Diatype Plus everywhere
- Don't use border-radius values outside: 0px 12px 12px 0px, 6px, 8px, 12px, 12px 0px 0px 12px, 16px, 50%, 9999px (pill)

---

*This DESIGN.md was generated by [brandmd](https://github.com/yuvrajangadsingh/brandmd) and validates against the official [@google/design.md](https://github.com/google-labs-code/design.md) linter. Drop it into your project root and AI coding agents (Claude Code, Cursor, Gemini CLI) will use it to generate on-brand UI.*