# Changelog

All notable changes to brandmd are documented here. The format roughly follows [Keep a Changelog](https://keepachangelog.com/), versions follow [Semver](https://semver.org/).

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
