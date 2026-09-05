export type SupportedLocale = "en" | "zh" | "zh-TW" | "ja" | "ko";

const ALIASES: Readonly<Record<string, SupportedLocale>> = {
  "zh-cn": "zh",
  "zh-hans": "zh",
  "zh-sg": "zh",
  "zh-tw": "zh-TW",
  "zh-hant": "zh-TW",
  "zh-hk": "zh-TW",
  "zh-mo": "zh-TW",
  "ja-jp": "ja",
  "ko-kr": "ko",
};

export function resolveLanguage(code: string): SupportedLocale {
  const normalized = code.trim().toLowerCase().replace(/_/gu, "-");
  if (!normalized) return "en";
  const alias = ALIASES[normalized];
  if (alias) return alias;
  const base = normalized.split("-")[0];
  if (base === "zh" || base === "ja" || base === "ko") return base;
  return "en";
}
