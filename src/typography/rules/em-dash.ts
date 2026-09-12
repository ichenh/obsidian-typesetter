import type { TypographyRule } from "../rule";

export const emDashRule: TypographyRule = {
  id: "em-dash",
  name: "Em dash shorthand",
  enabledByDefault: true,
  priority: 100,
  isEnabled: ({ settings }) => settings.emDash,
  apply(text) {
    const replacements = [];
    for (const match of text.matchAll(/(?<!-)----(?!-)/gu)) {
      // A disabled or unsupported arrow must not fall back to a dash token.
      if (/[<>=]/u.test(text[match.index - 1] ?? "") ||
          /[<>=]/u.test(text[match.index + match[0].length] ?? "")) continue;
      replacements.push({
        from: match.index,
        to: match.index + 4,
        replacement: "—",
        ruleId: this.id,
      });
    }
    return replacements;
  },
};
