import type {
  CjkTypographySystem,
  PublishingTypographySettings,
} from "../types";

const HIRAGANA_OR_KATAKANA_RE = /[\p{Script=Hiragana}\p{Script=Katakana}]/u;
const HANGUL_RE = /\p{Script=Hangul}/u;
const TRADITIONAL_CORNER_QUOTES = new Set(["「", "」", "『", "』"]);
const CONTEXT_BOUNDARY_RE =
  /[\s。．｡.!?！？；;，、､,:：()[\]{}<>《》〈〉「」『』｢｣“”‘’＂＇]/u;

export function isChineseSystem(system: CjkTypographySystem): boolean {
  return system.startsWith("zh");
}

export function detectCjkSystem(
  text: string,
  from: number,
  to: number,
  punctuation = "",
  maxDistance = 32,
): CjkTypographySystem {
  const minimum = Math.max(0, from - maxDistance);
  const maximum = Math.min(text.length, to + maxDistance);
  let start = from;
  let end = to;
  while (start > minimum && !CONTEXT_BOUNDARY_RE.test(text[start - 1])) {
    start -= 1;
  }
  while (end < maximum && !CONTEXT_BOUNDARY_RE.test(text[end])) {
    end += 1;
  }
  let japaneseDistance = Number.POSITIVE_INFINITY;
  let koreanDistance = Number.POSITIVE_INFINITY;
  for (let index = start; index < end; index += 1) {
    const distance = index < from ? from - index : Math.max(0, index - to + 1);
    const character = text[index];
    if (HIRAGANA_OR_KATAKANA_RE.test(character)) {
      japaneseDistance = Math.min(japaneseDistance, distance);
    } else if (HANGUL_RE.test(character)) {
      koreanDistance = Math.min(koreanDistance, distance);
    }
  }
  if (japaneseDistance < koreanDistance) return "ja";
  if (koreanDistance < Number.POSITIVE_INFINITY) return "ko";
  return TRADITIONAL_CORNER_QUOTES.has(punctuation) ? "zh-Hant" : "zh";
}

export function cjkSystemFromLanguageTag(
  language: string,
): CjkTypographySystem | null {
  const subtags = language.trim().toLowerCase().split("-");
  const primary = subtags[0];
  if (primary === "ja") return "ja";
  if (primary === "ko") return "ko";
  if (primary === "yue") return "zh-Hant";
  if (primary !== "zh") return null;
  if (subtags.some((subtag) => ["hant", "tw", "hk", "mo"].includes(subtag))) {
    return "zh-Hant";
  }
  if (subtags.some((subtag) => ["hans", "cn", "sg", "my"].includes(subtag))) {
    return "zh-Hans";
  }
  return "zh";
}

export function resolveCjkSystem(
  text: string,
  from: number,
  to: number,
  punctuation = "",
  language?: string,
): CjkTypographySystem | null {
  if (language?.trim()) return cjkSystemFromLanguageTag(language);
  return detectCjkSystem(text, from, to, punctuation);
}

export function isCjkSystemEnabled(
  system: CjkTypographySystem,
  settings: Readonly<PublishingTypographySettings>,
): boolean {
  if (system === "ja") return settings.japanesePunctuation;
  if (system === "ko") return settings.koreanPunctuation;
  if (system === "zh-Hans") return settings.simplifiedChinesePunctuation;
  if (system === "zh-Hant") return settings.traditionalChinesePunctuation;
  return (
    settings.simplifiedChinesePunctuation ||
    settings.traditionalChinesePunctuation
  );
}

export function languageForCjkSystem(
  system: CjkTypographySystem,
  settings: Readonly<PublishingTypographySettings>,
): CjkTypographySystem {
  if (system !== "zh") return system;
  if (
    settings.simplifiedChinesePunctuation &&
    !settings.traditionalChinesePunctuation
  ) {
    return "zh-Hans";
  }
  if (
    settings.traditionalChinesePunctuation &&
    !settings.simplifiedChinesePunctuation
  ) {
    return "zh-Hant";
  }
  return "zh";
}

export function usesIdeographicSentencePunctuation(
  system: CjkTypographySystem,
): boolean {
  return system !== "ko";
}

export function commaForSystem(
  system: CjkTypographySystem,
): "，" | "、" | "," {
  if (system === "ja") return "、";
  return system === "ko" ? "," : "，";
}
