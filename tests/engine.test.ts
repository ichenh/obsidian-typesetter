import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "../src/settings";
import {
  DEFAULT_TYPOGRAPHY_RULES,
  TypographyEngine,
} from "../src/typography/engine";
import type { TypographyContext } from "../src/typography/context";
import type { TypographyRule } from "../src/typography/rule";

const engine = new TypographyEngine();
const context: TypographyContext = { settings: DEFAULT_SETTINGS };

describe("TypographyEngine", () => {
  it("keeps every rule declaration aligned with the settings defaults", () => {
    for (const rule of DEFAULT_TYPOGRAPHY_RULES) {
      expect(rule.isEnabled(context), rule.id).toBe(rule.enabledByDefault);
    }
  });

  it.each([
    ["a--b", "a–b"],
    ["a----b", "a—b"],
    [
      "First of all, tell me a little bit about----what's your-experience--with note-taking apps like?",
      "First of all, tell me a little bit about—what's your-experience–with note-taking apps like?",
    ],
    ["wait...", "wait…"],
    ["等等...", "等等…"],
    ["等等......", "等等……"],
    ["...继续", "…继续"],
    ["2025-2027", "2025–2027"],
    ["The experiment ran in 2025-2027.", "The experiment ran in 2025–2027."],
    ["pp. 15-23", "pp. 15–23"],
    ["pages 15-23", "pages 15–23"],
    ["Sections 2-4", "Sections 2–4"],
  ])("renders %s", (source, rendered) => {
    expect(engine.render(source, context)).toBe(rendered);
  });

  it.each(["10 - 5", "-3", "E-12", "1e-6", "3.14", "file.md", "e.g.", "i.e.", "1,000"])(
    "leaves ambiguous or technical text unchanged: %s",
    (source) => {
      expect(engine.render(source, context)).toBe(source);
    },
  );

  it("preserves input punctuation by default", () => {
    const source = "This is correct。 这是正确的. 中文, English，text";
    expect(engine.render(source, context)).toBe(source);
  });

  it("supports explicit opt-in visual punctuation correction", () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      periodCorrection: true,
      commaCorrection: true,
    };
    expect(engine.render("This is correct。 这是正确的.", { settings })).toBe(
      "This is correct. 这是正确的。",
    );
  });

  it("uses longest-match precedence for em dash tokens", () => {
    const replacements = engine.findReplacements("a----b", context);
    expect(replacements).toEqual([
      { from: 1, to: 5, replacement: "—", ruleId: "em-dash" },
    ]);
  });

  it("keeps the dash rules independently configurable", () => {
    expect(
      engine.render("a--b a----b", {
        settings: { ...DEFAULT_SETTINGS, enDash: false },
      }),
    ).toBe("a--b a—b");
    expect(
      engine.render("a--b a----b", {
        settings: { ...DEFAULT_SETTINGS, emDash: false },
      }),
    ).toBe("a–b a----b");
  });

  it.each(["a---b", "a-----b", "wait...."])(
    "leaves non-MVP repeated punctuation literal: %s",
    (source) => expect(engine.render(source, context)).toBe(source),
  );

  it("resolves overlapping candidates by priority deterministically", () => {
    const low: TypographyRule = {
      id: "low",
      name: "Low",
      enabledByDefault: true,
      priority: 1,
      isEnabled: () => true,
      apply: () => [{ from: 0, to: 2, replacement: "L", ruleId: "low" }],
    };
    const high: TypographyRule = {
      id: "high",
      name: "High",
      enabledByDefault: true,
      priority: 2,
      isEnabled: () => true,
      apply: () => [{ from: 1, to: 3, replacement: "H", ruleId: "high" }],
    };
    expect(new TypographyEngine([low, high]).render("abc", context)).toBe("aH");
  });

  it("allows every rule to be disabled independently", () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      emDash: false,
      enDash: false,
      numericalRanges: false,
      rightArrow: false,
      leftArrow: false,
      bidirectionalArrow: false,
      longRightArrow: false,
      longLeftArrow: false,
      longBidirectionalArrow: false,
      rightDoubleArrow: false,
      leftDoubleArrow: false,
      bidirectionalDoubleArrow: false,
      longRightDoubleArrow: false,
      longLeftDoubleArrow: false,
      longBidirectionalDoubleArrow: false,
      ellipsis: false,
      chineseEllipsis: false,
      cjkPunctuationStyle: false,
      cjkCurlyQuoteStyle: false,
      simplifiedChinesePunctuation: false,
      traditionalChinesePunctuation: false,
      japanesePunctuation: false,
      koreanPunctuation: false,
      periodCorrection: false,
      commaCorrection: false,
      colonCorrection: false,
      semicolonCorrection: false,
      questionMarkCorrection: false,
      exclamationMarkCorrection: false,
    };
    const source = "a--b a----b 2025-2027 A->B wait... English。 中文. 项目:说明;正确?很好!";
    expect(engine.render(source, { settings })).toBe(source);
  });

  it("emits one exact Unicode dash code point per shorthand", () => {
    const rendered = engine.render("-- ----", context);
    expect([...rendered]).toEqual(["–", " ", "—"]);
    expect(rendered.codePointAt(0)).toBe(0x2013);
    expect(rendered.codePointAt(2)).toBe(0x2014);
  });
});
