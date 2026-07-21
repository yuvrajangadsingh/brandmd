# Changelog

All notable changes to brandmd are documented here. The format roughly follows [Keep a Changelog](https://keepachangelog.com/), versions follow [Semver](https://semver.org/).

## [0.14.0] - 2026-07-20

Spec + truth release: conform to the official DESIGN.md spec and stop the confident lies.

### Added

- **Official DESIGN.md format.** Output is now YAML frontmatter (machine-readable `colors`, `typography`, `rounded`, `spacing`, `components` tokens) plus canonical prose sections in canonical order (Overview, Colors, Typography, Layout, Elevation & Depth, Shapes, Components, Do's and Don'ts), per [github.com/google-labs-code/design.md](https://github.com/google-labs-code/design.md). Every generated file passes `npx @google/design.md lint` with zero errors and zero warnings. Colors map to Material-style role tokens (`primary`, `background`, `on-surface`, `outline`, …); brandmd's tiered palette, evidence-based visual character, confidence tags, and observed component styles stay in the prose.
- **Fail-closed refusals with an exit-code contract.** `0` = success, `1` = operational/validation error, `2` = refused. Block / access-denied pages, login / sign-in wall landings (on any page of a multi-URL run), and evidence-thin pages (no rendered text, empty palette) refuse in every format and write no artifact, so a bad capture can't overwrite a good `DESIGN.md`. `--allow-blocked` forces output; the forced artifact carries a block marker in every format (Markdown callout, CSS/Tailwind comment header, HTML banner, JSON `blockLikely`).
- **Shadow values in DESIGN.md.** The Elevation & Depth section prints each shadow's real CSS value instead of only a count, so agents can reproduce elevation.
- **Redirect / login provenance.** brandmd records the final URL after redirects for every page. Login-like landings refuse (see above); plain cross-origin redirects warn on stderr and are flagged in the output provenance, per page.
- **`--debug`** prints raw error detail; browser-launch failures otherwise collapse to a one-line `npx playwright install chromium` remediation.

### Changed

- **CTA guideline names real action evidence, or nothing.** The "use X for primary actions" line ranks accent roles first, then the representative non-transparent button background, and excludes every text-neutral role, so it never sells the primary *text* color as the CTA color. Omitted when there's no action evidence.
- **Representative button is the most-saturated solid** (tie-broken by contrast vs the page), not the most frequent, so a real CTA wins over the transparent nav buttons. Gradient buttons keep their full fill: the exact computed gradient prints in the Components prose, extra stops ride as `button-primary-gradient-stop-N` variant tokens in the YAML (the spec has no gradient sub-token), and every stop lands in `--json`. A ghost / secondary variant is emitted from the transparent cluster. Button prose always states the real radius, including a true `0px`.
- **`colors.primary` is honest.** It's the brand accent when one was observed (Material semantics, matching the CTA guideline), otherwise the dominant background neutral with an explicit low-confidence note in the prose. Never the text ink, and no `button-primary` token is invented for a page with zero observed buttons.
- **Honest tokens.** A count-1 font can never be Primary, even when it's the only font (the output says "low confidence" instead). Spacing is filtered before truncation, sizes cluster before truncation (a rare hero size survives a crowd of body sizes), line-heights pair with their font sizes, 0px line-heights are dropped, and the "Npx grid" claim is computed over the full weighted evidence before any truncation, at an 80% coverage bar. Sparse pages get per-section "low confidence" notes (typography, elevation, shapes, components, do's and don'ts) instead of confident rules derived from absence; Cards/Inputs sections are omitted entirely when no card or input elements were sampled.
- **Transactional writes.** All artifacts commit via temp-file + rename with rollback: `-o`, the `--agent` set (DESIGN.md + all three wrappers commit together or not at all, previous versions restored on failure), and `brandmd diff`. Read-only targets, directories-at-target, broken symlinks, and duplicate target paths are refused up front; symlink targets are written through (the link survives, the referent updates); temp/backup names are collision-safe so nothing that brandmd didn't create is ever replaced or deleted. Atomicity is per process — concurrent runs against the same output directory are not coordinated.
- Description and README lead with "spec-valid DESIGN.md (passes the official @google/design.md linter)" instead of "Stitch-ready".
- **Every example regenerated on the v0.14 engine.** All 30 example `DESIGN.md` files and the gallery pages are fresh extractions that pass the official linter at 0 errors / 0 warnings (the old files predated v0.12 and still carried the bugs the changelog claimed were fixed). The `stitch.withgoogle.com` example is removed: the site renders no text for a headless browser, and v0.14 refuses to fabricate a design system from an empty page rather than shipping one.

### Fixed

- **`generate` → `parseDesign` → `diff` round-trips every emitted field.** The parser reads the YAML frontmatter as the source of truth — including the `components` tokens, so an edited machine value is diff-visible — plus the prose for the fields that aren't in it. The old `\z` regex (a literal `z` that truncated the last component), the "generated from" / "Extracted from" mismatch that nulled the source URL, and single-word-only role parsing are all fixed; multi-page source lists round-trip; CRLF files parse identically to LF; dark-theme colors stay out of the light palette.
- Dark overrides are emitted under a uniquely-named section (no more duplicate `## 6`) as observed diffs in palette roles, the primary button background, and the shadow-style count. Full per-category dark diffs (typography, spacing, radii, shadow values) are v0.15.
- Non-http(s) URL schemes are rejected instead of coerced (`ftp://x` no longer becomes `https://ftp://x`), filesystem-like arguments (`/tmp/x`) are errors instead of `https:///tmp/x`, and `--cf-wait-ms` must be a finite, non-negative integer.
- Page titles are sanitized to a single line before they reach the YAML `name` scalar or the Markdown H1, so a hostile title with embedded newlines can't inject headings/guidelines or break the linter's quote parsing.
- Duplicate variable-font families are merged ("Geist" / "Geist VF" → one), frequency values are rounded to 2 decimals in every output including `--json`, and hex casing is consistent (lowercase) across DESIGN.md, `--css`, `--tailwind`, `--html`, and `--json`.

## [0.13.0] - 2026-07-06

Robustness release: stop trusting block pages, and flag motion.

### Added

- **Block-page detection** (#7). Bot-protection and access-denied pages (Akamai, PerimeterX, generic WAF 403s) return real-looking HTML that sailed past the Cloudflare-specific check and produced a confident garbage DESIGN.md (rolex.com yielded a design system titled "Access Denied"). brandmd now combines independent weak signals — block-y title, 401/403/429 status, sub-200-char body, palette collapsed to fallback fonts + ≤2 colors — and requires 2+ to fire, so minimal-but-real landing pages don't false-positive. When flagged, it prints a stderr warning and prepends a warning callout to DESIGN.md, but still exits 0. The heuristic is a pure exported function (`detectBlockLikely`) with test coverage.
- **Motion detection** (#6). DESIGN.md now notes when the site has animation surfaces — canvas, WebGL, Lottie, or inline `requestAnimationFrame`. Detection is presence-only and honest about its limits: bundled event listeners inside minified JS are not enumerable from the DOM, so this catches animation surfaces, not every interaction handler. The section is omitted entirely when nothing is found. It does not describe the animations (that's deferred).

### Changed

- `npm test` now runs a real suite (`node --test`, zero new dependencies): a captured real extraction fed through `analyze()` → `generate()` locking in the v0.12 token-quality fixes, plus block and motion coverage. Previously a no-op.

## [0.12.0] - 2026-06-10

Trust-repair release: five token-quality fixes found by extracting cognition.ai and comparing against the real page (#1-#5).

### Changed

- **`Overall mood` is now `Visual character`, and it is evidence-based** (#3). The old heuristic averaged luminance across the whole palette, so a dark footer could flip a cream editorial page to "Dark and moody". The new line is anchored to the dominant page background and cites its evidence: `Bright, high contrast; off-white background dominates with black text and vivid blue accents`. The parser accepts both labels, so pre-0.12 DESIGN.md files still work in the gallery and `diff`.
- **Palette is tiered: dominant / accent / incidental** (#1). Backgrounds are now weighted by viewport area share, not just element count, so the page background outranks decorative chips. Saturated brand colors keep an accent floor even at low usage. Dominant tokens lead the palette section with a `(dominant)` tag; incidental values collapse to one "do not lead with these" line. `--json` carries the new `tier` field.
- **Color naming moved to HSL-based heuristics** (#2). `#F7F6F5` is "Off-white" (was "Light Muted Orange"), `#2200FF` is "Vivid Blue" (was "Dark Blue"), `#0000000F` is "Near-transparent Black" (alpha was silently dropped). Tinted near-whites read as Cream/Off-white, high-saturation mid-tones read as Vivid, translucency is labeled. Green/cyan hue boundary corrected (`#00D66F` is Green, not Cyan).
- **Translucent backgrounds get the role "Overlay / scrim"** instead of "Dark background / footer", and saturated backgrounds are "Accent background" even when their luminance is low.

### Fixed

- **Border radii no longer print in scientific notation** (#4). Computed pill radii like `3.35544e+07px` normalize to `9999px (pill)` in DESIGN.md while staying CSS-valid (`9999px`) in `--css` and `--tailwind` output. Sub-pixel radii round to 0.5px and merge. Shape language now ignores pill values, so a sharp-edged site with pill buttons reads "Sharp, geometric edges" instead of "Rounded, friendly".
- **Type scale is clustered** (#5). Sub-pixel rendering noise like `11.05px` / `12.75px` merges into the nearest 0.5px step, so seven near-identical caption sizes collapse to the real scale.

## [0.11.1] - 2026-06-04

### Fixed

- **Gallery: backticks in `DESIGN.md` values no longer leak into rendered HTML.** Component prop values and guideline lines like `` `#FFFFFF` `` now render as proper inline code instead of raw backtick characters.
- **Gallery: font names in inline CSS are now stripped of unsafe characters** before being used in `font-family` declarations. Scraped font names were previously passed through with only HTML-escaping, leaving room for CSS-side issues on weird extractions.
- **Parser: component names can contain spaces and punctuation.** Previously matched `\w+`, so headings like "Navigation Items" or "Form Inputs" would be skipped silently. Also strips backticks from component property values.
- **Parser: shared `stripCodeMarks()` helper** removes wrapping or inline backticks from extracted token values so downstream consumers (gallery, diff) get clean strings.
- **Diff: dead `tokenList()` helper removed.**
- **Diff: markdown table cells now escape pipe characters** and collapse newlines so long radius/spacing strings do not break tables.
- **Diff: synthesis section is sharper.** Generic "shared color signal" lines are gone. Replaced with role-level typography diffs ("headings font differs"), button-radius gap with concrete numbers ("4px vs 6px"), and overlap-aware spacing/radii warnings.
- **Gallery: each brand page now has the `npx brandmd <url>` command in a copyable code block** and a "view raw `DESIGN.md` on GitHub" link.

### Infrastructure

- **GitHub Pages: HTTPS enforcement enabled** for `https://yuvrajangadsingh.me/brandmd/`. Certificate state is "approved", `https_enforced` is true.

## [0.11.0] - 2026-06-03

### Added

- **Gallery at `/docs`**: 5-brand snapshot showroom (Stripe, Vercel, Linear, Anthropic, Mintlify) generated from existing `examples/` extractions. Enable GitHub Pages from the `/docs` folder to publish at `https://yuvrajangadsingh.github.io/brandmd/`. Each brand page shows color swatches, typography sample, components, layout tokens, and do/don't guidelines. Build with `node scripts/build-gallery.js`. Registry at `gallery/brands.yml`.
- **`brandmd diff <a> <b> --out BRAND_DIFF.md`**: compares two `DESIGN.md` files and writes a markdown diff. Sections: shared and unique color palette, typography table, spacing & radii table, per-component property diff, and a "what to copy / what to avoid" synthesis. Local files only in v0.11; URL input deferred to a future release.
- **`src/parse-design.js`**: shared DESIGN.md parser used by both the gallery builder and the diff command. Surfaces tokens for color, typography (primary/secondary font, by-role, scales, weights), components (props per component), layout (spacing scale, radii), and guidelines.
- Example diff committed at `examples/diff-stripe-vs-vercel.md` showing the output format.

### Why

The gallery + diff are the "visible proof strangers can link to" pieces. Output (DESIGN.md) was previously a single-file artifact you had to extract yourself before evaluating brandmd. With the gallery, anyone can scan 5 well-known brand snapshots in 30 seconds without installing anything. With diff, brandmd starts answering comparative questions ("how is my brand different from Vercel") that a one-shot extraction couldn't.

## [0.10.0] - 2026-06-01

### Changed

- **`--agent` now writes to the universal `.agents/skills/brand-style/SKILL.md` path** in addition to the existing `.claude/skills/brand-style/SKILL.md` location. The `.agents/skills/` path matches the [skills.sh](https://skills.sh) universal convention adopted by Claude Code, Cursor, Codex, Gemini CLI, Kiro CLI, and 50+ other agents. Existing `.claude/skills/` path is still written for backward compatibility with direct Claude Code users.

### Why

The Agent Skills ecosystem converged on `.agents/skills/` as the universal install path (with per-tool symlinks back to `.claude/skills/`, `.kiro/skills/`, etc). brandmd's `--agent` flag was previously single-target (Claude Code only). Now it produces output that any skills.sh-compatible agent reads natively, while keeping the legacy path so existing setups don't break.

### Migration

No action required. Existing Claude Code projects keep working because `.claude/skills/brand-style/SKILL.md` is still written. If you use any other skills.sh-compatible agent (Codex, Cursor, Gemini CLI, Kiro CLI, etc), it will now find the skill at `.agents/skills/brand-style/SKILL.md` automatically.

## [0.9.2] - 2026-05-27

### Added

- `--agent` SKILL.md now includes a `compatibility:` frontmatter field, matching the schema used by [google/skills](https://github.com/google/skills) and the broader Agent Skills ecosystem. Existing `name` + `description` fields unchanged.

### Docs

- README clarifies that brandmd's generated `SKILL.md` is schema-compatible with Anthropic Claude Code Skills and google/skills.

## [0.9.1] - 2026-05-26

### Changed

- Generator output now uses colons instead of em dashes in palette descriptions. `**White** (`#FFFFFF`): Page background` instead of `... — Page background`. Cleaner consistency across all generated DESIGN.md files.

## [0.9.0] - 2026-05-21

### Added

- **`--agent` flag**: writes `.cursor/rules/brand.mdc` and `.claude/skills/brand-style/SKILL.md` alongside `DESIGN.md`, so Claude Code and Cursor pick up the brand context automatically without any manual wiring.
  - The Cursor rule is Auto Attached on UI files (`**/*.{tsx,jsx,ts,vue,svelte,css,scss,html,astro,mdx}`)
  - The Claude Code skill is auto-discoverable by description and points at `DESIGN.md` as the source of truth
  - Wrappers reference `@DESIGN.md` rather than inlining tokens, so updates to `DESIGN.md` propagate automatically
  - Works with `-o <file>`: filename in wrappers is dynamic (`-o STYLE.md` produces wrappers that reference `STYLE.md`)

### Changed

- CI now uses npm Trusted Publishing (OIDC) instead of a long-lived `NPM_TOKEN`. No secrets to rotate.

## [0.8.0] - 2026-05-13

### Added

- **Smart Primary font derivation.** Cascades through display (hero) → heading → body → global, excluding monospace, default fallbacks (Times/Arial/Georgia), and icon fonts (Material Icons/Symbols, Font Awesome, Heroicons, etc.) from Primary candidates.
- **Quote-aware font-family parser** handles `var(--font, 'Inter')` and backslash escapes.
- **Per-role cascade** so heading/body sections are never blank.
- 45s nav timeout for slow SPAs.

### Fixed

- Tested against 100 popular design system sites: fixes 7 of 9 cases where v0.7.2 returned the wrong Primary (Menlo on mantine.dev → Outfit, Inter on valura.ai → Manrope, JetBrains Mono on remix.run → Inter Variable, etc.).

## [0.7.0] - 2026-05-10

### Added

- **Cloudflare challenge handling.** brandmd waits up to 20s for the JS challenge to auto-resolve.
- **`--cf-wait-ms <ms>` flag** to override the default 20000ms wait when sites need longer.

### Fixed

- If the Cloudflare challenge persists, you now get a clear error instead of garbage tokens.

## [0.6.0] - 2026-05-07

### Added

- **`--vision` flag.** Adds a "Visual Identity Beyond CSS" section to DESIGN.md covering illustration style, photography mood, copywriting voice, microcopy patterns. CSS can't see these. Requires a free [Gemini API key](https://aistudio.google.com/apikey).

## [0.5.0] - 2026-04-16

### Changed

- Smarter DESIGN.md output structure and token analysis.

## [0.4.0] - 2026-03-28

### Added

- **Multi-URL extraction.** Pass multiple URLs to merge brand tokens across pages.
- **Dark mode extraction** via `--dark` flag.

## [0.3.0] - 2026-03-26

### Added

- **CSS custom properties output** (`--css`)
- **Tailwind v4 `@theme` output** (`--tailwind`)
- **HTML brand guide output** (`--html`)
- CSS variable extraction from `:root` declarations.

### Fixed

- XSS sanitization and edge-case URL handling.

## [0.2.0] - 2026-03-25

### Added

- Page scroll before extraction (capture lazy-loaded styles).
- Cookie banner dismissal.
- Demo GIF in README.

## [0.1.0] - 2026-03-25

### Added

- Initial release. Extract a website's design system into a `DESIGN.md` file readable by AI coding agents.
