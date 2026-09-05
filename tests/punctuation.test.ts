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

  it("uses deterministic three-dot and six-dot ellipsis tokens", () => {
    expect(engine.render("他说：“wait...”", context)).toBe("他说：“wait…”");
    expect(engine.render("He wrote “等等...”", context)).toBe("He wrote “等等…”");
    expect(engine.render("他说：“等等......”", context)).toBe("他说：“等等……”");
  });

  it("styles curly quote characters without inspecting their contents", () => {
    const source = "中文“引号” English “quote” 中文‘内引号’";
    const replacements = engine
      .findReplacements(source, glyphContext)
      .filter((replacement) => replacement.ruleId === "cjk-punctuation-style");
    expect(
      replacements.map((replacement) => ({
        punctuation: source.slice(replacement.from, replacement.to),
        language: replacement.language,
      })),
    ).toEqual([
      { punctuation: "“", language: "zh" },
      { punctuation: "”", language: "zh" },
      { punctuation: "“", language: "zh" },
      { punctuation: "”", language: "zh" },
      { punctuation: "‘", language: "zh" },
      { punctuation: "’", language: "zh" },
    ]);
    expect(engine.render(source, context)).toBe(source);
  });

  it("leaves straight English quotes and apostrophes unstyled", () => {
    const replacements = engine
      .findReplacements('He said "that\'s correct."', glyphContext)
      .filter((replacement) => replacement.ruleId === "cjk-punctuation-style");
    expect(replacements).toEqual([]);
  });

  it("follows quote source characters in mixed input-method text", () => {
    const source = '“s” "d" 的 “的”';
    const styled = engine
      .findReplacements(source, glyphContext)
      .filter((replacement) => replacement.ruleId === "cjk-punctuation-style")
      .map((replacement) => source.slice(replacement.from, replacement.to));
    expect(styled).toEqual(["“", "”", "“", "”"]);
  });

  it("keeps regional punctuation and curly quote styling independently optional", () => {
    const source = "“引号”「括号」";
    const punctuationOnly = engine
      .findReplacements(source, {
        settings: { ...DEFAULT_SETTINGS, cjkPunctuationStyle: true },
      })
      .map((replacement) => source.slice(replacement.from, replacement.to));
    const quotesOnly = engine
      .findReplacements(source, {
        settings: { ...DEFAULT_SETTINGS, cjkCurlyQuoteStyle: true },
      })
      .map((replacement) => source.slice(replacement.from, replacement.to));
    expect(punctuationOnly).toEqual(["「", "」"]);
    expect(quotesOnly).toEqual(["“", "”"]);
  });

  it.each([
    ["zh-CN", "zh-Hans"],
    ["zh-SG", "zh-Hans"],
    ["zh-TW", "zh-Hant"],
    ["zh-HK", "zh-Hant"],
    ["yue-HK", "zh-Hant"],
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
      language: "zh",
    });
  });

  it.each([
    "「臺灣標點」",
    "「香港標點」",
    "「澳門標點」",
  ])("recognizes traditional Chinese input punctuation in %s", (source) => {
    const replacements = engine
      .findReplacements(source, glyphContext)
      .filter((replacement) => replacement.ruleId === "cjk-punctuation-style");
    expect(replacements.every((replacement) => replacement.language === "zh-Hant")).toBe(true);
    expect(replacements).toHaveLength(2);
    expect(engine.render(source, context)).toBe(source);
  });

  it("automatically selects Japanese punctuation and ellipsis", () => {
    expect(engine.render("これはテスト, 次です. まって...", correctionContext)).toBe(
      "これはテスト、次です。 まって…",
    );
    expect(engine.findReplacements("「日本語です」", glyphContext)).toEqual([
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
