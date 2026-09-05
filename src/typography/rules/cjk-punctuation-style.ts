import { isCjkCharacter, isLatinCharacter } from "../scanner";
import {
  isCjkSystemEnabled,
  languageForCjkSystem,
  resolveCjkSystem,
} from "../cjk-context";
import type { TypographyReplacement, TypographyRule } from "../rule";

const ALWAYS_CJK_PUNCTUATION_RE =
  /[，．。、｡､：；！？＂＇（）［］【】《》〈〉「」『』｢｣〔〕〖〗〘〙〚〛｛｝・･〜～〝〞〟〰]/u;
const CONTEXTUAL_CJK_PUNCTUATION = new Set([
  "“", "”", "‘", "’", "…", "—", "–",
]);
const CURLY_QUOTES = new Set(["“", "”", "‘", "’"]);

type StrongScript = "cjk" | "latin";

function findStrongScript(
  text: string,
  offset: number,
  direction: -1 | 1,
  maxDistance = 24,
): StrongScript | null {
  let index = offset;
  let inspected = 0;
  while (index >= 0 && index < text.length && inspected < maxDistance) {
    const character = text[index];
    if (isCjkCharacter(character)) return "cjk";
    if (isLatinCharacter(character)) return "latin";
    index += direction;
    inspected += 1;
  }
  return null;
}

function usesCjkGlyph(text: string, index: number, punctuation: string): boolean {
  if (ALWAYS_CJK_PUNCTUATION_RE.test(punctuation)) return true;
  if (CURLY_QUOTES.has(punctuation)) return true;

  const before = findStrongScript(text, index - 1, -1);
  const after = findStrongScript(text, index + 1, 1);
  return (
    (before === "cjk" && after !== "latin") ||
    (after === "cjk" && before !== "latin")
  );
}

export const cjkPunctuationStyleRule: TypographyRule = {
  id: "cjk-punctuation-style",
  name: "Regional CJK punctuation glyph forms",
  enabledByDefault: false,
  priority: 60,
  isEnabled: ({ settings }) =>
    settings.cjkPunctuationStyle || settings.cjkCurlyQuoteStyle,
  apply(text, { settings, language }) {
    const replacements: TypographyReplacement[] = [];
    for (let index = 0; index < text.length; index += 1) {
      const punctuation = text[index];
      if (
        !ALWAYS_CJK_PUNCTUATION_RE.test(punctuation) &&
        !CONTEXTUAL_CJK_PUNCTUATION.has(punctuation)
      ) {
        continue;
      }
      const isCurlyQuote = CURLY_QUOTES.has(punctuation);
      if (isCurlyQuote && !settings.cjkCurlyQuoteStyle) continue;
      if (!isCurlyQuote && !settings.cjkPunctuationStyle) continue;
      if (!usesCjkGlyph(text, index, punctuation)) continue;
      const system = resolveCjkSystem(
        text,
        index,
        index + 1,
        punctuation,
        language,
      );
      if (!system) continue;
      if (!isCjkSystemEnabled(system, settings)) continue;
      replacements.push({
        from: index,
        to: index + 1,
        replacement: punctuation,
        ruleId: this.id,
        language: languageForCjkSystem(system, settings),
      });
    }
    return replacements;
  },
};
