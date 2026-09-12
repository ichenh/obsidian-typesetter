import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, normalizeSettings } from "../src/settings";
import { cjkSystemFromLanguageTag } from "../src/typography/cjk-context";
import { TypographyEngine } from "../src/typography/engine";

const engine = new TypographyEngine();
const settings = { ...DEFAULT_SETTINGS, cjkPunctuationStyle: true, cjkCurlyQuoteStyle: true };

describe("regional punctuation fonts", () => {
  it.each(["zh-Hans", "zh-Hant", "zh-HK"] as const)(
    "uses %s for the explicit Chinese ellipsis token", (chinesePunctuationRegion) => {
      expect(engine.findReplacements("等等......", { settings: {
        ...settings, chinesePunctuationRegion,
      } })).toEqual([expect.objectContaining({ replacement: "……", language: chinesePunctuationRegion })]);
    },
  );

  it("does not impose a Chinese ellipsis font on explicitly non-CJK text", () => {
    const replacements = engine.findReplacements("Wait......", { settings, language: "en" });
    expect(replacements).toHaveLength(1);
    expect(replacements[0].language).toBeUndefined();
    expect(replacements[0].replacement).toBe("……");
  });

  it.each([
    ["zh-CN", "zh-Hans"], ["zh-Hans-HK", "zh-Hans"],
    ["zh-TW", "zh-Hant"], ["zh-Hant", "zh-Hant"],
    ["zh-HK", "zh-HK"], ["zh-Hant-HK", "zh-HK"], ["yue-HK", "zh-HK"],
    ["zh-MO", "zh-MO"], ["yue-MO", "zh-MO"], ["ja-JP", "ja"], ["ko-KR", "ko"],
  ])("preserves the region for %s", (language, expected) => {
    expect(cjkSystemFromLanguageTag(language)).toBe(expected);
    const source = "“漢字”、。";
    const replacements = engine.findReplacements(source, { settings, language });
    expect(replacements).toHaveLength(4);
    expect(replacements.every((item) => item.language === expected)).toBe(true);
    expect(engine.render(source, { settings, language })).toBe(source);
  });

  it.each(["zh-Hans", "zh-Hant", "zh-HK"] as const)(
    "uses the selected %s default without changing punctuation characters",
    (chinesePunctuationRegion) => {
      const source = "“歡迎光臨”「漢字」，。";
      const context = { settings: { ...settings, chinesePunctuationRegion } };
      const replacements = engine.findReplacements(source, context);
      expect(replacements).toHaveLength(6);
      expect(replacements.every((item) => item.language === chinesePunctuationRegion)).toBe(true);
      expect(engine.render(source, context)).toBe(source);
    },
  );

  it("keeps Japanese and Korean inference independent of the Chinese preference", () => {
    const context = { settings: { ...settings, chinesePunctuationRegion: "zh-HK" as const } };
    expect(engine.findReplacements("“日本語です”", context).map((item) => item.language)).toEqual(["ja", "ja"]);
    expect(engine.findReplacements("“한국어”", context).map((item) => item.language)).toEqual(["ko", "ko"]);
    expect(engine.findReplacements('“English” "English" don’t', context)).toEqual([]);
  });

  it("lets explicit Taiwan language override a Hong Kong default", () => {
    const replacements = engine.findReplacements("「漢字」", {
      settings: { ...settings, chinesePunctuationRegion: "zh-HK" }, language: "zh-TW",
    });
    expect(replacements).toHaveLength(2);
    expect(replacements.every((item) => item.language === "zh-Hant")).toBe(true);
  });

  it.each(["zh-HK", "zh-MO", "zh-TW"])("honors the traditional Chinese switch for %s", (language) => {
    expect(engine.findReplacements("“漢字”，。", {
      settings: { ...settings, traditionalChinesePunctuation: false }, language,
    })).toEqual([]);
  });

  it("persists the preference and defaults invalid or legacy values safely", () => {
    expect(normalizeSettings({ schemaVersion: 8, cjkCurlyQuoteStyle: true, chinesePunctuationRegion: "zh-HK" })).toMatchObject({
      schemaVersion: 9, cjkCurlyQuoteStyle: true, chinesePunctuationRegion: "zh-HK",
    });
    for (const value of [undefined, true, "invalid", "ja"]) {
      expect(normalizeSettings({ chinesePunctuationRegion: value }).chinesePunctuationRegion).toBe("zh-Hans");
    }
  });
});
