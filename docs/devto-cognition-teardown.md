---
title: "5 heuristic bugs that made my design-token tool call a bright cream page \"dark and moody\""
published: true
tags: ai, webdev, css, opensource
---

i maintain a small cli called [brandmd](https://github.com/yuvrajangadsingh/brandmd). it points a headless browser at any url, reads the computed css, and writes a `DESIGN.md` that AI coding agents (Claude Code, Cursor, Gemini CLI) can read so they build on-brand UI instead of guessing.

last week i ran it on cognition.ai's FrontierCode blog post and the output was embarrassing. the page is cream and bright, basically a magazine layout. here is what brandmd said about it:

- **mood: "Dark and moody"**
- **`#F7F6F5` got named "Light Muted Orange"** (it is off-white)
- **`#2200FF` got named "Dark Blue"** (it is the most electric blue you have ever seen)
- **border radii: `4px, 3.35544e+07px`** (yes, scientific notation in a design doc)
- **type scale: `11px, 11.05px, 11.5px, 12px, 12.5px, 12.75px, 13px`** (seven sizes that are really three)

every single one was a different heuristic bug. here is the anatomy of each, because they are the kind of mistakes that look fine in a unit test and fall apart on a real site.

## 1. mood from averaging luminance

the mood line came from averaging the luminance of the whole palette, then bucketing: high average is "light and airy", low is "dark and moody".

the problem is averaging treats a tiny dark footer the same as a full-viewport cream background. cognition has a dark footer and a few dark chips. they dragged the average down far enough to flip the whole verdict, even though 90% of the screen is cream.

the fix was to stop averaging and anchor to the dominant background instead. find the background color that covers the most viewport area, judge the mood from that. one color, weighted by how much of the page it actually owns.

```
Bright, high contrast; off-white background dominates with black text and vivid blue accents
```

that line is evidence-based now. it names the dominant color and what it does, instead of a vibe word.

## 2. color names from nearest-RGB

color naming used nearest-neighbor in RGB space against a list of named colors. cream (`#F7F6F5`) has a slight warm cast, so the closest named color by raw RGB distance landed on a muted orange. technically the nearest point. completely wrong to a human.

RGB distance is a bad model for how we name colors. switched to HSL rules instead:

- lightness above ~90% is a near-white. if the hue is warm it reads as cream, if cool it reads as off-white. it never gets a chromatic name.
- high saturation in the mid lightness band gets "vivid".
- everything else maps hue ranges to names.

now `#F7F6F5` is "off-white" and `#2200FF` is "vivid blue".

## 3. blue is "dark" by luminance

this one is the most counterintuitive. `#2200FF` is a bright electric blue, but brandmd called it "dark blue". why? because the tone word was derived from luminance, and blue barely contributes to luminance.

the standard luminance formula weights the channels roughly:

```
luminance = 0.2126*R + 0.7152*G + 0.0722*B
```

blue is only 7% of the weight. so a fully saturated blue scores darker than a muted brown. by luminance, `#2200FF` genuinely is "dark", even though your eye reads it as loud and bright.

the fix is to take tone words from HSL lightness, not luminance. lightness treats the channels evenly, so a mid-lightness blue reads as a mid-tone, and the saturation check adds "vivid".

## 4. scientific notation in a design doc

`3.35544e+07px`. that is what `getComputedStyle` returns for `border-radius: 9999px` on a pill-shaped button (the browser resolves the "make it fully round" intent into a giant pixel value).

brandmd was printing the raw computed value straight into the markdown. worse, it was feeding that giant number into the shape-language inference, so a sharp-edged site with one pill button got described as "rounded and friendly".

two fixes:

- normalize any radius above ~999px to `9999px (pill)` for display, keep it CSS-valid.
- exclude pill values from the "is this site rounded or sharp" judgment. judge shape from the largest non-pill radius.

## 5. sub-pixel font sizes are noise

the type scale had seven sizes between 11 and 13px because sub-pixel rendering and zoom produce values like `11.05px` and `12.75px`. those are not distinct steps in a design system, they are rendering artifacts.

the fix is a clustering pass: round every size to the nearest 0.5px before ranking, then dedupe. seven noisy values collapse to the three real ones.

## the lesson that actually mattered

the bug that taught me the most was not in this list directly. while fixing the palette i found that **element count is a terrible proxy for visual dominance.**

brandmd was ranking colors by how many elements used them. a 6% alpha black overlay sat on dozens of tiny chips, so by element count it outranked the actual page background that lived on one big element. the "primary" color was an overlay nobody consciously sees.

weighting by viewport area share instead of element count fixed the palette ordering in one line. how much of the screen a color owns is a far better signal than how many nodes reference it.

## try it

all of this shipped in brandmd v0.12. you can reproduce the before and after yourself:

```bash
npx brandmd@0.11.1 https://cognition.ai/blog/frontier-code   # the bad output
npx brandmd@0.12.0 https://cognition.ai/blog/frontier-code   # the fixed output
```

the [full changelog](https://github.com/yuvrajangadsingh/brandmd/blob/main/CHANGELOG.md) has the side by side. repo is [here](https://github.com/yuvrajangadsingh/brandmd) if you want to point your coding agent at a real design system instead of letting it guess.
