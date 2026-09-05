# Roadmap

[简体中文](ROADMAP.zh-CN.md)

Typesetter will remain free, open source, local first, and non-destructive. This
document records direction rather than promised dates. Safety and source preservation
take precedence over typography coverage.

## Next milestone: compatibility evidence and community submission

### Goal

Turn the 0.1.x implementation into a documented compatibility baseline suitable for
Obsidian's Community plugins directory.

### Work

- Complete hands-on acceptance on current desktop and mobile Obsidian releases.
- Record Source Mode, Live Preview, Reading View, and print/PDF behavior separately.
- Test representative default and community themes, proportional and monospace fonts,
  mixed CJK/Latin input, selections, IME composition, links, tables, and callouts.
- Build an export compatibility matrix that names each tested host or export plugin and
  whether it uses post-processed Reading View DOM and print CSS.
- Expand protected-context fixtures when Obsidian adds or renames syntax nodes.
- Complete the official community-directory review without weakening safety guarantees.

### Acceptance criteria

- The plugin ID, release tag, manifest, folder name, and documentation all use
  `typesetter` consistently.
- Desktop and mobile claims name the tested Obsidian version and platform.
- Source hashes remain unchanged across every acceptance path.
- Code, math, TikZ, metadata, URLs, link targets, embeds, tags, block IDs, HTML, SVG,
  scripts, styles, and Markdown structure remain literal.
- Export support is claimed only for paths verified to retain Typesetter's rendered DOM
  and styles.

### Non-goals

- No automatic note cleanup or source rewriting.
- No blanket promise for all third-party exporters.
- No aggressive language inference from Han characters alone.
- No paid tier, account system, telemetry, advertising, or commercial feature gate.

## Later candidates

- Opt-in diagnostics explaining why a candidate was transformed or protected.
- Dedicated adapters for widely used exporters that do not capture Obsidian's rendered
  DOM, provided they never rewrite temporary or original Markdown.
- Additional punctuation rules only after ambiguity and false-positive boundaries are
  covered by tests.
- Better local script context and explicit language metadata support.
- A theme/font visual-regression corpus for dash, arrow, ellipsis, and CJK punctuation
  alignment.
