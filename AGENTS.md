# Repository instructions

## Product invariant

Typesetter is a non-destructive rendering layer. Never write notes, replace editor source, mutate frontmatter, or rewrite clipboard content. A missed conversion is preferable to a conversion inside code, math, TikZ, metadata, URLs, link targets, embeds, tags, block IDs, HTML, SVG, scripts, styles, or Markdown structure.

## Module boundaries

- Keep syntax and DOM knowledge in `src/live-preview/` and `src/reading-view/`.
- Keep `src/typography/` pure and independently testable.
- Define each typography behavior as a rule with deterministic replacements.
- Keep settings in the shared catalog in `src/settings-tab.ts`; retain searchable definitions and the compatibility fallback.
- Preserve independent switches for Source Mode, Live Preview, Reading View, PDF output, and every rule.

## Verification

Use the repository-pinned local Node.js toolchain. Run focused tests while editing and `npm run check` once after final changes. For rendering changes, manually check `fixtures/typography-test.md` in all four surfaces and verify the source hash is unchanged. Do not commit generated `main.js`, `node_modules`, coverage output, vault data, or temporary release notes.

## Release

Keep `package.json`, `package-lock.json`, `manifest.json`, `versions.json`, both READMEs, and `CHANGELOG.md` synchronized. Release tags contain the bare semantic version, for example `0.1.0`. GitHub Actions builds and publishes exactly `main.js`, `manifest.json`, and `styles.css`.
