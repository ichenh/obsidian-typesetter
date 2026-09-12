import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "../src/settings";
import { TypographyEngine } from "../src/typography/engine";

const engine = new TypographyEngine();
const glyphSettings = {
  ...DEFAULT_SETTINGS,
  cjkPunctuationStyle: true,
  cjkCurlyQuoteStyle: true,
};
const correctionSettings = {
  ...DEFAULT_SETTINGS,
  periodCorrection: true,
  commaCorrection: true,
  colonCorrection: true,
  semicolonCorrection: true,
  questionMarkCorrection: true,
  exclamationMarkCorrection: true,
};

describe("typography input boundaries", () => {
  it("preserves the user's Chinese and English quote characters while styling only Chinese", () => {
    const source = '“欢迎光临”你好 "Welcom!"';
    expect(engine.findReplacements(source, { settings: glyphSettings })).toEqual([
      { from: 0, to: 1, replacement: "“", ruleId: "cjk-punctuation-style", language: "zh-Hans" },
      { from: 5, to: 6, replacement: "”", ruleId: "cjk-punctuation-style", language: "zh-Hans" },
    ]);
    expect(engine.render(source, { settings: glyphSettings })).toBe(source);
  });

  it.each(["“中文 English”", "“English 中文”", "“中文 Русский”", "“中文 𐐀”", "“中文", "中文”"])(
    "preserves uncertain or mixed quote pairs: %s", (source) => {
      expect(engine.findReplacements(source, { settings: glyphSettings })).toEqual([]);
    },
  );

  it("styles nested Chinese quote pairs consistently", () => {
    const source = "“外层‘内层’结束”";
    expect(engine.findReplacements(source, { settings: glyphSettings })).toHaveLength(4);
  });

  it.each(["中文，句子。！？", "中文（括号）", "「漢字」"])(
    "styles existing CJK punctuation without requiring language markup: %s",
    (source) => {
      const replacements = engine.findReplacements(source, { settings: glyphSettings });
      expect(replacements.length).toBeGreaterThan(0);
      for (const replacement of replacements) {
        expect(replacement.ruleId).toBe("cjk-punctuation-style");
        expect(replacement.replacement).toBe(source.slice(replacement.from, replacement.to));
        expect(replacement.language).toMatch(/^zh/);
      }
      expect(engine.render(source, { settings: glyphSettings })).toBe(source);
    },
  );

  it.each(["A-->B", "A<--B", "A<-->B", "A---->B", "A<----B"])(
    "does not restyle disabled or unsupported arrows as dashes: %s",
    (source) => {
      expect(engine.render(source, { settings: {
        ...DEFAULT_SETTINGS,
        longRightArrow: false,
        longLeftArrow: false,
        longBidirectionalArrow: false,
      } })).toBe(source);
    },
  );

  it.each(["中文...", "中文....", "中文......"])(
    "does not correct a dot run as a full stop when ellipsis is disabled: %s",
    (source) => {
      expect(engine.render(source, { settings: {
        ...correctionSettings,
        ellipsis: false,
        chineseEllipsis: false,
      } })).toBe(source);
    },
  );

  it.each(["中文…中文", "中文—中文", "中文–中文"])(
    "does not infer a regional font for existing punctuation: %s",
    (source) => {
      expect(engine.findReplacements(source, { settings: glyphSettings })).toEqual([]);
    },
  );

  it.each(["zh-CN", "zh-TW", "ja-JP", "ko-KR", "fr-FR"])(
    "does not override explicit %s with English punctuation correction",
    (language) => {
      const source = "Latin。Latin，text：more；text？ Yes！";
      expect(engine.render(source, { settings: correctionSettings, language })).toBe(source);
    },
  );

  it("still supports explicit English visual correction", () => {
    expect(engine.render("Latin。Latin，text：more；text？ Yes！", {
      settings: correctionSettings,
      language: "en-US",
    })).toBe("Latin.Latin, text:more;text? Yes!");
  });

  it.each(["中文,\n中文", "中文,\r\n中文", "中文\n:中文", "中文\n?", "中文,\u2028中文"])(
    "does not use another line to infer punctuation or consume its break: %s",
    (source) => {
      expect(engine.render(source, { settings: correctionSettings })).toBe(source);
    },
  );

  it.each(["2026-09-12", "09-12-2026", "123-456-7890", "-10-5", "v1-2-3"])(
    "preserves ambiguous numeric hyphens: %s",
    (source) => {
      expect(engine.render(source, { settings: DEFAULT_SETTINGS })).toBe(source);
    },
  );

  it.each([
    "Visit https://example.com/a--b today",
    "Visit https://example.com/a----b today",
    "Visit https://example.com/a->b today",
    "Visit ftp://example.com/a--b today",
    "Contact mailto:a--b@example.com today",
  ])("preserves shorthand inside a bare URL in prose: %s", (source) => {
    expect(engine.render(source, { settings: DEFAULT_SETTINGS })).toBe(source);
  });
});
