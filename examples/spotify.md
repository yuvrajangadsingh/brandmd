---
version: alpha
name: "Spotify - Web Player: Music for everyone"
description: "Dark, high contrast"
colors:
  background: "#ffffff"
  on-background: "#000000"
  on-surface-variant: "#b3b3b3"
  outline: "#7c7c7c"
  outline-variant: "#292929"
  primary: "#1ed760"
  on-primary: "#1a1a1a"
  secondary: "#b01820"
  on-secondary: "#ffffff"
typography:
  headline-lg:
    fontFamily: SpotifyMixUI
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.25
  body-md:
    fontFamily: SpotifyMixUI
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  body-lg:
    fontFamily: SpotifyMixUI
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  label-sm:
    fontFamily: SpotifyMixUI
    fontSize: 13.5px
    fontWeight: 500
    lineHeight: 1.5
rounded:
  sm: 2px
  md: 4px
  lg: 6px
  xl: 8px
  2xl: 10px
  3xl: 500px
  full: 9999px
spacing:
  base: 12px
  xs: 2px
  sm: 4px
  md: 6px
  lg: 8px
  xl: 16px
components:
  button-primary:
    backgroundColor: "#292929"
    textColor: "#ffffff"
    typography: "{typography.label-sm}"
    padding: 8px
    height: 40px
  button-secondary:
    backgroundColor: transparent
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: 12px
    height: 48px
  card:
    rounded: "{rounded.lg}"
    padding: 12px
  input:
    backgroundColor: "{colors.background}"
    textColor: "{colors.on-background}"
    typography: "{typography.body-md}"
    rounded: 0px
---

> This is a real `DESIGN.md` example generated from [https://spotify.com](https://spotify.com) with `npx brandmd`.
>
> Drop a `DESIGN.md` like this in your project root so Claude Code, Cursor, Gemini CLI, Codex, or Google Stitch can use the colors, typography, spacing, and UI patterns when generating UI.
>
> Generate one for your site: `npx brandmd https://yoursite.com` ([npm](https://www.npmjs.com/package/brandmd) · [repo](https://github.com/yuvrajangadsingh/brandmd))


# Design System: Spotify - Web Player: Music for everyone

> Extracted from [https://spotify.com](https://spotify.com) by brandmd

> ⚠️ **Provenance:** `https://spotify.com` redirected to `https://open.spotify.com/`. These tokens may describe that page, not the URL you asked for.

## Overview

**Visual character:** Dark, high contrast; black background dominates with white text and green accents

**Density:** spacious. The layout uses a varied spacing scale.

## Colors

Palette extracted from the live page. Token names below map to the machine-readable `colors` block above.

- **Light gray** (`#b3b3b3`): Muted text (dominant)
- **Black** (`#121212`): Dark background / footer (dominant)
- **Gray** (`#7c7c7c`): Divider / border (dominant)
- **Dark gray** (`#292929`): Divider / border (dominant)
- **Black** (`#000000`): Primary text (accent)
- **Green** (`#1ed760`): Accent background (accent)
- **White** (`#ffffff`): Page background (accent)
- **Dark gray** (`#535353`): Dark background / footer (accent)
- **Red** (`#b01820`): Accent background (accent)
- **Dark Red** (`#400808`): Dark background / footer (accent)
- **Vivid Blue** (`#0000ee`): Primary text (accent)

## Typography

**Primary font:** SpotifyMixUI
**Secondary font:** SpotifyMixUITitle

**Fonts by role:**
- Headings: SpotifyMixUI, SpotifyMixUITitle
- Body: SpotifyMixUI

**All detected fonts:** SpotifyMixUI (1397), SpotifyMixUITitle (9), Times (1)

**Type scale:**
- Headings: 24px
- Body / UI: 14px, 16px
- Captions / Small: 10.5px, 12px, 13.5px

**Weights in use:** 400, 600, 700

**Line heights:** 14px, 24px

## Layout

**Spacing scale:** 2px, 4px, 8px, 12px, 16px, 24px, 32px, 171.5px

**Base unit:** 4px grid — 83% of all weighted spacing values are multiples of 4.

## Elevation & Depth

Uses 3 shadow styles for layering and elevation:

- Level 1: `rgba(0, 0, 0, 0.5) 0px 8px 24px 0px`
- Level 2: `rgba(0, 0, 0, 0.3) 0px 8px 8px 0px`
- Level 3: `rgb(18, 18, 18) 0px 1px 0px 0px, rgb(124, 124, 124) 0px 0px 0px 1px inset`

## Shapes

**Shape language:** Rounded, friendly aesthetic with generous corner radii.

**Border radii:** 2px, 4px, 6px, 8px, 10px, 50%, 500px, 9999px (pill)

Asymmetric / percentage radii observed (50%); kept out of the ordinal `rounded` scale since they don't fit a magnitude order.

## Components

Observed from the live DOM. Machine-readable component tokens are in the `components` block above.

### Buttons
- Background: `#292929`
- Text color: `#ffffff`
- Corner radius: 50%
- Height: 40px
- Padding: 8px 8px 8px 8px
- Font: 16px, weight 400

### Cards
- Corner radius: 6px
- Padding: 12px 12px 12px 12px

### Inputs
- Background: `#ffffff`
- Border: 1px solid rgb(193, 193, 193)
- Corner radius: 0px
- Padding: 0px 0px 0px 0px
- Font size: 13.3333px

## Do's and Don'ts

- Do use a 4px grid for spacing
- Do use `#1ed760` for primary actions and CTAs
- Do stick to 3 font weights: 400, 600, 700
- Do use `SpotifyMixUI` as the primary typeface
- Don't introduce colors outside the palette above
- Don't mix fonts beyond SpotifyMixUI and SpotifyMixUITitle
- Don't use border-radius values outside: 2px, 4px, 6px, 8px, 10px, 50%, 500px, 9999px (pill)

---

*This DESIGN.md was generated by [brandmd](https://github.com/yuvrajangadsingh/brandmd) and validates against the official [@google/design.md](https://github.com/google-labs-code/design.md) linter. Drop it into your project root and AI coding agents (Claude Code, Cursor, Gemini CLI) will use it to generate on-brand UI.*