# Architecture

Typesetter is a display-only pipeline:

```text
Obsidian syntax or rendered DOM
  -> approved prose spans
  -> pure typography engine
  -> editor decorations or rendered DOM tokens
```

## Invariants

- The plugin never dispatches source-replacement transactions and never writes notes or frontmatter.
- Syntax and technical content take precedence over typography. Uncertain candidates are rejected.
- The pure engine has no knowledge of Markdown, CodeMirror, Obsidian, or the DOM.
- Rule ordering is deterministic: priority, longer span, rule order, start position, then end position. Overlapping replacements never both apply.
- Every mode and rule is independently configurable.

## Components

- `src/typography/` contains script context detection, the scanner, rule contracts, conflict resolution, and independent rules.
- `src/live-preview/` scans visible CodeMirror ranges, rejects protected syntax through the syntax tree, and creates replacement decorations. Source Mode and Live Preview share the adapter but have separate switches.
- `src/reading-view/` walks only safe rendered text nodes. It emits paired literal/rendered DOM tokens so screen and print visibility can be selected independently without changing attributes or Markdown.
- `src/settings-tab.ts` is the single settings catalog. It provides Obsidian 1.13 searchable definitions and an imperative compatibility fallback.
- `styles.css` selects literal or typeset DOM tokens for screen and print media.

## Protected content

The editor adapter combines syntax-tree ancestry, conservative node-name categories, raw-line structure, token boundaries, URL detection, and technical-context checks. The Reading View adapter excludes unsafe elements and Obsidian technical containers and never changes attributes. Both adapters prefer false negatives.

## Build and release

`npm run build` type-checks and generates the ignored `main.js` bundle. `npm run check` adds lint, automated tests, and release-metadata checks. A version tag matching `manifest.json` triggers the GitHub release workflow, which rebuilds from the tagged source and publishes `main.js`, `manifest.json`, and `styles.css`.
