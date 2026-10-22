import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "../src/settings";
import { TypographyEngine } from "../src/typography/engine";

const engine = new TypographyEngine();
const context = { settings: DEFAULT_SETTINGS };
const glyphContext = {
  settings: {
    ...DEFAULT_SETTINGS,
    cjkPunctuationStyle: true,
    cjkCurlyQuoteStyle: true,
  },
};
const correctionContext = {
  settings: {
    ...DEFAULT_SETTINGS,
    periodCorrection: true,
    commaCorrection: true,
    colonCorrection: true,
    semicolonCorrection: true,
    questionMarkCorrection: true,
    exclamationMarkCorrection: true,
  },
};

describe("mixed Chinese and English punctuation", () => {
  it("keeps input-method punctuation authoritative by default", () => {
    const source = "实验使用 Obsidian。 He said “the result is correct.” 这是正确的.";
    expect(engine.render(source, context)).toBe(source);
    expect(
      engine
        .findReplacements(source, context)
        .filter((replacement) => replacement.ruleId === "cjk-punctuation-style"),
    ).toEqual([]);
  });

  it("does not treat domains or decimals as sentence punctuation", () => {
    const source = "版本 1.0 位于 example.com，误差为 3.14.";
    expect(engine.render(source, context)).toBe(source);
  });

  it("handles brackets around obvious local punctuation", () => {
    expect(engine.render("（这是正确的.)", correctionContext)).toBe("（这是正确的。)");
  });

  it("preserves quotation marks while removing CJK comma spacing", () => {
    expect(engine.render("中文, “中文”", correctionContext)).toBe("中文，“中文”");
  });

  it.each([undefined, "zh-CN", "zh-TW", "ja-JP", "ko-KR", "en-US"])(
    "preserves enumeration commas with comma correction enabled in %s",
    (language) => {
      const source = "从大气、地核､等出发 Apple、Banana､Cherry";
      const replacements = engine.findReplacements(source, { ...correctionContext, language });
      expect(replacements).toEqual([]);
      expect(engine.render(source, { ...correctionContext, language })).toBe(source);
    },
  );

  it.each(["zh-Hans", "zh-Hant", "zh-HK"] as const)(
    "gives existing and corrected Chinese commas the same %s font",
    (chinesePunctuationRegion) => {
      const settings = { ...DEFAULT_SETTINGS, commaCorrection: true, chinesePunctuationRegion };
      const source = "工匠，将一颗死星改造，从大气、地核、等出发";
      const existing = engine.findReplacements(source, { settings });
      const corrected = engine.findReplacements(source.replace(/，/gu, ","), { settings });
      expect(existing).toHaveLength(2);
      expect(existing).toEqual(corrected);
      for (const replacement of existing) {
        expect(replacement).toMatchObject({
          replacement: "，", ruleId: "comma-correction", language: chinesePunctuationRegion,
        });
        expect(source.slice(replacement.from, replacement.to)).toBe("，");
      }
      expect(engine.render(source, { settings })).toBe(source);
    },
  );

  it("keeps comma correction and general punctuation styling independent", () => {
    const source = "大气，地核、等出发";
    expect(engine.findReplacements(source, context)).toEqual([]);
    const replacements = engine.findReplacements(source, glyphContext);
    expect(replacements).toHaveLength(2);
    expect(replacements.every((item) => item.ruleId === "cjk-punctuation-style")).toBe(true);
    expect(engine.render(source, glyphContext)).toBe(source);
  });

  it.each([
    ["威廉·莎士比亚", 1],
    ["马丁·路德·金", 2],
  ] as const)("styles Chinese name separators without changing %s", (source, count) => {
    const replacements = engine.findReplacements(source, glyphContext);
    expect(replacements).toHaveLength(count);
    for (const replacement of replacements) {
      expect(replacement).toMatchObject({
        replacement: "·", ruleId: "cjk-punctuation-style", language: "zh-Hans",
        glyphWidth: "half", glyphAlign: "center",
      });
      expect(source.slice(replacement.from, replacement.to)).toBe("·");
    }
    expect(engine.render(source, glyphContext)).toBe(source);
  });

  it.each(["l·l", "a · b", "N·m", "CuSO4·5H2O"])(
    "does not infer Chinese middle-dot styling for %s", (source) => {
      expect(engine.findReplacements(source, glyphContext)).toEqual([]);
    },
  );

  it("keeps middle-dot styling behind the punctuation switch", () => {
    const source = "威廉·莎士比亚";
    expect(engine.findReplacements(source, context)).toEqual([]);
    expect(engine.findReplacements(source, {
      settings: { ...DEFAULT_SETTINGS, cjkCurlyQuoteStyle: true },
    })).toEqual([]);
  });

  it("uses explicit Chinese language to style an isolated middle dot", () => {
    expect(engine.findReplacements("·", { ...glyphContext, language: "zh-CN" })).toEqual([
      { from: 0, to: 1, replacement: "·", ruleId: "cjk-punctuation-style", language: "zh-Hans", glyphWidth: "half", glyphAlign: "center" },
    ]);
  });

  it.each(["zh-TW", "zh-HK", "zh-MO"])(
    "preserves regional fullwidth name separators for %s", (language) => {
      const source = "威廉·莎士比亚";
      const replacements = engine.findReplacements(source, { ...glyphContext, language });
      expect(replacements).toHaveLength(1);
      expect(replacements[0]).toMatchObject({
        replacement: "·", glyphWidth: "full", glyphAlign: "center",
      });
      expect(engine.render(source, { ...glyphContext, language })).toBe(source);
    },
  );

  it.each(["en-US", "ja-JP", "ko-KR"])(
    "honors explicit non-Chinese language %s for a middle dot", (language) => {
      expect(engine.findReplacements("威廉·莎士比亚", { ...glyphContext, language })).toEqual([]);
    },
  );

  it.each([
    ["？？", "half"], ["！！", "half"], ["？！", "half"],
    ["？？？", "two-thirds"], ["！！！", "two-thirds"],
  ] as const)("applies national-standard spacing to the complete run %s", (source, glyphWidth) => {
    const replacements = engine.findReplacements(source, glyphContext);
    expect(replacements).toHaveLength(source.length);
    for (const replacement of replacements) {
      expect(replacement).toMatchObject({
        ruleId: "cjk-punctuation-style", language: "zh-Hans", glyphWidth,
      });
      expect(replacement.replacement).toBe(source.slice(replacement.from, replacement.to));
    }
    expect(engine.render(source, glyphContext)).toBe(source);
  });

  it.each(["！？", "？？？？", "！！！！", "？！？", "！！？？"])(
    "does not partially compress an unspecified terminal run %s", (source) => {
      const replacements = engine.findReplacements(source, glyphContext);
      expect(replacements).toHaveLength(source.length);
      expect(replacements.every((item) => item.glyphWidth === undefined)).toBe(true);
      expect(engine.render(source, glyphContext)).toBe(source);
    },
  );

  it.each(["？？!", "?！！", "？？?"])(
    "does not compress part of a mixed-width terminal run %s", (source) => {
      const replacements = engine.findReplacements(source, glyphContext);
      expect(replacements.every((item) => item.glyphWidth === undefined)).toBe(true);
      expect(engine.render(source, glyphContext)).toBe(source);
    },
  );

  it("keeps terminal spacing behind the punctuation switch and Chinese language", () => {
    const source = "真的吗？？";
    expect(engine.findReplacements(source, context)).toEqual([]);
    expect(engine.findReplacements(source, {
      settings: { ...DEFAULT_SETTINGS, cjkCurlyQuoteStyle: true },
    })).toEqual([]);
    expect(engine.findReplacements(source, { ...glyphContext, language: "en-US" })).toEqual([]);
    const traditional = engine.findReplacements(source, { ...glyphContext, language: "zh-TW" });
    expect(traditional).toHaveLength(2);
    expect(traditional.every((item) => item.glyphWidth === undefined)).toBe(true);
  });

  it("uses deterministic three-dot and six-dot ellipsis tokens", () => {
    expect(engine.render("他说：“wait...”", context)).toBe("他说：“wait…”");
    expect(engine.render("He wrote “等等...”", context)).toBe("He wrote “等等…”");
    expect(engine.render("他说：“等等......”", context)).toBe("他说：“等等……”");
  });

  it("styles complete CJK quotes while preserving English quotes", () => {
    const source = "中文“引号” English “quote” 中文‘内引号’";
    const replacements = engine
      .findReplacements(source, glyphContext)
      .filter((replacement) => replacement.ruleId === "cjk-punctuation-style");
    expect(replacements).toHaveLength(4);
    expect(replacements.map((replacement) => source.slice(replacement.from, replacement.to))).toEqual(["“", "”", "‘", "’"]);
    expect(engine.render(source, context)).toBe(source);
  });

  it("leaves straight English quotes and apostrophes unstyled", () => {
    const replacements = engine
      .findReplacements('He said "that\'s correct."', glyphContext)
      .filter((replacement) => replacement.ruleId === "cjk-punctuation-style");
    expect(replacements).toEqual([]);
  });

  it("preserves English curly quotes in mixed input-method text", () => {
    const source = '“s” "d" 的 “的”';
    const styled = engine
      .findReplacements(source, glyphContext)
      .filter((replacement) => replacement.ruleId === "cjk-punctuation-style")
      .map((replacement) => source.slice(replacement.from, replacement.to));
    expect(styled).toEqual(["“", "”"]);
  });

  it.each([
    "He said “that’s correct.” It’s James’ book.",
    "中文“English quotation”中文",
    "中文‘English quotation’中文",
    "中文 don’t 中文",
    "中文 “123” 中文",
    "中文 “” 中文",
    "中文 “Ελληνικά” 中文",
    "中文 “Русский” 中文",
    "中文\n”\n中文",
    "中文\n“\n中文",
    "“",
    "”",
  ])("does not assign CJK glyphs to English or ambiguous quotes: %s", (source) => {
    expect(engine.findReplacements(source, glyphContext)).toEqual([]);
  });

  it.each(["English “中文” English", "English ‘中文’ English"])(
    "styles both ends of a complete CJK quotation: %s",
    (source) => {
      expect(engine.findReplacements(source, glyphContext)).toHaveLength(2);
    },
  );

  it("keeps regional punctuation and curly quote styling independently optional", () => {
    const source = "“引号”「括号」";
    const punctuationOnly = engine
      .findReplacements(source, {
        settings: { ...DEFAULT_SETTINGS, cjkPunctuationStyle: true },
        language: "zh-CN",
      })
      .map((replacement) => source.slice(replacement.from, replacement.to));
    const quotesOnly = engine
      .findReplacements(source, {
        settings: { ...DEFAULT_SETTINGS, cjkCurlyQuoteStyle: true },
        language: "zh-CN",
      })
      .map((replacement) => source.slice(replacement.from, replacement.to));
    expect(punctuationOnly).toEqual(["「", "」"]);
    expect(quotesOnly).toEqual(["“", "”"]);
  });

  it.each([
    ["zh-CN", "zh-Hans"],
    ["zh-SG", "zh-Hans"],
    ["zh-TW", "zh-Hant"],
    ["zh-HK", "zh-HK"],
    ["yue-HK", "zh-HK"],
    ["ja-JP", "ja"],
    ["ko-KR", "ko"],
  ] as const)("honors explicit language %s before local script inference", (language, expected) => {
    const replacements = engine
      .findReplacements("“Latin text”", { ...glyphContext, language })
      .filter((replacement) => replacement.ruleId === "cjk-punctuation-style");
    expect(replacements).toHaveLength(2);
    expect(replacements.every((replacement) => replacement.language === expected)).toBe(true);
  });

  it("does not apply CJK glyph shaping inside explicit non-CJK language", () => {
    const replacements = engine
      .findReplacements("“English text”", { ...glyphContext, language: "en-US" })
      .filter((replacement) => replacement.ruleId === "cjk-punctuation-style");
    expect(replacements).toEqual([]);
  });

  it.each([
    ["zh-CN", "，。．！？（）《》“”"],
    ["zh-TW", "，。．！？「」『』《》“”"],
    ["ja-JP", "、。・｡､「」『』｢｣“”"],
    ["ko-KR", "．｡､＂＇“”"],
  ] as const)("preserves representative %s input-method punctuation", (language, source) => {
    expect(engine.render(source, { ...glyphContext, language })).toBe(source);
    const replacements = engine
      .findReplacements(source, { ...glyphContext, language })
      .filter((replacement) => replacement.ruleId === "cjk-punctuation-style");
    expect(replacements).toHaveLength([...source].length);
  });

  it("marks Chinese punctuation corrected from ASCII with a Chinese language", () => {
    expect(engine.findReplacements("这是正确的.", correctionContext)).toContainEqual({
      from: 5,
      to: 6,
      replacement: "。",
      ruleId: "period-correction",
      language: "zh-Hans",
    });
  });

  it.each([
    "「臺灣標點」",
    "「香港標點」",
    "「澳門標點」",
  ])("uses explicit traditional Chinese language for punctuation in %s", (source) => {
    const replacements = engine
      .findReplacements(source, { ...glyphContext, language: "zh-TW" })
      .filter((replacement) => replacement.ruleId === "cjk-punctuation-style");
    expect(replacements.every((replacement) => replacement.language === "zh-Hant")).toBe(true);
    expect(replacements).toHaveLength(2);
    expect(engine.render(source, context)).toBe(source);
  });

  it("automatically selects Japanese punctuation and ellipsis", () => {
    expect(engine.render("これはテスト, 次です. まって...", correctionContext)).toBe(
      "これはテスト、次です。 まって…",
    );
    expect(engine.findReplacements("「日本語です」", { ...glyphContext, language: "ja-JP" })).toEqual([
      expect.objectContaining({ language: "ja", ruleId: "cjk-punctuation-style" }),
      expect.objectContaining({ language: "ja", ruleId: "cjk-punctuation-style" }),
    ]);
  });

  it("automatically selects Korean baseline punctuation", () => {
    expect(engine.render("이것은 시험입니다。 다음입니다？", correctionContext)).toBe(
      "이것은 시험입니다. 다음입니다?",
    );
  });

  it("uses explicit CJK language for opt-in full-stop and comma correction", () => {
    expect(
      engine.render("漢字． 漢字,漢字", { ...correctionContext, language: "zh-TW" }),
    ).toBe("漢字。 漢字，漢字");
    expect(
      engine.render("漢字｡ 漢字,漢字", { ...correctionContext, language: "ja-JP" }),
    ).toBe("漢字。 漢字、漢字");
    expect(
      engine.render("한글。 한글,한글", { ...correctionContext, language: "ko-KR" }),
    ).toBe("한글. 한글,한글");
  });

  it("corrects additional punctuation conservatively by region", () => {
    expect(engine.render("项目:说明；正确? 很好!", correctionContext)).toBe(
      "项目：说明；正确？ 很好！",
    );
    expect(engine.render("Time 10:30; correct？ Yes！", correctionContext)).toBe(
      "Time 10:30; correct? Yes!",
    );
  });

  it("keeps every additional punctuation rule independently optional", () => {
    expect(
      engine.render("项目:说明;正确?很好!", {
        settings: {
          ...DEFAULT_SETTINGS,
          colonCorrection: false,
          semicolonCorrection: false,
          questionMarkCorrection: false,
          exclamationMarkCorrection: false,
        },
      }),
    ).toBe("项目:说明;正确?很好!");
  });

  it("can disable regional glyph styling without changing correction switches", () => {
    const replacements = engine
      .findReplacements("中文“引号”", {
        settings: {
          ...DEFAULT_SETTINGS,
          cjkPunctuationStyle: false,
          cjkCurlyQuoteStyle: false,
        },
      })
      .filter((replacement) => replacement.ruleId === "cjk-punctuation-style");
    expect(replacements).toEqual([]);
  });

  it("keeps CJK writing systems independently optional in mixed prose", () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      traditionalChinesePunctuation: false,
      japanesePunctuation: false,
      koreanPunctuation: false,
      periodCorrection: true,
      commaCorrection: true,
      colonCorrection: true,
      semicolonCorrection: true,
      questionMarkCorrection: true,
      exclamationMarkCorrection: true,
    };
    expect(engine.render("「繁體」 これはテスト. 한국어。 简体.", { settings })).toBe(
      "「繁體」 これはテスト. 한국어。 简体。",
    );
  });
});
