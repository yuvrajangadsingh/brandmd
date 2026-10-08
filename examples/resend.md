---
version: alpha
name: "Resend · Email for developers"
description: "Dark, high contrast"
colors:
  background: "#000000"
  on-background: "#f0f0f0"
  surface: "#43fea4ab"
  outline: "#ffffff0d"
  outline-variant: "#262a2d"
  primary: "#43fea4ab"
  on-primary: "#1a1a1a"
typography:
  display:
    fontFamily: aBCFavorit
    fontSize: 96px
    fontWeight: 400
    lineHeight: 1
  headline-lg:
    fontFamily: aBCFavorit
    fontSize: 77px
    fontWeight: 400
    lineHeight: 1
  headline-md:
    fontFamily: aBCFavorit
    fontSize: 56px
    fontWeight: 400
    lineHeight: 1.2
  body-md:
    fontFamily: inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: inter
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.43
  label-sm:
    fontFamily: inter
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.33
rounded:
  sm: 4px
  md: 6px
  lg: 8px
  xl: 10px
  2xl: 12px
  3xl: 16px
  full: 9999px
spacing:
  base: 16px
  xs: 1px
  sm: 2px
  md: 4px
  lg: 6px
  xl: 8px
components:
  button-primary:
    backgroundColor: "#000000"
    textColor: "#f0f0f0"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: 5px
    height: 32px
  button-primary-gradient-stop-2:
    backgroundColor: "#000000"
  button-primary-gradient-stop-3:
    backgroundColor: "#00000000"
  button-primary-gradient-stop-4:
    backgroundColor: "#00000000"
  button-secondary:
    backgroundColor: transparent
    typography: "{typography.label-sm}"
    rounded: 0px
    padding: 4px
    height: 58px
  input:
    typography: "{typography.body-md}"
    rounded: 0px
---

> This is a real `DESIGN.md` example generated from [https://resend.com](https://resend.com) with `npx brandmd`.
>
> Drop a `DESIGN.md` like this in your project root so Claude Code, Cursor, Gemini CLI, Codex, or Google Stitch can use the colors, typography, spacing, and UI patterns when generating UI.
>
> Generate one for your site: `npx brandmd https://yoursite.com` ([npm](https://www.npmjs.com/package/brandmd) · [repo](https://github.com/yuvrajangadsingh/brandmd))


# Design System: Resend · Email for developers

> Extracted from [https://resend.com](https://resend.com) by brandmd

## Overview

**Visual character:** Dark, high contrast; black background dominates with off-white text and translucent vivid green accents

**Density:** spacious. The layout uses a varied spacing scale.

## Colors

Palette extracted from the live page. Token names below map to the machine-readable `colors` block above.

- **Black** (`#000000`): Dark background / footer (dominant)
- **Gray** (`#a1a4a5`): Muted text (dominant)
- **Near-transparent White** (`#ffffff0d`): Divider / border (dominant)
- **Near-transparent White** (`#fdfdfd0d`): Overlay / scrim (accent)
- **Translucent Vivid Green** (`#43fea4ab`): Surface / card background (accent)

**Incidental (low usage, do not lead with these):** `#464a4d`, `#70757e`, `#50505026`, `#ffffff`, `#8f8f8fab`, `#262a2d`

## Typography

**Primary font:** aBCFavorit
**Secondary font:** domaine

**Fonts by role:**
- Headings: aBCFavorit, domaine
- Body: inter

**All detected fonts:** inter (1383), commitMono (730), aBCFavorit (30), Helvetica (22), Segoe UI (3), domaine (2)

**Type scale:**
- Headings: 24px, 56px, 77px, 96px
- Body / UI: 14px, 16px, 18px, 20px
- Captions / Small: 12px

**Weights in use:** 400, 500, 600, 700

**Line heights:** 24px, 16px, 20px, 22.5px, 27px, 67px, 14px, 26px, 25px, 33.5px

**Letter spacing:** -2.8px, 0.35px, -0.8px, -0.96px, -0.768px

## Layout

**Spacing scale:** 2px, 4px, 6px, 8px, 14px, 16px, 24px, 32px

## Elevation & Depth

Uses 4 shadow styles for layering and elevation:

- Level 1: `rgba(24, 25, 28, 0.88) 0px 0px 0px 1px`
- Level 2: `rgb(0, 0, 0) 0px 0px 0px 8px`
- Level 3: `rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(0, 0, 0, 0.1) 0px 1px 2px -1px`
- Level 4: `rgb(255, 255, 255) 0px 1px 1px 0px inset`

## Shapes

**Shape language:** Rounded, friendly aesthetic with generous corner radii.

**Border radii:** 4px, 6px, 8px, 10px, 12px, 16px, 24px, 9999px (pill)

## Components

Observed from the live DOM. Machine-readable component tokens are in the `components` block above.

### Buttons
- Background: `linear-gradient(rgb(0, 0, 0), rgb(0, 0, 0)), conic-gradient(rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 80%, rgba(0, 0, 0, 0) 100%)` (gradient; first stop `#000000`)
- Text color: `#f0f0f0`
- Corner radius: 3.35544e+07px
- Height: 32px
- Padding: 5px 12px 5px 12px
- Font: 14px, weight 400

### Inputs
- Border: 0px none rgb(240, 240, 240)
- Corner radius: 0px
- Padding: 0px 0px 0px 0px
- Font size: 16px

## Do's and Don'ts

- Do use the `button-primary` gradient from Components for primary actions and CTAs
- Do stick to 4 font weights: 400, 500, 600, 700
- Do use `aBCFavorit` as the primary typeface
- Don't introduce colors outside the palette above
- Don't mix fonts beyond aBCFavorit and domaine
- Don't use border-radius values outside: 4px, 6px, 8px, 10px, 12px, 16px, 24px, 9999px (pill)

---

*This DESIGN.md was generated by [brandmd](https://github.com/yuvrajangadsingh/brandmd) and validates against the official [@google/design.md](https://github.com/google-labs-code/design.md) linter. Drop it into your project root and AI coding agents (Claude Code, Cursor, Gemini CLI) will use it to generate on-brand UI.*