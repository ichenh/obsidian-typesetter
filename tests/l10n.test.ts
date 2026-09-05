import { describe, expect, it } from "vitest";
import { en } from "../src/l10n/locales/en";
import { locale as ja } from "../src/l10n/locales/ja";
import { locale as ko } from "../src/l10n/locales/ko";
import { locale as zhTw } from "../src/l10n/locales/zh-TW";
import { locale as zh } from "../src/l10n/locales/zh";
import { resolveLanguage } from "../src/l10n/resolve-language";

describe("localization", () => {
  it.each([
    ["en", "en"],
    ["en-gb", "en"],
    ["zh", "zh"],
    ["zh_CN", "zh"],
    ["zh-Hans", "zh"],
    ["zh-TW", "zh-TW"],
    ["zh-HK", "zh-TW"],
    ["zh-MO", "zh-TW"],
    ["ja-JP", "ja"],
    ["ko-KR", "ko"],
    ["fr", "en"],
  ] as const)("resolves %s to %s", (input, expected) => {
    expect(resolveLanguage(input)).toBe(expected);
  });

  it.each([
    ["zh", zh],
    ["zh-TW", zhTw],
    ["ja", ja],
    ["ko", ko],
  ] as const)("keeps the %s catalog complete", (_code, bundle) => {
    expect(Object.keys(bundle).sort()).toEqual(Object.keys(en).sort());
    expect(Object.values(bundle).every((value) => value.length > 0)).toBe(true);
  });
});
