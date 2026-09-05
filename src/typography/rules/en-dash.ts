import type { TypographyRule } from "../rule";

export const enDashRule: TypographyRule = {
  id: "en-dash",
  name: "En dash shorthand",
  enabledByDefault: true,
  priority: 40,
  isEnabled: ({ settings }) => settings.enDash,
  apply(text) {
    const replacements = [];
    for (const match of text.matchAll(/(?<!-)--(?!-)/gu)) {
      replacements.push({
        from: match.index,
        to: match.index + 2,
        replacement: "–",
        ruleId: this.id,
      });
    }
    return replacements;
  },
};
