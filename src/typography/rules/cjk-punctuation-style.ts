import type { CjkTypographySystem } from "../../types";
import { isCjkCharacter } from "../scanner";
import {
  isCjkSystemEnabled,
  languageForCjkSystem,
  resolveCjkSystem,
  detectCjkSystem,
  isChineseSystem,
} from "../cjk-context";
import type { TypographyReplacement, TypographyRule } from "../rule";

const ALWAYS_CJK_PUNCTUATION_RE =
  /[，．。、｡､：；！？＂＇（）［］【】《》〈〉「」『』｢｣〔〕〖〗〘〙〚〛｛｝・･〜～〝〞〟〰]/u;
const CONTEXTUAL_CJK_PUNCTUATION = new Set([
  "“", "”", "‘", "’", "…", "—", "–", "·",
]);
const CURLY_QUOTES = new Set(["“", "”", "‘", "’"]);

function findMainlandTerminalWidths(text: string): Map<number, "half" | "two-thirds"> {
  const widths = new Map<number, "half" | "two-thirds">();
  for (const match of text.matchAll(/[!?！？]+/gu)) {
    const run = match[0];
    const width = ["？？", "！！", "？！"].includes(run)
      ? "half"
      : ["？？？", "！！！"].includes(run) ? "two-thirds" : undefined;
    if (!width) continue;
    for (let offset = 0; offset < run.length; offset += 1) {
      widths.set(match.index + offset, width);
    }
  }
  return widths;
}

function findCjkQuoteSystems(text: string): Map<number, CjkTypographySystem> {
  const systems = new Map<number, CjkTypographySystem>();
  const stack: Array<{ quote: string; from: number; cjk: number; other: number }> = [];
  let cjk = 0;
  let other = 0;
  let offset = 0;
  for (const character of text) {
    const index = offset;
    offset += character.length;
    if (/[\r\n\u2028\u2029]/u.test(character)) {
      stack.length = 0;
    } else if (character === "“" || character === "‘") {
      stack.push({ quote: character, from: index, cjk, other });
    } else if (character === "”" || character === "’") {
      const opening = stack[stack.length - 1];
      const expected = character === "”" ? "“" : "‘";
      if (!opening || opening.quote !== expected) continue;
      stack.pop();
      // Style both ends together only when the enclosed text contains CJK
      // letters and no other letters. English, mixed and uncertain quotes
      // keep their font; apostrophes never form a pair on their own.
      if (cjk > opening.cjk && other === opening.other) {
        const system = detectCjkSystem(text, opening.from + 1, index);
        systems.set(opening.from, system);
        systems.set(index, system);
      }
    } else if (isCjkCharacter(character)) {
      cjk += 1;
    } else if (/\p{Letter}/u.test(character)) {
      other += 1;
    }
  }
  return systems;
}

export const cjkPunctuationStyleRule: TypographyRule = {
  kind: "glyph",
  id: "cjk-punctuation-style",
  name: "Regional CJK punctuation glyph forms",
  enabledByDefault: false,
  priority: 60,
  isEnabled: ({ settings }) =>
    settings.cjkPunctuationStyle || settings.cjkCurlyQuoteStyle,
  apply(text, { settings, language }) {
    const replacements: TypographyReplacement[] = [];
    const quoteSystems = !language?.trim() && settings.cjkCurlyQuoteStyle
      ? findCjkQuoteSystems(text)
      : undefined;
    const terminalWidths = settings.cjkPunctuationStyle
      ? findMainlandTerminalWidths(text)
      : undefined;
    for (let index = 0; index < text.length; index += 1) {
      const punctuation = text[index];
      if (
        !ALWAYS_CJK_PUNCTUATION_RE.test(punctuation) &&
        !CONTEXTUAL_CJK_PUNCTUATION.has(punctuation)
      ) {
        continue;
      }
      // Fullwidth/CJK characters already identify a CJK punctuation form.
      // Shared glyphs need a complete CJK quote, a Chinese name or explicit language.
      const quoteSystem = quoteSystems?.get(index);
      const isMiddleDot = punctuation === "·";
      const isChineseNameSeparator = isMiddleDot &&
        /\p{Script=Han}$/u.test(text.slice(Math.max(0, index - 2), index)) &&
        /^\p{Script=Han}/u.test(text.slice(index + 1, index + 3));
      if (!language?.trim() && !ALWAYS_CJK_PUNCTUATION_RE.test(punctuation) && !quoteSystem && !isChineseNameSeparator) continue;
      const system = quoteSystem ?? resolveCjkSystem(text, index, index + 1, punctuation, language);
      if (!system || !isCjkSystemEnabled(system, settings)) continue;
      if (isMiddleDot && !isChineseSystem(system)) continue;
      const isCurlyQuote = CURLY_QUOTES.has(punctuation);
      if (isCurlyQuote && !settings.cjkCurlyQuoteStyle) continue;
      if (!isCurlyQuote && !settings.cjkPunctuationStyle) continue;
      const replacement: TypographyReplacement = {
        from: index,
        to: index + 1,
        replacement: punctuation,
        ruleId: this.id,
        language: languageForCjkSystem(system, settings),
      };
      // GB/T 15834-2011 5.1.2 and 5.1.7 specify Mainland Chinese spacing.
      if (isMiddleDot) {
        replacement.glyphWidth = replacement.language === "zh-Hans" ? "half" : "full";
        replacement.glyphAlign = "center";
      } else if (replacement.language === "zh-Hans") {
        const width = terminalWidths?.get(index);
        if (width) replacement.glyphWidth = width;
      }
      replacements.push(replacement);
    }
    return replacements;
  },
};
