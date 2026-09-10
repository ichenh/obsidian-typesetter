# Changelog

All notable changes to Typesetter are documented in this file.

## [Unreleased]

## [0.1.3] - 2026-09-10

### Fixed

- Restored dash shorthand rendering in indented nested-list prose, including combined list and emphasis styles, while preserving code, math, links, and other protected syntax.
- Refresh editor typography when the syntax tree changes after background parsing, without requiring an additional edit or cursor movement.
- Keep dash shorthands in the surrounding text font by limiting regional CJK font overrides to glyphs with language metadata explicitly supplied by a typography rule, in both editor and Reading View/print rendering.

## [0.1.2] - 2026-09-05

### Fixed

- Replaced the ES2022-only `Array.prototype.at` call in Live Preview decoration range merging with ES2020-compatible typed indexing, eliminating unsafe-value diagnostics in Obsidian's review environment.

## [0.1.1] - 2026-09-05

### Changed

- Renamed the plugin ID, package name, internal runtime identifiers, CSS classes, and installation directory to `typesetter` to satisfy the current Obsidian manifest rules.
- Expanded the bilingual repository documentation and contribution templates to document mobile support, exporter compatibility, architecture, verification, and project policies.
- Clarified the independent output setting as print and PDF rendering rather than a built-in PDF generator.

## [0.1.0] - 2026-09-05

### Added

- Non-destructive typography rendering for Source Mode, Live Preview, Reading View, and Obsidian's native PDF output, with independent mode switches.
- Syntax-aware protection for frontmatter, Properties, code, math, TikZ, URLs, link targets, embeds, tags, block IDs, HTML source, SVG, scripts, styles, and Markdown structure.
- Independently configurable `--` en dash, `----` em dash, numerical range, deterministic English and Chinese ellipsis tokens, separate opt-in CJK punctuation and curly-quote glyph handling, opt-in visual punctuation correction, and arrow rules. Input-method punctuation is authoritative by default; explicit BCP 47 language tags take precedence, and Simplified Chinese, Traditional Chinese, Japanese, and Korean handling are not mutually exclusive.
- Cursor-sensitive source-token reveal in the editor.
- Searchable Obsidian 1.13 settings with an imperative fallback for the declared minimum app version.
- Typed, offline UI localization that follows Obsidian's language, with complete English, Simplified Chinese, Traditional Chinese, Japanese, and Korean catalogs and English fallback.
- Automated engine, safety, integration, release-consistency, lint, and build checks.
