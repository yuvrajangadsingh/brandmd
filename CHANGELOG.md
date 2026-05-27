# Changelog

All notable changes to brandmd are documented here. The format roughly follows [Keep a Changelog](https://keepachangelog.com/), versions follow [Semver](https://semver.org/).

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
