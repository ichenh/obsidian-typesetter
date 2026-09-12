import type { BooleanSettingKey } from "../../types";
import {
  allowsEnglishCorrection,
  isCjkSystemEnabled,
  languageForCjkSystem,
  resolveCjkSystem,
  usesIdeographicSentencePunctuation,
} from "../cjk-context";
import type { TypographyReplacement, TypographyRule } from "../rule";
import {
  findMeaningfulCharacter,
  hasCjkNearbyBefore,
  isCjkCharacter,
  isDigit,
  isLatinCharacter,
  isLikelyUrlAt,
} from "../scanner";

interface RegionalPunctuationSpec {
  id: string;
  name: string;
  setting: BooleanSettingKey;
  ascii: ":" | ";" | "?" | "!";
  fullwidth: "：" | "；" | "？" | "！";
  requiresFollowingCjk: boolean;
}

function createRegionalPunctuationRule(
  spec: RegionalPunctuationSpec,
): TypographyRule {
  return {
    id: spec.id,
    name: spec.name,
    enabledByDefault: false,
    priority: 70,
    isEnabled: ({ settings }) => settings[spec.setting],
    apply(text, { settings, language }) {
      const replacements: TypographyReplacement[] = [];
      for (let index = 0; index < text.length; index += 1) {
        const punctuation = text[index];
        if (punctuation !== spec.ascii && punctuation !== spec.fullwidth) continue;
        if (isLikelyUrlAt(text, index)) continue;

        const previous = findMeaningfulCharacter(text, index - 1, -1);
        const next = findMeaningfulCharacter(text, index + 1, 1);
        if (!previous) continue;
        if (
          spec.ascii === ":" &&
          isDigit(text[index - 1] ?? "") &&
          isDigit(text[index + 1] ?? "")
        ) {
          continue;
        }

        if (punctuation === spec.fullwidth) {
          if (
            allowsEnglishCorrection(language) &&
            isLatinCharacter(previous.character) &&
            (!next || isLatinCharacter(next.character)) &&
            !hasCjkNearbyBefore(text, previous.offset)
          ) {
            replacements.push({
              from: index,
              to: index + 1,
              replacement: spec.ascii,
              ruleId: spec.id,
              language: "en",
            });
            continue;
          }
        }

        if (!isCjkCharacter(previous.character)) continue;
        if (
          spec.requiresFollowingCjk &&
          (!next || !isCjkCharacter(next.character))
        ) {
          continue;
        }
        const system = resolveCjkSystem(
          text,
          previous.offset,
          next?.offset ?? index + 1,
          punctuation,
          language,
        );
        if (!system || !isCjkSystemEnabled(system, settings)) continue;
        const regionalPunctuation = usesIdeographicSentencePunctuation(system)
          ? spec.fullwidth
          : spec.ascii;
        if (punctuation === regionalPunctuation) continue;
        replacements.push({
          from: index,
          to: index + 1,
          replacement: regionalPunctuation,
          ruleId: spec.id,
          language: languageForCjkSystem(system, settings),
        });
      }
      return replacements;
    },
  };
}

export const regionalPunctuationRules: readonly TypographyRule[] = [
  createRegionalPunctuationRule({
    id: "colon-correction",
    name: "Regional colon correction",
    setting: "colonCorrection",
    ascii: ":",
    fullwidth: "：",
    requiresFollowingCjk: true,
  }),
  createRegionalPunctuationRule({
    id: "semicolon-correction",
    name: "Regional semicolon correction",
    setting: "semicolonCorrection",
    ascii: ";",
    fullwidth: "；",
    requiresFollowingCjk: true,
  }),
  createRegionalPunctuationRule({
    id: "question-mark-correction",
    name: "Regional question mark correction",
    setting: "questionMarkCorrection",
    ascii: "?",
    fullwidth: "？",
    requiresFollowingCjk: false,
  }),
  createRegionalPunctuationRule({
    id: "exclamation-mark-correction",
    name: "Regional exclamation mark correction",
    setting: "exclamationMarkCorrection",
    ascii: "!",
    fullwidth: "！",
    requiresFollowingCjk: false,
  }),
];
