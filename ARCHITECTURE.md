# Architecture

[简体中文](ARCHITECTURE.zh-CN.md)

This document describes Typesetter 0.1.x runtime and trust boundaries. User-facing
behavior is documented in the README; repository invariants remain in `AGENTS.md`.

## Principles

- Markdown source is immutable from Typesetter's point of view.
- Syntax and technical content take priority over typography; uncertain text is rejected.
- Markdown/DOM knowledge stays in adapters, while the typography engine remains pure.
- Rendering surfaces and rules are independently configurable.
- Editor work is limited to visible ranges where practical.
- Disabling a surface immediately restores its literal display.

## Runtime layers

~~~text
Obsidian plugin lifecycle and settings
├── Editor adapter
│   ├── Source Mode and Live Preview detection
│   ├── visible-range scan
│   ├── CodeMirror syntax-tree safety policy
│   └── replacement or mark decorations
├── Reading View adapter
│   ├── safe DOM text-node traversal
│   ├── inherited BCP 47 language context
│   └── paired literal and typeset tokens
├── Print/PDF selector
│   └── print-media visibility for paired tokens
└── Pure typography engine
    ├── script-aware context and scanner
    ├── independent rule catalog
    ├── candidate ranges
    └── deterministic conflict resolution
~~~

`src/main.ts` owns registration, settings persistence, commands, and extension refresh.
It does not contain typography rules.

## Typography engine

`src/typography/` accepts already approved plain text and a
`TypographyContext`. Each rule returns immutable candidate ranges with its rule ID and
replacement string. The engine orders candidates by priority, longer span, rule order,
start, and end. Once a range is accepted, overlapping candidates are discarded.

This makes `----` win over `--` and prevents two visual replacements from occupying
the same source range. Same-character CJK glyph shaping is represented separately from
source-token replacement so selection does not flash or move.

The engine never sees Markdown nodes, DOM elements, editor transactions, files, or
frontmatter. It can therefore be tested independently of Obsidian.

## Editor adapter

`src/live-preview/` uses CodeMirror 6 decorations and Obsidian's syntax tree. It scans
visible ranges, expands only enough context for a rule to make a local decision, and
rejects candidates that intersect protected syntax or unsafe line structures.

Source Mode and Live Preview share the adapter but have independent settings.
Replacement decorations never alter `EditorState.doc`. When reveal-at-cursor is
enabled, a source range intersecting a selection is not replaced, making the literal
token directly editable.

## Reading View and print/PDF

`src/reading-view/` runs as an Obsidian Markdown post processor. It walks text nodes
only, skips unsafe elements and technical containers, and never edits `href`, `src`,
IDs, classes, or data attributes. Visible link labels may be typeset; link targets are
not.

When a text node changes, the adapter emits paired literal and typeset spans. Screen
and print CSS choose which member is visible, allowing Reading View and print/PDF
rendering to remain independent. Export compatibility therefore depends on the host or
exporter using Obsidian's post-processed DOM and honoring the relevant styles.

## Protected content

The editor policy combines syntax ancestry, conservative node-name categories, raw
line structure, token boundaries, URL detection, and technical-context checks. The DOM
policy excludes frontmatter/properties UI, code, math/MathJax, TikZ, HTML, SVG,
scripts, styles, embeds, tags, block IDs, and plugin technical output where safe prose
cannot be established.

Both policies prefer false negatives. A missed typographic conversion is acceptable;
rendering a source shorthand inside technical syntax is not.

## Localization and settings

`src/settings.ts` owns defaults and migration. `src/settings-tab.ts` is the shared,
searchable settings catalog and retains an imperative compatibility fallback.
`src/l10n/` provides English, Simplified Chinese, Traditional Chinese, Japanese, and
Korean UI bundles with deterministic locale fallback.

Input-method Unicode is authoritative by default. Regional punctuation and heuristic
corrections are opt-in because source code points do not preserve which input method
created them.

## Mobile boundary

The runtime imports Obsidian and CodeMirror APIs only. It does not import Node.js,
Electron, or direct file-system modules, so the manifest correctly declares
`isDesktopOnly: false`. Native or third-party export availability is a host capability;
it is separate from mobile editor and Reading View compatibility.

## Build and release

`npm run build` performs strict TypeScript checking and creates the ignored `main.js`
bundle. `npm run check` adds ESLint, Vitest, and release-metadata checks. A bare
semantic-version tag matching `manifest.json` triggers the release workflow, which
rebuilds from tagged source and publishes exactly `main.js`, `manifest.json`, and
`styles.css`.
