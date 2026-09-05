# Contributing

Thank you for helping improve Typesetter.

## Before opening a change

Search existing issues and keep each proposal focused. Safety regressions in code, math, metadata, URLs, or Markdown syntax are higher priority than missed typography conversions.

## Development

Requirements: Node.js 24 and npm 11.

```bash
npm ci
npm run check
```

Add pure-engine tests for rule behavior and safety tests for adapter changes. Use `fixtures/typography-test.md` for a final manual pass in Obsidian Source Mode, Live Preview, Reading View, and native PDF export. Confirm that the fixture remains byte-for-byte unchanged.

Do not add automatic document replacements, note writes, frontmatter mutation, clipboard rewriting, CodeMirror 5 APIs, or unprotected DOM rewriting. Preserve the layer boundary described in [ARCHITECTURE.md](ARCHITECTURE.md).

## Pull requests

Explain the user-visible behavior, safety impact, tests run, and any manual Obsidian versions exercised. Generated `main.js`, coverage output, local vaults, and release notes files must not be committed.
