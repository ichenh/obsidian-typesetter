import { EditorSelection, EditorState } from "@codemirror/state";
import type { EditorView } from "@codemirror/view";
import { describe, expect, it } from "vitest";
import {
  buildTypographyDecorations,
  intersectsSelection,
} from "../src/live-preview/decorations";
import { DEFAULT_SETTINGS } from "../src/settings";
import { TypographyEngine } from "../src/typography/engine";
import { TypographyWidget } from "../src/live-preview/widget";

function testView(state: EditorState): EditorView {
  return {
    state,
    visibleRanges: [{ from: 0, to: state.doc.length }],
  } as unknown as EditorView;
}

describe("Live Preview source reveal boundaries", () => {
  it("assigns a Chinese font only to the Chinese quotes in the reported mixed line", () => {
    const source = 'Hi, welcome to Obsidian! “欢迎光临”你好 "Welcom!"';
    const state = EditorState.create({ doc: source });
    const decorations = buildTypographyDecorations(
      testView(state), new TypographyEngine(),
      { ...DEFAULT_SETTINGS, cjkCurlyQuoteStyle: true },
    );
    const styled: Array<{ text: string; spec: unknown }> = [];
    decorations.between(0, source.length, (from, to, value) => {
      styled.push({ text: source.slice(from, to), spec: value.spec });
    });
    expect(styled.map((entry) => entry.text)).toEqual(["“", "”"]);
    for (const entry of styled) {
      expect(entry.spec).toMatchObject({ attributes: {
        "data-typography-rule": "cjk-punctuation-style", lang: "zh-Hans",
      } });
    }
    expect(state.doc.toString()).toBe(source);
  });

  it("reveals a token only while the caret is inside its source range", () => {
    expect(intersectsSelection(5, 7, [EditorSelection.cursor(5)])).toBe(true);
    expect(intersectsSelection(5, 7, [EditorSelection.cursor(6)])).toBe(true);
    expect(intersectsSelection(5, 7, [EditorSelection.cursor(7)])).toBe(false);
  });

  it("reveals a token when a non-empty selection overlaps it", () => {
    expect(intersectsSelection(5, 7, [EditorSelection.range(4, 6)])).toBe(true);
    expect(intersectsSelection(5, 7, [EditorSelection.range(7, 9)])).toBe(false);
  });

  it("replaces the complete shorthand range with one exact Unicode glyph", () => {
    const state = EditorState.create({ doc: "a--b a----b" });
    const decorations = buildTypographyDecorations(
      testView(state),
      new TypographyEngine(),
      DEFAULT_SETTINGS,
    );
    const found: Array<{ from: number; to: number; replacement: string }> = [];
    decorations.between(0, state.doc.length, (from, to, value) => {
      const spec: unknown = value.spec;
      if (
        typeof spec === "object" &&
        spec !== null &&
        "widget" in spec &&
        spec.widget instanceof TypographyWidget
      ) {
        found.push({ from, to, replacement: spec.widget.replacement });
      }
    });

    expect(found).toEqual([
      { from: 1, to: 3, replacement: "–" },
      { from: 6, to: 10, replacement: "—" },
    ]);
  });

  it("renders immediately after the caret leaves the token at its end", () => {
    const state = EditorState.create({
      doc: "a--b",
      selection: { anchor: 3 },
    });
    const decorations = buildTypographyDecorations(
      testView(state),
      new TypographyEngine(),
      DEFAULT_SETTINGS,
    );
    expect(decorations.size).toBe(1);
  });

  it("styles existing CJK punctuation while preserving selected source", () => {
    const source = "「中」";
    const state = EditorState.create({
      doc: source,
      selection: EditorSelection.range(0, source.length),
    });
    const decorations = buildTypographyDecorations(
      testView(state),
      new TypographyEngine(),
      { ...DEFAULT_SETTINGS, cjkPunctuationStyle: true, cjkCurlyQuoteStyle: true },
    );
    expect(decorations.size).toBe(2);
    expect(state.doc.toString()).toBe(source);
  });

  it("keeps Chinese commas and enumeration commas as glyph marks across caret movement", () => {
    const source = "从大气，地核、海洋、等出发";
    for (const anchor of [0, 3, 4, 6, 7, 9, 10]) {
      const state = EditorState.create({ doc: source, selection: { anchor } });
      const decorations = buildTypographyDecorations(
        testView(state), new TypographyEngine(),
        { ...DEFAULT_SETTINGS, commaCorrection: true, cjkPunctuationStyle: true, revealAtCursor: true },
      );
      const styled: Array<{ text: string; spec: unknown }> = [];
      decorations.between(0, source.length, (from, to, value) => {
        styled.push({ text: source.slice(from, to), spec: value.spec });
      });
      expect(styled.map((entry) => entry.text)).toEqual(["，", "、", "、"]);
      for (const entry of styled) {
        expect(entry.spec).toMatchObject({ class: "typesetter-glyph", attributes: { lang: "zh-Hans" } });
        expect(entry.spec).not.toHaveProperty("widget");
      }
      expect(state.doc.toString()).toBe(source);
    }
  });

  it("styles existing Chinese commas with comma correction alone without replacing enumeration commas", () => {
    const source = "从大气，地核、海洋､等出发";
    for (const anchor of [0, 3, 4, 6, 9]) {
      const state = EditorState.create({ doc: source, selection: { anchor } });
      const decorations = buildTypographyDecorations(
        testView(state), new TypographyEngine(),
        { ...DEFAULT_SETTINGS, commaCorrection: true, cjkPunctuationStyle: false, revealAtCursor: true },
      );
      const styled: Array<{ text: string; spec: unknown }> = [];
      decorations.between(0, source.length, (from, to, value) => {
        styled.push({ text: source.slice(from, to), spec: value.spec });
      });
      expect(styled).toHaveLength(1);
      expect(styled[0].text).toBe("，");
      expect(styled[0].spec).toMatchObject({
        class: "typesetter-glyph", attributes: { lang: "zh-Hans" },
      });
      expect(styled[0].spec).not.toHaveProperty("widget");
      expect(state.doc.toString()).toBe(source);
    }
  });

  it("keeps Chinese name separators halfwidth and editable across caret movement", () => {
    const source = "威廉·莎士比亚";
    for (const anchor of [0, 2, 3]) {
      const state = EditorState.create({ doc: source, selection: { anchor } });
      const decorations = buildTypographyDecorations(
        testView(state), new TypographyEngine(),
        { ...DEFAULT_SETTINGS, cjkPunctuationStyle: true },
      );
      expect(decorations.size).toBe(1);
      decorations.between(0, source.length, (from, to, value) => {
        expect(source.slice(from, to)).toBe("·");
        expect(value.spec).toMatchObject({
          class: "typesetter-glyph",
          attributes: {
            lang: "zh-Hans", "data-typography-width": "half", "data-typography-align": "center",
          },
        });
        expect(value.spec).not.toHaveProperty("widget");
      });
      expect(state.doc.toString()).toBe(source);
    }
  });

  it("keeps terminal punctuation spacing editable across caret movement", () => {
    const source = "真的吗？？是的！！！";
    for (const anchor of [0, 3, 4, 7, 9]) {
      const state = EditorState.create({ doc: source, selection: { anchor } });
      const decorations = buildTypographyDecorations(
        testView(state), new TypographyEngine(),
        { ...DEFAULT_SETTINGS, cjkPunctuationStyle: true },
      );
      const styles: unknown[] = [];
      decorations.between(0, source.length, (from, to, value) => {
        expect(to - from).toBe(1);
        expect(value.spec).not.toHaveProperty("widget");
        styles.push(value.spec);
      });
      expect(styles).toHaveLength(5);
      for (let index = 0; index < styles.length; index += 1) {
        expect(styles[index]).toMatchObject({ attributes: {
          "data-typography-width": index < 2 ? "half" : "two-thirds",
        } });
      }
      expect(state.doc.toString()).toBe(source);
    }
  });

  it("does not space punctuation inside inline code or math", () => {
    const source = "`威廉·莎士比亚？？` $威廉·莎士比亚！！！$";
    const state = EditorState.create({ doc: source });
    const decorations = buildTypographyDecorations(
      testView(state), new TypographyEngine(),
      { ...DEFAULT_SETTINGS, cjkPunctuationStyle: true },
    );
    expect(decorations.size).toBe(0);
    expect(state.doc.toString()).toBe(source);
  });

  it("does not decorate English quotes or change editor source", () => {
    const source = "He said “that’s correct.” 中文“English”中文";
    const state = EditorState.create({ doc: source });
    const decorations = buildTypographyDecorations(
      testView(state),
      new TypographyEngine(),
      { ...DEFAULT_SETTINGS, cjkPunctuationStyle: true, cjkCurlyQuoteStyle: true },
    );
    expect(decorations.size).toBe(0);
    expect(state.doc.toString()).toBe(source);
  });

  it("keeps dash and arrow replacement ranges disjoint", () => {
    const state = EditorState.create({ doc: "A--B A----B A-->B" });
    const decorations = buildTypographyDecorations(
      testView(state),
      new TypographyEngine(),
      DEFAULT_SETTINGS,
    );
    const ranges: Array<[number, number]> = [];
    decorations.between(0, state.doc.length, (from, to) => {
      ranges.push([from, to]);
    });
    expect(ranges).toEqual([
      [1, 3],
      [6, 10],
      [13, 16],
    ]);
  });
});
