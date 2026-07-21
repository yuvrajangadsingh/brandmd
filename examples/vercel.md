---
version: alpha
name: "Agentic Infrastructure - Vercel"
description: "Bright, high contrast"
colors:
  background: "#fafafa"
  on-background: "#4d4d4d"
  surface: "#00ff95"
  on-surface-variant: "#8f8f8f"
  outline: "#ebebeb"
  outline-variant: "#00000014"
  primary: "#ff1744"
  on-primary: "#1a1a1a"
  secondary: "#ffd000"
  on-secondary: "#1a1a1a"
typography:
  display:
    fontFamily: GeistSans
    fontSize: 64px
    fontWeight: 400
    lineHeight: 1
  headline-lg:
    fontFamily: GeistSans
    fontSize: 56px
    fontWeight: 450
    lineHeight: 1
  headline-md:
    fontFamily: GeistSans
    fontSize: 30px
    fontWeight: 400
    lineHeight: 1.1
  body-md:
    fontFamily: GeistSans
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.43
  body-lg:
    fontFamily: GeistSans
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  label-sm:
    fontFamily: GeistSans
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.33
rounded:
  sm: 2px
  md: 6px
  lg: 8px
  full: 9999px
spacing:
  base: 2px
  xs: 3px
  sm: 4px
  md: 5px
  lg: 6px
  xl: 8px
components:
  button-secondary:
    backgroundColor: transparent
    typography: "{typography.label-sm}"
    rounded: 0px
    height: 32px
---

> This is a real `DESIGN.md` example generated from [https://vercel.com](https://vercel.com) with `npx brandmd`.
>
> Drop a `DESIGN.md` like this in your project root so Claude Code, Cursor, Gemini CLI, Codex, or Google Stitch can use the colors, typography, spacing, and UI patterns when generating UI.
>
> Generate one for your site: `npx brandmd https://yoursite.com` ([npm](https://www.npmjs.com/package/brandmd) · [repo](https://github.com/yuvrajangadsingh/brandmd))


# Design System: Agentic Infrastructure - Vercel

> Extracted from [https://vercel.com](https://vercel.com) by brandmd

## Overview

**Visual character:** Bright, high contrast; white background dominates with black text and vivid yellow accents

**Density:** spacious. The layout uses a varied spacing scale.

**Motion:** Animation surfaces detected (scripted animation via requestAnimationFrame). The brand uses motion, so treat static tokens as a floor. Detection is presence-only; it does not describe the animations.

## Colors

Palette extracted from the live page. Token names below map to the machine-readable `colors` block above.

- **Off-white** (`#ebebeb`): Divider / border (dominant)
- **Dark gray** (`#4d4d4d`): Primary text (dominant)
- **White** (`#fafafa`): Page background (dominant)
- **Black** (`#171717`): Dark background / footer (accent)
- **Vivid Yellow** (`#ffd000`): Accent background (accent)
- **Vivid Green** (`#00ff95`): Surface / card background (accent)
- **Vivid Red** (`#ff1744`): Accent background (accent)
- **Vivid Purple** (`#9500ff`): Accent background (accent)

**Incidental (low usage, do not lead with these):** `#8f8f8f`, `#ffffff`, `#00000014`

## Typography

**Primary font:** GeistSans
**Secondary font:** Geist Mono

**Fonts by role:**
- Headings: GeistSans, Geist Mono
- Body: GeistSans

**Type scale:**
- Headings: 24px, 30px, 56px, 64px
- Body / UI: 14px, 16px, 20px
- Captions / Small: 8px, 11px, 12px, 13px

**Weights in use:** 400, 450, 500, 600

**Line heights:** 24px, 20px, 32px, 21px, 28px, 16px, 8px, 33px, 22.5px, 56px

**Letter spacing:** -1.5px, 0.6px, -3.36px, 1px, -3.84px

## Layout

**Spacing scale:** 2px, 3px, 4px, 6px, 8px, 12px, 20px, 24px

## Elevation & Depth

Uses 5 shadow styles for layering and elevation:

- Level 1: `rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgb(235, 235, 235) 0px 0px 0px 1px`
- Level 2: `rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px, rgb(250, 250, 250) 0px 0px 0px 1px`
- Level 3: `rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 1px 0px 0px`
- Level 4: `rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgb(255, 255, 255) 0px 0px 0px 2px, rgb(0, 114, 245) 0px 0px 0px 4px`
- Level 5: `rgba(0, 0, 0, 0.08) 0px 0px 0px 1px, rgba(0, 0, 0, 0.04) 0px 2px 2px 0px, rgb(250, 250, 250) 0px 0px 0px 1px`

## Shapes

**Shape language:** Subtle rounding on interactive elements.

**Border radii:** 0px 0px 0px 1px, 0px 8px 8px 0px, 2px, 6px, 8px, 100%, 9999px (pill), 9999px 6px 6px 9999px (pill)

Asymmetric / percentage radii observed (0px 0px 0px 1px, 0px 8px 8px 0px, 100%, 9999px 6px 6px 9999px); kept out of the ordinal `rounded` scale since they don't fit a magnitude order.

## Components

Observed from the live DOM. Machine-readable component tokens are in the `components` block above.

### Buttons
- Text color: `#4d4d4d`
- Corner radius: 0px
- Height: 32px
- Padding: 0px 0px 0px 0px
- Font: 14px, weight 400

## Do's and Don'ts

- Do use `#ff1744` for primary actions and CTAs
- Do stick to 4 font weights: 400, 450, 500, 600
- Do use `GeistSans` as the primary typeface
- Don't introduce colors outside the palette above
- Don't mix fonts beyond GeistSans and Geist Mono
- Don't use border-radius values outside: 0px 0px 0px 1px, 0px 8px 8px 0px, 2px, 6px, 8px, 100%, 9999px (pill), 9999px 6px 6px 9999px (pill)

---

*This DESIGN.md was generated by [brandmd](https://github.com/yuvrajangadsingh/brandmd) and validates against the official [@google/design.md](https://github.com/google-labs-code/design.md) linter. Drop it into your project root and AI coding agents (Claude Code, Cursor, Gemini CLI) will use it to generate on-brand UI.*