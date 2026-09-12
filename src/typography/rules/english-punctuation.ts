import {
  findMeaningfulCharacter,
  hasCjkNearbyBefore,
  isCjkCharacter,
  isDigit,
  isLatinCharacter,
  isLikelyUrlAt,
} from "../scanner";
import type { TypographyReplacement, TypographyRule } from "../rule";
import {
  allowsEnglishCorrection,
  commaForSystem,
  isCjkSystemEnabled,
  languageForCjkSystem,
  resolveCjkSystem,
  usesIdeographicSentencePunctuation,
} from "../cjk-context";

function isKnownAbbreviation(text: string, offset: number): boolean {
  const prefix = text.slice(Math.max(0, offset - 5), offset + 1).toLowerCase();
  return /(?:e\.g|i\.e)\.$/u.test(prefix);
}

export const periodCorrectionRule: TypographyRule = {
  id: "period-correction",
  name: "English and Chinese full stops",
  enabledByDefault: false,
  priority: 70,
  isEnabled: ({ settings }) => settings.periodCorrection,
  apply(text, { settings, language }) {
    const replacements: TypographyReplacement[] = [];
    for (let index = 0; index < text.length; index += 1) {
      const punctuation = text[index];
      if (![".", "。", "．", "｡"].includes(punctuation)) continue;
      if (isLikelyUrlAt(text, index)) continue;
      const previous = findMeaningfulCharacter(text, index - 1, -1);
      const next = findMeaningfulCharacter(text, index + 1, 1);

      if (punctuation !== ".") {
        if (
          previous &&
          allowsEnglishCorrection(language) &&
          isLatinCharacter(previous.character) &&
          !hasCjkNearbyBefore(text, previous.offset)
        ) {
          replacements.push({
            from: index,
            to: index + 1,
            replacement: ".",
            ruleId: this.id,
            language: "en",
          });
        } else if (previous && isCjkCharacter(previous.character)) {
          const system = resolveCjkSystem(
            text,
            previous.offset,
            index + 1,
            punctuation,
            language,
          );
          if (system && isCjkSystemEnabled(system, settings)) {
            const regionalPeriod = usesIdeographicSentencePunctuation(system)
              ? "。"
              : ".";
            if (punctuation === regionalPeriod) continue;
            replacements.push({
              from: index,
              to: index + 1,
              replacement: regionalPeriod,
              ruleId: this.id,
              language: languageForCjkSystem(system, settings),
            });
          }
        }
        continue;
      }

      const immediatePrevious = text[index - 1] ?? "";
      const immediateNext = text[index + 1] ?? "";
      if (immediatePrevious === "." || immediateNext === ".") continue;
      if (isDigit(immediatePrevious) && isDigit(immediateNext)) continue;
      if (isKnownAbbreviation(text, index)) continue;
      if (
        previous &&
        isCjkCharacter(previous.character) &&
        (!next || !isLatinCharacter(next.character))
      ) {
        const system = resolveCjkSystem(
          text,
          previous.offset,
          index + 1,
          punctuation,
          language,
        );
        if (
          !system ||
          !isCjkSystemEnabled(system, settings) ||
          !usesIdeographicSentencePunctuation(system)
        ) {
          continue;
        }
        replacements.push({
          from: index,
          to: index + 1,
          replacement: "。",
          ruleId: this.id,
          language: languageForCjkSystem(system, settings),
        });
      }
    }
    return replacements;
  },
};

export const commaCorrectionRule: TypographyRule = {
  id: "comma-correction",
  name: "English and Chinese commas",
  enabledByDefault: false,
  priority: 70,
  isEnabled: ({ settings }) => settings.commaCorrection,
  apply(text, { settings, language }) {
    const replacements: TypographyReplacement[] = [];
    for (let index = 0; index < text.length; index += 1) {
      const punctuation = text[index];
      if (![",", "，", "、", "､"].includes(punctuation)) continue;
      if (isLikelyUrlAt(text, index)) continue;
      const previous = findMeaningfulCharacter(text, index - 1, -1);
      const next = findMeaningfulCharacter(text, index + 1, 1);
      if (!previous || !next) continue;
      if (isDigit(previous.character) && isDigit(next.character)) continue;

      if (
        punctuation === "," &&
        isCjkCharacter(previous.character) &&
        isCjkCharacter(next.character)
      ) {
        const system = resolveCjkSystem(
          text,
          previous.offset,
          next.offset + 1,
          punctuation,
          language,
        );
        if (!system || !isCjkSystemEnabled(system, settings)) continue;
        const regionalComma = commaForSystem(system);
        if (regionalComma === ",") continue;
        let replacementEnd = index + 1;
        while (/\s/u.test(text[replacementEnd] ?? "")) replacementEnd += 1;
        replacements.push({
          from: index,
          to: replacementEnd,
          replacement: regionalComma,
          ruleId: this.id,
          language: languageForCjkSystem(system, settings),
        });
      } else if (
        (punctuation === "，" || punctuation === "、" || punctuation === "､") &&
        allowsEnglishCorrection(language) &&
        isLatinCharacter(previous.character) &&
        isLatinCharacter(next.character)
      ) {
        const hasFollowingWhitespace = /^\s/u.test(text.slice(index + 1));
        replacements.push({
          from: index,
          to: index + 1,
          replacement: hasFollowingWhitespace ? "," : ", ",
          ruleId: this.id,
          language: "en",
        });
      } else if (
        (punctuation === "，" || punctuation === "、" || punctuation === "､") &&
        isCjkCharacter(previous.character) &&
        isCjkCharacter(next.character)
      ) {
        const system = resolveCjkSystem(
          text,
          previous.offset,
          next.offset + 1,
          punctuation,
          language,
        );
        if (!system || !isCjkSystemEnabled(system, settings)) continue;
        const regionalComma = commaForSystem(system);
        if (regionalComma !== punctuation) {
          replacements.push({
            from: index,
            to: index + 1,
            replacement: regionalComma,
            ruleId: this.id,
            language: languageForCjkSystem(system, settings),
          });
        }
      }
    }
    return replacements;
  },
};
