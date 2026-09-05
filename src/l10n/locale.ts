import { moment } from "obsidian";
import { en, type TranslationKey } from "./locales/en";
import { locale as ja } from "./locales/ja";
import { locale as ko } from "./locales/ko";
import { locale as zhTw } from "./locales/zh-TW";
import { locale as zh } from "./locales/zh";
import { resolveLanguage, type SupportedLocale } from "./resolve-language";

const BUNDLES: Readonly<
  Record<SupportedLocale, Readonly<Record<TranslationKey, string>>>
> = {
  en,
  zh,
  "zh-TW": zhTw,
  ja,
  ko,
};

let activeBundle: Readonly<Record<TranslationKey, string>> = en;

export function initLocale(): void {
  activeBundle = BUNDLES[resolveLanguage(moment.locale())] ?? en;
}

export function t(key: TranslationKey, ...inserts: string[]): string {
  let text = activeBundle[key] ?? en[key] ?? key;
  for (let index = 0; index < inserts.length; index += 1) {
    text = text.replace(`%${index + 1}`, inserts[index]);
  }
  return text;
}

export { type TranslationKey } from "./locales/en";
