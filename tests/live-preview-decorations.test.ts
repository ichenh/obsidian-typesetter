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

  it("keeps same-character regional glyph styling while selected", () => {
    const state = EditorState.create({
      doc: "“s”",
      selection: EditorSelection.range(0, 3),
    });
    const decorations = buildTypographyDecorations(
      testView(state),
      new TypographyEngine(),
      { ...DEFAULT_SETTINGS, cjkCurlyQuoteStyle: true },
    );
    const specs: unknown[] = [];
    decorations.between(0, state.doc.length, (_from, _to, value) => {
      specs.push(value.spec);
    });

    expect(specs).toEqual([
      expect.objectContaining({
      class: "typesetter-glyph",
        attributes: {
          "data-typography-rule": "cjk-punctuation-style",
          lang: "zh",
        },
      }),
      expect.objectContaining({
      class: "typesetter-glyph",
        attributes: {
          "data-typography-rule": "cjk-punctuation-style",
          lang: "zh",
        },
      }),
    ]);
    expect(
      specs.some(
        (spec) =>
          typeof spec === "object" &&
          spec !== null &&
          "widget" in spec,
      ),
    ).toBe(false);
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
