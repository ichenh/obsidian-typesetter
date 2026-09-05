import type { TypographyContext } from "./context";
import type { TypographyReplacement, TypographyRule } from "./rule";
import { arrowRules } from "./rules/arrows";
import { cjkPunctuationStyleRule } from "./rules/cjk-punctuation-style";
import { ellipsisRule } from "./rules/ellipsis";
import { emDashRule } from "./rules/em-dash";
import { enDashRule } from "./rules/en-dash";
import {
  commaCorrectionRule,
  periodCorrectionRule,
} from "./rules/english-punctuation";
import { numericalRangeRule } from "./rules/ranges";
import { regionalPunctuationRules } from "./rules/regional-punctuation";

export const DEFAULT_TYPOGRAPHY_RULES: readonly TypographyRule[] = [
  ...arrowRules,
  emDashRule,
  enDashRule,
  ellipsisRule,
  numericalRangeRule,
  periodCorrectionRule,
  commaCorrectionRule,
  ...regionalPunctuationRules,
  cjkPunctuationStyleRule,
];

interface RankedReplacement {
  replacement: TypographyReplacement;
  priority: number;
  ruleOrder: number;
}

function overlaps(
  left: TypographyReplacement,
  right: TypographyReplacement,
): boolean {
  return left.from < right.to && right.from < left.to;
}

export class TypographyEngine {
  constructor(
    private readonly rules: readonly TypographyRule[] = DEFAULT_TYPOGRAPHY_RULES,
  ) {}

  findReplacements(
    text: string,
    context: TypographyContext,
  ): TypographyReplacement[] {
    const candidates: RankedReplacement[] = [];
    this.rules.forEach((rule, ruleOrder) => {
      if (!rule.isEnabled(context)) return;
      for (const replacement of rule.apply(text, context)) {
        if (
          replacement.from < 0 ||
          replacement.to > text.length ||
          replacement.from >= replacement.to
        ) {
          continue;
        }
        candidates.push({ replacement, priority: rule.priority, ruleOrder });
      }
    });

    candidates.sort((left, right) =>
      right.priority - left.priority ||
      (right.replacement.to - right.replacement.from) -
        (left.replacement.to - left.replacement.from) ||
      left.ruleOrder - right.ruleOrder ||
      left.replacement.from - right.replacement.from,
    );

    const accepted: TypographyReplacement[] = [];
    for (const candidate of candidates) {
      if (!accepted.some((existing) => overlaps(existing, candidate.replacement))) {
        accepted.push(candidate.replacement);
      }
    }
    return accepted.sort((left, right) => left.from - right.from || left.to - right.to);
  }

  render(text: string, context: TypographyContext): string {
    let rendered = text;
    const replacements = this.findReplacements(text, context);
    for (let index = replacements.length - 1; index >= 0; index -= 1) {
      const replacement = replacements[index];
      rendered =
        rendered.slice(0, replacement.from) +
        replacement.replacement +
        rendered.slice(replacement.to);
    }
    return rendered;
  }
}
