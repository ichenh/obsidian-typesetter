import { isLikelyUrlAt } from "../scanner";
import type { TypographyRule } from "../rule";

const RANGE_RE = /\b\d{1,4}-(?=\d{1,4}\b)/gu;

export const numericalRangeRule: TypographyRule = {
  id: "numerical-range",
  name: "Numerical ranges",
  enabledByDefault: true,
  priority: 80,
  isEnabled: ({ settings }) => settings.numericalRanges,
  apply(text) {
    const replacements = [];
    for (const match of text.matchAll(RANGE_RE)) {
      const hyphen = match.index + match[0].length - 1;
      const numberStart = match.index;
      const previous = text[numberStart - 1] ?? "";
      const rangeEnd = text.slice(hyphen + 1).match(/^\d{1,4}/u)?.[0] ?? "";
      const next = text[hyphen + 1 + rangeEnd.length] ?? "";
      if (/[.\p{Letter}\p{Number}]/u.test(previous)) continue;
      if (/[\p{Letter}\p{Number}]/u.test(next)) continue;
      if (next === "." && /\p{Number}/u.test(text[hyphen + 2 + rangeEnd.length] ?? "")) {
        continue;
      }
      if (isLikelyUrlAt(text, hyphen)) continue;
      replacements.push({
        from: hyphen,
        to: hyphen + 1,
        replacement: "–",
        ruleId: this.id,
      });
    }
    return replacements;
  },
};
