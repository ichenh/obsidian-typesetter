# Security Policy

[简体中文](SECURITY.zh-CN.md)

## Supported versions

Security fixes are provided for the latest published Typesetter version. Confirm that
an issue is reproducible on the latest release before reporting it.

## Reporting a vulnerability

Do not report vulnerabilities through public GitHub issues, discussions, or pull
requests.

Use [GitHub private vulnerability reporting](https://github.com/ichenh/obsidian-typesetter/security/advisories/new)
to send a confidential report. Include:

- the affected Typesetter and Obsidian versions;
- operating system, device class, and relevant settings;
- clear reproduction steps or a minimal proof of concept;
- expected impact and known mitigations; and
- whether the issue has been disclosed elsewhere.

Remove private vault content, credentials, tokens, and unrelated personal data. If
private reporting is unavailable, use a private contact method published on the
[maintainer's GitHub profile](https://github.com/ichenh).

The maintainer will acknowledge a complete report when practical, investigate it, and
coordinate remediation and disclosure according to severity. Allow time for a fix
before public disclosure. No bounty program is currently offered.

## Scope

Reports about Typesetter source, release artifacts, update behavior, unsafe handling of
note content, protected-context escapes, or unexpected network/file access are in
scope. A typography mistake without security impact belongs in the public issue
tracker.

Vulnerabilities in Obsidian, CodeMirror, GitHub, or another export plugin should be
reported to the respective maintainer unless Typesetter introduces the vulnerable
behavior.
