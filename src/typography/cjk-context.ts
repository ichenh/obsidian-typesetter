import type {
  CjkTypographySystem,
  TypesetterSettings,
} from "../types";

const HIRAGANA_OR_KATAKANA_RE = /[\p{Script=Hiragana}\p{Script=Katakana}]/u;
const HANGUL_RE = /\p{Script=Hangul}/u;
const CONTEXT_BOUNDARY_RE =
  /[\s。．｡.!?！？；;，、､,:：()[\]{}<>《》〈〉「」『』｢｣“”‘’＂＇]/u;

export function allowsEnglishCorrection(language?: string): boolean {
  return !language?.trim() || language.trim().toLowerCase().split("-")[0] === "en";
}

export function isChineseSystem(system: CjkTypographySystem): boolean {
  return system.startsWith("zh");
}

export function detectCjkSystem(
  text: string,
  from: number,
  to: number,
  _punctuation = "",
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
  // Shared Han characters and corner quotes cannot identify a Chinese region.
  return "zh";
}

export function cjkSystemFromLanguageTag(
  language: string,
): CjkTypographySystem | null {
  const subtags = language.trim().toLowerCase().split("-");
  const primary = subtags[0];
  if (primary === "ja") return "ja";
  if (primary === "ko") return "ko";
  if (primary !== "zh" && primary !== "yue") return null;
  if (subtags.includes("hans")) return "zh-Hans";
  if (subtags.includes("hk")) return "zh-HK";
  if (subtags.includes("mo")) return "zh-MO";
  if (subtags.some((subtag) => ["hant", "tw"].includes(subtag))) return "zh-Hant";
  if (subtags.some((subtag) => ["cn", "sg", "my"].includes(subtag))) return "zh-Hans";
  if (primary === "yue") return "zh-HK";
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
  settings: Readonly<TypesetterSettings>,
): boolean {
  if (system === "ja") return settings.japanesePunctuation;
  if (system === "ko") return settings.koreanPunctuation;
  if (system === "zh-Hans") return settings.simplifiedChinesePunctuation;
  if (system === "zh-Hant" || system === "zh-HK" || system === "zh-MO") {
    return settings.traditionalChinesePunctuation;
  }
  return (
    settings.simplifiedChinesePunctuation ||
    settings.traditionalChinesePunctuation
  );
}

export function languageForCjkSystem(
  system: CjkTypographySystem,
  settings: Readonly<TypesetterSettings>,
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
    return settings.chinesePunctuationRegion === "zh-HK" ? "zh-HK" : "zh-Hant";
  }
  return settings.chinesePunctuationRegion;
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
