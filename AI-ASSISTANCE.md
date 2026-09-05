# AI Assistance Disclosure

[简体中文](AI-ASSISTANCE.zh-CN.md)

This repository has used AI-assisted development tools and is currently maintained
primarily with OpenAI Codex. These tools are implementation and review aids; they do
not make product decisions or replace maintainer review.

## Scope of assistance

AI tools may be used to:

- draft or refactor TypeScript, tests, build scripts, and documentation;
- identify edge cases and propose protected-context tests;
- compare editor, DOM, settings, localization, and release paths; and
- investigate build, test, compatibility, and release-metadata failures.

Suggestions are not accepted solely because they compile, pass one test, or come from a
particular tool. Feature scope, architecture, compatibility claims, release timing, and
the repository's final contents remain human decisions.

## Responsibility and verification

The maintainer, [CHEN Hua](https://github.com/ichenh), is responsible for accepted
changes. Verification is proportional to risk and includes:

- `npm run build` for strict TypeScript and production bundling;
- `npm test` for engine, punctuation, range, adapter, and regression tests;
- `npm run lint` for repository standards;
- `npm run check:release` for package, manifest, README, and release consistency; and
- manual Obsidian testing when behavior depends on CodeMirror, IME composition,
  selection, rendered DOM, themes, mobile platforms, or export timing.

`npm run check` runs the complete automated gate used by CI. Automated checks reduce
risk but do not prove runtime or visual behavior.

## Requirements for contributors

Contributors using AI-assisted tools must:

1. understand and review every submitted change;
2. test affected behavior and add focused tests where practical;
3. disclose material AI assistance in the pull-request description;
4. verify license compatibility and provenance; and
5. never provide secrets, private vault contents, personal data, or confidential
   third-party material to an AI service.

The contributor remains the accountable author of the pull request. Unreviewed output
or material without adequate provenance may be rejected.

## License and transparency

This disclosure documents the development process. It does not change the
[MIT License](LICENSE), plugin behavior, or users' rights to use, inspect, modify, and
redistribute the software.
