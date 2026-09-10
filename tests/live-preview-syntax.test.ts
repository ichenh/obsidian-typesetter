import { defaultHighlightStyle, StreamLanguage, syntaxTree } from "@codemirror/language";
import { EditorState, StateEffect } from "@codemirror/state";
import type { EditorView } from "@codemirror/view";
import { describe, expect, it } from "vitest";
import { buildTypographyDecorations, shouldRebuildTypographyDecorations } from "../src/live-preview/decorations";
import { DEFAULT_SETTINGS } from "../src/settings";
import { TypographyEngine } from "../src/typography/engine";

function streamLanguage(style: string) {
  const tag = defaultHighlightStyle.specs[0].tag;
  return StreamLanguage.define({
    token(stream) {
      stream.skipToEnd();
      return style;
    },
    tokenTable: {
      "list-2": tag,
      "HyperMD-list-line-2": tag,
      "inline-code": tag,
      math: tag,
    },
  });
}

function decorationCount(state: EditorState): number {
  const view = {
    state,
    visibleRanges: [{ from: 0, to: state.doc.length }],
  } as unknown as EditorView;
  return buildTypographyDecorations(view, new TypographyEngine(), DEFAULT_SETTINGS).size;
}

describe("real CodeMirror stream-token list boundaries", () => {
  it.each([
    "list-2 strong",
    "emphasis list-2",
    "quote list-2",
    "HyperMD-list-line-2 list-2",
    "HyperMD-list-line-2 list-2 strong",
  ])("renders both dashes for compound style %s", (style) => {
    const state = EditorState.create({
      doc: '- Parent\n\t- long--line----example',
      extensions: [streamLanguage(style)],
    });
    const from = state.doc.toString().indexOf("--");
    expect(syntaxTree(state).resolveInner(from, 1).name).toBe(style.replace(/ /gu, "_"));
    expect(decorationCount(state)).toBe(2);
  });

  it.each(["list-2 inline-code", "list-2 math", "list-2 strong inline-code"])(
    "retains protected content in compound style %s",
    (style) => {
      const state = EditorState.create({
        doc: '- Parent\n\t- long--line----example',
        extensions: [streamLanguage(style)],
      });
      expect(decorationCount(state)).toBe(0);
    },
  );
});

describe("syntax-only editor updates", () => {
  it.each([
    [undefined, "list-2 strong", 0, 2],
    ["list-2 strong", "list-2 inline-code", 2, 0],
  ] as const)("refreshes %s to %s without editing the document", (before, after, oldCount, newCount) => {
    const startState = EditorState.create({
      doc: "- Parent\n\t- long--line----example",
      extensions: before ? [streamLanguage(before)] : [],
    });
    // Reconfigure supplies a new tree through an effects-only transaction,
    // exercising the same update flags as a completed background parse.
    const transaction = startState.update({
      effects: StateEffect.reconfigure.of(streamLanguage(after)),
    });
    const update = {
      startState,
      state: transaction.state,
      docChanged: transaction.docChanged,
      viewportChanged: false,
      selectionSet: Boolean(transaction.selection),
    };
    expect(update.docChanged).toBe(false);
    expect(update.selectionSet).toBe(false);
    expect(shouldRebuildTypographyDecorations(update)).toBe(true);
    expect(decorationCount(startState)).toBe(oldCount);
    expect(decorationCount(transaction.state)).toBe(newCount);
    expect(transaction.state.doc).toBe(startState.doc);
  });

  it("does not rebuild for an unrelated effect with the same syntax tree", () => {
    const startState = EditorState.create({
      doc: "\t- long--line",
      extensions: [streamLanguage("list-2 strong")],
    });
    const unrelatedEffect = StateEffect.define<null>();
    const transaction = startState.update({ effects: unrelatedEffect.of(null) });
    expect(syntaxTree(startState)).toBe(syntaxTree(transaction.state));
    expect(shouldRebuildTypographyDecorations({
      startState,
      state: transaction.state,
      docChanged: transaction.docChanged,
      viewportChanged: false,
      selectionSet: Boolean(transaction.selection),
    })).toBe(false);
  });
});
