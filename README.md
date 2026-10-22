<h1 align="center">Typesetter for Obsidian</h1>

<p align="center"><strong>Publication-quality typography for Markdown, without changing the source.</strong></p>
<p align="center"><a href="README.zh-CN.md">简体中文</a></p>

<p align="center">
  <a href="LICENSE"><img alt="MIT License" src="https://img.shields.io/github/license/ichenh/obsidian-typesetter"></a>
  <img alt="Obsidian 1.7.2 or later" src="https://img.shields.io/badge/Obsidian-1.7.2%2B-7c3aed?logo=obsidian">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript">
  <a href="https://github.com/ichenh/obsidian-typesetter/releases"><img alt="Latest release" src="https://img.shields.io/github/v/release/ichenh/obsidian-typesetter?display_name=tag&sort=semver"></a>
  <a href="https://github.com/ichenh/obsidian-typesetter/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/ichenh/obsidian-typesetter/actions/workflows/ci.yml/badge.svg"></a>
  <a href="https://github.com/ichenh/obsidian-typesetter/actions/workflows/release.yml"><img alt="Release" src="https://github.com/ichenh/obsidian-typesetter/actions/workflows/release.yml/badge.svg"></a>
</p>

Current release: v0.1.5

Requires Obsidian **1.7.2 or later**.

Typesetter is a free, open-source, local-first Obsidian plugin for academic writing,
scientific notes, and multilingual prose. It adds a non-destructive typesetting layer
to Source Mode, Live Preview, Reading View, and print/PDF rendering. Every surface and
typography rule is independently configurable.

> **The plugin does not modify the underlying Markdown source.**

~~~text
Source:
The result----although unexpected----was obtained in 2025-2026.

Rendered:
The result—although unexpected—was obtained in 2025–2026.
~~~

## Contents

- [Features](#features)
- [Platform support](#platform-support)
- [Installation](#installation)
- [Quick start](#quick-start)
- [Typography rules](#typography-rules)
- [Protected contexts](#protected-contexts)
- [Settings](#settings)
- [How it works](#how-it-works)
- [Development](#development)
- [Release process](#release-process)
- [Known limitations](#known-limitations)
- [Project policies](#project-policies)

## Features

| Area | Behavior |
| --- | --- |
| Non-destructive rendering | Displays typeset characters while preserving the Markdown file, editor document, frontmatter, and clipboard text. |
| Four rendering controls | Source Mode, Live Preview, Reading View, and print/PDF output can be enabled separately. |
| Syntax-aware safety | CodeMirror 6 syntax information protects code, math, links, metadata, and Markdown structure. |
| Safe rendered DOM | Reading View processes visible prose text nodes without changing attributes or link targets. |
| Deterministic engine | Independent rules return ranges; conflicts use fixed priority and longest-match resolution. |
| Multilingual punctuation | Preserves input-method Unicode by default, with opt-in CJK shaping and script-aware corrections. |
| Editing-friendly display | Original tokens appear at the cursor by default; editor copy keeps source tokens. |
| Offline and local-first | No account, telemetry, advertising, remote service, or runtime download. |

## Platform support

Typesetter declares `isDesktopOnly: false` and uses Obsidian and CodeMirror web APIs,
not Node.js, Electron, or direct file-system APIs. Source Mode, Live Preview, Reading
View, settings, and commands are designed for desktop and mobile Obsidian.

Print/PDF rendering is a compatibility surface, not a PDF generator. It works when
Obsidian or an export plugin captures the post-processed Reading View DOM and honors
print CSS. Desktop Obsidian's native print/PDF path follows this model. A mobile or
third-party exporter can also work, but an exporter that reparses Markdown, skips
Obsidian post processors, or discards print CSS needs a dedicated adapter.

| Platform or workflow | Status |
| --- | --- |
| Windows, macOS, Linux | Supported architecture; verify each relevant Obsidian release. |
| Android, iOS, iPadOS | Mobile-compatible architecture for editor and Reading View rendering. |
| Obsidian native print/PDF | Supported through the independent print/PDF setting. |
| Third-party export plugins | Compatible when they use Obsidian's rendered DOM and print styles; verify per exporter. |

## Installation

### Community plugins

Typesetter is not yet listed in Obsidian's Community plugins directory. After it is
accepted, installation will be available from **Settings → Community plugins**.

### Install a release manually

1. Download `main.js`, `manifest.json`, and `styles.css` from the matching
   [GitHub release](https://github.com/ichenh/obsidian-typesetter/releases).
2. Create `<vault>/.obsidian/plugins/typesetter/`.
3. Place all three files in that directory.
4. Reload Obsidian.
5. Open **Settings → Community plugins** and enable **Typesetter**.

The folder name must match the manifest ID: `typesetter`.

### Build from source

~~~bash
git clone https://github.com/ichenh/obsidian-typesetter.git
cd obsidian-typesetter
npm ci
npm run build
~~~

Copy `main.js`, `manifest.json`, and `styles.css` to
`<vault>/.obsidian/plugins/typesetter/`, then reload Obsidian.

## Quick start

1. Enable Typesetter.
2. Leave **Live Preview**, **Reading View**, and **Print and PDF output** enabled.
3. Keep **Source Mode** disabled for literal Markdown while editing.
4. Type a shorthand such as `--`, `----`, or `...` in ordinary prose.
5. Move the cursor into a transformed token to reveal its source.
6. Disable any rule that conflicts with a vault's notation or house style.

Commands can toggle all rendering, Live Preview, or Reading View without changing note
content.

## Typography rules

### Dashes and ranges

| Source token or context | Display | Default | Notes |
| --- | --- | --- | --- |
| `--` | en dash `–` | On | Ordinary prose only. |
| `----` | em dash `—` | On | Evaluated before `--`; `---` is not a shorthand. |
| `2025-2027`, `pp. 15-23` | range with `–` | On | Conservative detection; subtraction and scientific notation stay literal. |

Markdown thematic breaks and frontmatter delimiters are structural syntax and are
never treated as dash shorthands.

Dash shorthands also work in safe prose inside nested lists, including bold or italic
list text:

~~~markdown
- Drawing tangents:
    - The "long--line" principle----extend the tangent.
~~~

Dash replacements inherit the surrounding text font. Regional CJK punctuation fonts
apply only when a punctuation rule explicitly selects them; the interface language
alone does not change the font of dash shorthands. Glyph appearance still depends on
the note's font and theme.

### Arrows

Every mapping has its own switch. Single-line arrows are enabled by default.
Operator-like double arrows are disabled because `<=` and `=>` are common in code.

| Source token | Display character | Default |
| --- | --- | --- |
| `->`, `<-`, `<->` | `→`, `←`, `↔` | On |
| `-->`, `<--`, `<-->` | `⟶`, `⟵`, `⟷` | On |
| `=>`, `<=`, `<=>` | `⇒`, `⇐`, `⇔` | Off |
| `==>`, `<==`, `<==>` | `⟹`, `⟸`, `⟺` | Off |

These are prose display rules, never source replacements. Code and formulas stay
protected even when a corresponding option is enabled.

### Ellipses

| Source token | Display character | Default |
| --- | --- | --- |
| `...` | `…` | On |
| `......` | centered Chinese ellipsis `……` | On |

The engine uses explicit tokens and does not guess an ellipsis convention from the
document's dominant language.

### CJK and Latin punctuation

Input-method Unicode is authoritative by default. Typesetter preserves Simplified
Chinese, Traditional Chinese, Japanese, and Korean punctuation, including fullwidth
and halfwidth forms such as `．`, `｡`, `､`, `｢｣`, `＂`, and `＇`.

Regional punctuation shaping and shared curly-quote shaping are separate opt-in
features. Glyph display preserves the input characters; optional punctuation corrections
and shorthand conversions have separate controls. Bold and italic formatting do not
interrupt a continuous quotation, while code, math, images, and paragraph boundaries
remain separate. Full stop, comma, colon, semicolon, question mark, and exclamation mark
corrections are independent advanced rules and default to off. This avoids overriding
the author's input method or editorial house style.

For untagged Chinese text, **Default Chinese punctuation region** selects Simplified Chinese, Traditional Chinese (Taiwan), or Traditional Chinese (Hong Kong / Macau). This selects regional fonts and punctuation spacing while preserving input characters and notes. Japanese kana and Korean Hangul remain independent of this preference.

With regional punctuation shaping enabled, the Mainland Chinese setting applies
GB/T 15834—2011 spacing: the name separator `·` occupies half a character cell;
`？？`, `！！`, and `？！` each occupy one cell in total; `？？？` and `！！！`
each occupy two. Other terminal-punctuation combinations retain their spacing.
Taiwan, Hong Kong, and Macau keep a full-cell name separator. Comma correction
preserves enumeration commas `、` and `､`, and existing Chinese commas use the
same regional font as corrected commas.

Explicit inherited BCP 47 language metadata takes precedence in rendered HTML. Hong Kong and Macau tags remain distinct and use the Hong Kong font stack rather than the Taiwan stack. The regional font must be installed for its exact glyphs to be available.
Japanese kana and Korean Hangul can identify local script, but Han characters alone
cannot distinguish mainland Chinese, Taiwan, Hong Kong, Macau, or Japanese conventions.

## Protected contexts

Typesetter always excludes:

- YAML frontmatter and Properties;
- inline, fenced, and indented code, including TikZ;
- inline and display LaTeX, MathJax output, and technical math containers;
- HTML source, SVG, `script`, and `style`;
- URLs, Markdown link destinations, wikilink targets, and embed targets;
- tags, block IDs, and Markdown structural syntax; and
- plugin-generated technical DOM where safe prose cannot be established.

Visible prose in headings, lists, blockquotes, tables, callouts, footnotes, and link
labels may still be typeset. A missed conversion is preferable to a conversion inside
technical or structural content.

## Settings

The interface follows Obsidian's language and includes English, Simplified Chinese,
Traditional Chinese, Japanese, and Korean. Hong Kong and Macau locale codes use the
Traditional Chinese interface; unsupported locales fall back to English.

Setting names describe the typographic result. Source and display characters are shown
separately in descriptions to avoid ambiguous “token to token” labels.

| Section | Controls | Defaults |
| --- | --- | --- |
| Rendering | Global rendering, Source Mode, Live Preview, Reading View, print/PDF output, reveal at cursor | Global on; Source Mode off; others on |
| Dashes | En dash shorthand, em dash shorthand, numerical ranges | On |
| Symbols | Six single-line arrows and six operator-like double arrows | Single-line on; double-line off |
| Punctuation | Two ellipses, CJK glyph and quote shaping, four CJK systems, six corrections | Ellipses and CJK systems on; shaping and corrections off |
| Safety | Read-only summary of protected contexts | Always enforced |

## How it works

~~~text
Obsidian syntax tree or rendered DOM
        ↓
approved ordinary-prose spans
        ↓
pure typography engine
        ↓
CodeMirror decorations or paired rendered-DOM tokens
~~~

The typography engine has no Markdown, DOM, or Obsidian knowledge. Adapters approve
safe text first; the engine collects candidates, resolves overlaps deterministically,
and returns display replacements.

Source Mode and Live Preview use CodeMirror 6 decorations over visible ranges. Reading
View uses an Obsidian Markdown post processor and changes visible text nodes only.
Print CSS selects the typeset half of paired DOM tokens. No path writes a note or
dispatches a source-replacement edit.

See [ARCHITECTURE.md](ARCHITECTURE.md) for implementation and trust boundaries.

## Development

Requirements: Node.js 24, npm 11, and Obsidian 1.7.2 or later for runtime testing.

~~~bash
npm ci                 # reproducible dependency installation
npm run dev            # watch build
npm run build          # strict TypeScript and production bundle
npm run lint           # ESLint
npm test               # Vitest
npm run check:release  # manifest and release metadata
npm run check          # complete local and CI gate
~~~

Use [`fixtures/typography-test.md`](fixtures/typography-test.md) for manual acceptance
and confirm its hash is unchanged. Do not commit generated `main.js`, local vault data,
`node_modules`, coverage output, or temporary release notes.

## Release process

1. Synchronize `package.json`, `package-lock.json`, `manifest.json`, `versions.json`,
   both READMEs, and `CHANGELOG.md`.
2. Run `npm run check`.
3. Create a bare semantic-version tag matching the manifest, such as `0.1.0`.
4. Push the commit and tag.
5. GitHub Actions rebuilds tagged source and publishes exactly `main.js`,
   `manifest.json`, and `styles.css`.

See [`.github/workflows/release.yml`](.github/workflows/release.yml).

## Known limitations

- Mobile-compatible architecture does not replace hands-on testing for each Obsidian
  mobile release.
- Han-only text cannot identify a regional Chinese or Japanese publishing convention.
- Different input methods may write identical curly-quote code points; explicit
  language metadata is the reliable override.
- Exporters that skip Obsidian's post-processed DOM or print CSS need an adapter.
- Host-controlled syntax-node names and export timing require manual Obsidian testing
  in addition to automated tests.

## Project policies

Typesetter is an independent community project under the [MIT License](LICENSE). It
has no paid edition, licensing service, telemetry, advertising, or commercial gate.

- [Contributing](CONTRIBUTING.md)
- [Security policy](SECURITY.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Roadmap](ROADMAP.md)
- [AI assistance disclosure](AI-ASSISTANCE.md)
- [Third-party notices](THIRD-PARTY-NOTICES.md)
