# Typesetter

[![CI](https://github.com/ichenh/obsidian-typesetter/actions/workflows/ci.yml/badge.svg)](https://github.com/ichenh/obsidian-typesetter/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/ichenh/obsidian-typesetter?display_name=tag&sort=semver)](https://github.com/ichenh/obsidian-typesetter/releases)
[![License](https://img.shields.io/github/license/ichenh/obsidian-typesetter)](LICENSE)

Current release: v0.1.0

Typesetter is a non-destructive publishing typography layer that gives ordinary Markdown prose publication-quality punctuation in Source Mode, Live Preview, Reading View, and Obsidian's native PDF output. Every rendering surface is independently configurable.

> The plugin does not modify the underlying Markdown source.

## How it works

Obsidian parses Markdown first. The plugin then identifies safe visible prose and applies typography only to editor decorations or dual source/rendered DOM tokens. Source Mode stays literal by default but can opt into the same non-destructive decorations. Editor copy operations keep the source tokens, and disabling the plugin restores literal rendering.

```text
Source:
The result----although unexpected----was obtained in 2025-2026.

Rendered:
The result—although unexpected—was obtained in 2025–2026.
```

## Rules

- `--` renders as an en dash (`–`).
- `----` renders as an em dash (`—`) with longest-match precedence; `---` is deliberately not a shorthand because it is Markdown structure.
- Conservative numerical ranges such as `2025-2027` and `pp. 15-23` use an en dash.
- Every ASCII arrow token has its own option. The conservative defaults enable `->` → `→`, `<-` → `←`, `<->` → `↔`, `-->` → `⟶`, `<--` → `⟵`, and `<-->` → `⟷`.
- Potential programming or comparison operators are supported but disabled by default: `=>` → `⇒`, `<=` → `⇐`, `<=>` → `⇔`, `==>` → `⟹`, `<==` → `⟸`, and `<==>` → `⟺`. Users decide which mappings are appropriate for their prose.
- Explicit ellipsis shorthands are deterministic: `...` renders as `…`, while `......` renders as the centered Chinese ellipsis `……`. The engine does not choose an ellipsis convention from surrounding prose.
- CJK quotation marks and punctuation preserve the Unicode characters supplied by the input method. Regional punctuation and shared curly-quote glyph shaping have separate opt-in switches. Curly quote characters are styled independently of the text inside them, while straight ASCII quotes remain literal.
- Common Simplified Chinese, Traditional Chinese, Japanese, and Korean input characters are preserved, including fullwidth and halfwidth punctuation such as `．`, `｡`, `､`, `｢｣`, `＂`, and `＇`.
- Japanese kana and Korean Hangul can safely identify their writing systems locally. Unified Han text cannot reliably identify mainland China, Taiwan, Hong Kong, Macau, or Japanese usage; explicit inherited BCP 47 `lang` metadata takes precedence in rendered HTML.
- Visual full-stop, comma, colon, semicolon, question-mark, and exclamation-mark correction remains available as independently configurable advanced behavior, but is disabled by default. Input-method punctuation is authoritative by default.

Every rule can be disabled independently. Source Mode, Live Preview, Reading View, and native PDF rendering have separate switches, and source tokens are revealed at the cursor by default.

The plugin interface follows Obsidian's application language. Complete built-in UI translations are provided for English, Simplified Chinese, Traditional Chinese, Japanese, and Korean; Hong Kong and Macau locale codes use the Traditional Chinese interface, and other languages fall back safely to English.

## Rendering modes

- **Source Mode** uses CodeMirror decorations and is off by default. Enabling it never changes the editor document.
- **Live Preview** uses syntax-aware CodeMirror decorations and is on by default.
- **Reading View** selects rendered typography from DOM tokens while retaining the literal source token in the DOM.
- **PDF export** independently selects rendered typography under print media. This supports Obsidian's native print/PDF path even when Reading View typography is disabled on screen.

## Protected contexts

Frontmatter and Properties, inline and fenced code, indented code, math and MathJax, TikZ, HTML source, SVG, scripts and styles, URLs, link destinations, wikilink targets, embeds, tags, block IDs, and Markdown structural syntax are excluded. Visible prose in headings, lists, blockquotes, tables, callouts, footnotes, and link labels can still be typeset when Obsidian exposes it as safe text.

Safety is conservative: a missed conversion is preferred to modifying technical rendering. The plugin never writes note files, editor transactions, frontmatter, or clipboard content.

## Development installation

1. Use Node.js 24 and run `npm ci`.
2. Run `npm run check`.
3. Copy `main.js`, `manifest.json`, and `styles.css` into `<vault>/.obsidian/plugins/obsidian-publishing-typography/`.
4. Reload Obsidian and enable **Typesetter** under Community plugins.

The fixture at `fixtures/typography-test.md` covers the manual acceptance cases.

## Settings

The settings page contains Rendering, Dashes, Symbols, Punctuation, and Safety sections. Simplified Chinese, Traditional Chinese, Japanese, and Korean handling are independent switches rather than a mutually exclusive document region. Live Preview, Reading View, native PDF rendering, deterministic shorthand rules, and **Reveal source token at cursor** are enabled by default. Source Mode typography, regional punctuation glyph shaping, curly-quote glyph shaping, operator-like double arrows, and heuristic visual punctuation correction are disabled by default.

## Known limitations

- Source Mode rendering is optional and disabled by default so literal Markdown remains the default editing experience.
- Unicode heuristics are local and conservative. Han-only text does not contain enough information to infer mainland, Taiwan, Hong Kong, Macau, or Japanese typography; use input-method punctuation and explicit language markup where regional glyph selection matters.
- English, Simplified Chinese, and Korean can all use the same curly quote code points (`U+2018`–`U+201D`). If different input methods write the same code points, their origin cannot be recovered after insertion; explicit language metadata is the reliable override.
- PDF typography targets Obsidian's native print-media export. Third-party exporters that ignore print CSS may require a future adapter; there is no Better Export PDF-specific dependency.
- Automated tests cover the pure engine and safety policy. Final interaction behavior still requires a manual Obsidian acceptance pass because CodeMirror syntax node names and export timing are host-version dependent.

## Installing a release

Download `main.js`, `manifest.json`, and `styles.css` from the matching [GitHub release](https://github.com/ichenh/obsidian-typesetter/releases), then place them in `<vault>/.obsidian/plugins/obsidian-publishing-typography/`. The plugin has not yet been accepted into Obsidian's community plugin directory.

## Open-source project

Typesetter is a free, open-source, local-first project under the MIT License. Runtime behavior is limited to local Obsidian rendering and settings storage. See [SECURITY.md](SECURITY.md), [CONTRIBUTING.md](CONTRIBUTING.md), and [ROADMAP.md](ROADMAP.md).

Chinese documentation: [README.zh-CN.md](README.zh-CN.md).
