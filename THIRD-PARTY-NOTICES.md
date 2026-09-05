# Third-party notices

Typesetter source code is licensed under the [MIT License](LICENSE).

## Runtime host APIs

The distributed plugin uses APIs provided by Obsidian at runtime. The production build
externalizes the following host modules and does not redistribute them as part of the
plugin bundle:

- `obsidian`;
- `@codemirror/language`;
- `@codemirror/state`;
- `@codemirror/view`; and
- `@lezer/common`.

Obsidian is proprietary software and a trademark of Dynalist Inc. Typesetter is an
independent community plugin and is not affiliated with or endorsed by Dynalist Inc.
CodeMirror and Lezer are distributed by their respective maintainers under their own
licenses.

## Development dependencies

TypeScript, esbuild, ESLint, Vitest, Obsidian API type packages, and other packages
listed in `package-lock.json` are development tools. They are used to type-check,
bundle, lint, and test the project and are not shipped as separate release files.

The release workflow publishes exactly `main.js`, `manifest.json`, and `styles.css`.
It does not download code at runtime or bundle another Obsidian plugin, PDF renderer,
font, language model, telemetry library, or commercial licensing component.
