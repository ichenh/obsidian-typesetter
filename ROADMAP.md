# Roadmap

Typesetter will remain a free, open-source, local-first Obsidian community plugin. Every future feature must preserve the rule that rendered typography never modifies Markdown source.

## Near term

- Complete hands-on acceptance testing across supported Obsidian desktop and mobile versions.
- Validate Source Mode, Live Preview, Reading View, and native PDF output with representative themes and fonts.
- Prepare the repository for submission to Obsidian's official community plugin directory.
- Expand syntax-safety fixtures when Obsidian introduces or renames Markdown syntax nodes.

## Later

- Add conservative, independently configurable punctuation rules only when false-positive behavior is well understood.
- Provide opt-in diagnostics that explain why a candidate was transformed or protected.
- Add modular adapters for third-party exporters without writing temporary Markdown files.
- Improve local CJK/Latin context detection while preserving technical notation.

Items are directional rather than promised release dates. Safety, responsiveness, and source preservation take precedence over rule coverage.
