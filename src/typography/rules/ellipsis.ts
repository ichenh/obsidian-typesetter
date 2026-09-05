import { isLikelyUrlAt } from "../scanner";
import type { TypographyReplacement, TypographyRule } from "../rule";

const ELLIPSIS_RE = /(?<!\.)\.{3}(?:\.{3})?(?!\.)/gu;

export const ellipsisRule: TypographyRule = {
  id: "ellipsis",
  name: "Ellipsis",
  enabledByDefault: true,
  priority: 90,
  isEnabled: ({ settings }) => settings.ellipsis || settings.chineseEllipsis,
  apply(text, { settings }) {
    const replacements: TypographyReplacement[] = [];
    for (const match of text.matchAll(ELLIPSIS_RE)) {
      if (isLikelyUrlAt(text, match.index)) continue;
      const to = match.index + match[0].length;
      const isChineseToken = match[0].length === 6;
      if (isChineseToken && !settings.chineseEllipsis) continue;
      if (!isChineseToken && !settings.ellipsis) continue;
      replacements.push({
        from: match.index,
        to,
        replacement: isChineseToken ? "……" : "…",
        ruleId: this.id,
        language: isChineseToken ? "zh" : "en",
      });
    }
    return replacements;
  },
};
