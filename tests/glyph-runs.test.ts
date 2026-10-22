import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "../src/settings";
import { planGlyphStyles } from "../src/reading-view/glyph-runs";
import { TypographyEngine } from "../src/typography/engine";
import type { TypographyRule } from "../src/typography/rule";

const engine = new TypographyEngine();
const settings = { ...DEFAULT_SETTINGS, cjkPunctuationStyle: true, cjkCurlyQuoteStyle: true };

describe("glyph-only rendering", () => {
  it("rejects a glyph rule that attempts to replace a source character", () => {
    const rule: TypographyRule = {
      kind: "glyph", id: "bad-glyph", name: "Bad glyph", priority: 1,
      enabledByDefault: true, isEnabled: () => true,
      apply: () => [{ from: 0, to: 1, replacement: "，", ruleId: "bad-glyph" }],
    };
    expect(new TypographyEngine([rule]).findReplacements(",", { settings })).toEqual([]);
  });

  it("does not run conversions through the glyph-only path", () => {
    const source = "中文,中文. A->B a--b 10-20 ...";
    expect(engine.findReplacements(source, { settings: {
      ...settings, commaCorrection: true, periodCorrection: true,
    } }, "glyphs")).toEqual([]);
  });

  it("styles Chinese quotes split around emphasis without joining shorthand tokens", () => {
    const segments = ["“欢迎", "光临", "”你好 ", '"Welcom!"', "-", "-"].map((text) => ({ text }));
    const styles = planGlyphStyles(segments, engine, settings);
    expect(styles.map((items) => items.length)).toEqual([1, 0, 1, 0, 0, 0]);
    expect(styles[0][0]).toMatchObject({ from: 0, to: 1, replacement: "“", language: "zh-Hans" });
    expect(styles[2][0]).toMatchObject({ from: 0, to: 1, replacement: "”", language: "zh-Hans" });
    expect(segments.map((segment) => segment.text).join("")).toBe('“欢迎光临”你好 "Welcom!"--');
  });

  it("preserves a Chinese name separator split across formatting nodes", () => {
    const segments = ["威廉", "·", "莎士比亚"].map((text) => ({ text }));
    const styles = planGlyphStyles(segments, engine, settings);
    expect(styles[0]).toEqual([]);
    expect(styles[1]).toEqual([
      { from: 0, to: 1, replacement: "·", ruleId: "cjk-punctuation-style", language: "zh-Hans", glyphWidth: "half", glyphAlign: "center" },
    ]);
    expect(styles[2]).toEqual([]);
    expect(segments.map((segment) => segment.text).join("")).toBe("威廉·莎士比亚");
  });

  it("spaces a terminal pair split across formatting nodes without changing either character", () => {
    const segments = ["真的吗", "？", "？"].map((text) => ({ text }));
    const styles = planGlyphStyles(segments, engine, settings);
    expect(styles[0]).toEqual([]);
    for (const index of [1, 2]) {
      expect(styles[index]).toEqual([
        { from: 0, to: 1, replacement: "？", ruleId: "cjk-punctuation-style", language: "zh-Hans", glyphWidth: "half" },
      ]);
    }
    expect(segments.map((segment) => segment.text).join("")).toBe("真的吗？？");
  });

  it.each(["zh-TW", "zh-HK", "ja", "ko"])("keeps %s explicit glyph styling across nodes", (language) => {
    const styles = planGlyphStyles(["“", "漢字", "”"].map((text) => ({ text, language })), engine, settings);
    expect(styles[0]).toHaveLength(1);
    expect(styles[2]).toHaveLength(1);
    expect(styles[0][0].language).toBe(styles[2][0].language);
  });

  it("preserves English quotes and apostrophes across formatting nodes", () => {
    expect(planGlyphStyles(["“Wel", "come”, don", "’t"].map((text) => ({ text })), engine, settings)).toEqual([[], [], []]);
  });

  it("does not carry inferred quote context across an explicit language change", () => {
    expect(planGlyphStyles([
      { text: "“中文" }, { text: "中文", language: "en" }, { text: "”" },
    ], engine, settings)).toEqual([[], [], []]);
  });
});
