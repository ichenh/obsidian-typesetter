# Contributing to Typesetter

[简体中文](CONTRIBUTING.zh-CN.md)

Contributions should preserve Typesetter's non-destructive rendering guarantee,
Obsidian compatibility, and conservative syntax safety. Read [AGENTS.md](AGENTS.md)
before changing architecture, rules, protected-context logic, generated files, CI, or
release metadata.

Participation is governed by the [Code of Conduct](CODE_OF_CONDUCT.md). Report
vulnerabilities privately according to the [Security Policy](SECURITY.md), not through
public issues.

## Development setup

Use a Node.js version supported by `package.json`.

~~~bash
npm ci
npm run check
~~~

The complete check includes ESLint, strict TypeScript, a production bundle, Vitest,
and release-metadata validation. Use `npm ci` for a clean lockfile-reproducible
installation, as CI and release jobs do.

Do not commit generated `main.js`, `node_modules`, coverage output, local vault data,
or temporary release notes.

## Making changes

- Keep changes focused and preserve unrelated work.
- Keep Markdown/DOM knowledge in adapters and pure transformations in
  `src/typography/`.
- Give every new typography behavior a deterministic rule and an independent setting.
- Add focused engine tests for rules and adapter tests for protected contexts.
- Keep `README.md` and `README.zh-CN.md` behaviorally consistent.
- Keep all five locale bundles complete when interface text changes.
- Record notable net changes under `CHANGELOG.md` → `Unreleased`.
- Do not change version fields unless the maintainer authorizes a release.

Never add note writes, editor source replacements, frontmatter mutation, clipboard
rewriting, CodeMirror 5 APIs, or unsafe rendered-DOM mutation. A missed conversion is
preferable to a transformation inside code, math, metadata, a URL, or Markdown syntax.

## Verification

Run the complete automated path before submitting:

~~~bash
npm run check
~~~

For editor, DOM, CSS, settings, localization, or export changes, also test
`fixtures/typography-test.md` in the relevant Obsidian surfaces. Record the Obsidian
version and platform, and confirm that the fixture's file hash is unchanged.

Mobile claims require testing on the named mobile platform. Export claims must identify
the host or export plugin and whether it uses Reading View post processors and print
styles.

## Pull requests

Explain the problem, chosen behavior, safety impact, affected surfaces, and verification
performed. Call out compatibility or setting-migration effects. Do not describe
untested runtime behavior as confirmed.

If AI-assisted tools materially shaped the contribution, disclose that use and follow
[AI-ASSISTANCE.md](AI-ASSISTANCE.md). Contributors remain responsible for correctness,
license compatibility, provenance, and confidential information.
