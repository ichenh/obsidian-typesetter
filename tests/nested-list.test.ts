import * as language from "@codemirror/language";
import { EditorState } from "@codemirror/state";
import type { EditorView } from "@codemirror/view";
import { afterEach, describe, expect, it, vi } from "vitest";
import { buildTypographyDecorations } from "../src/live-preview/decorations";
import { isSafePlainTextRange } from "../src/live-preview/safe-range";
import { TypographyWidget } from "../src/live-preview/widget";
import { DEFAULT_SETTINGS } from "../src/settings";
import { TypographyEngine } from "../src/typography/engine";

vi.mock("@codemirror/language", async (importOriginal) => {
  const actual = await importOriginal<typeof language>();
  return { ...actual, syntaxTree: vi.fn(actual.syntaxTree) };
});

// Supply syntax trees at the editor boundary without depending on Obsidian's parser.
function listState(line: string, listName = "ListItem", contentName = "Paragraph") {
  const prefix = "- Proffession technique for drawing tangents:\n";
  const state = EditorState.create({ doc: prefix + line });
  const node = {
    name: contentName,
    parent: { name: listName, parent: { name: "Document", parent: null } },
  };
  vi.mocked(language.syntaxTree).mockReturnValue({
    resolveInner: () => node,
  } as unknown as ReturnType<typeof language.syntaxTree>);
  return state;
}

afterEach(() => vi.mocked(language.syntaxTree).mockReset());

describe("indented list typography", () => {
  it.each(["\t", "    ", "\t\t", "        "])(
    "renders both dash shorthands with indentation %j without changing source",
    (indent) => {
      const state = listState(indent + '- The "long--line" principle----example');
      const source = state.doc.toString();
      const view = {
        state, visibleRanges: [{ from: 0, to: state.doc.length }],
      } as unknown as EditorView;
      const decorations = buildTypographyDecorations(
        view, new TypographyEngine(), DEFAULT_SETTINGS,
      );
      const found: Array<{ source: string; replacement: string }> = [];
      decorations.between(0, state.doc.length, (from, to, value) => {
        const spec: unknown = value.spec;
        if (typeof spec === "object" && spec !== null && "widget" in spec &&
          spec.widget instanceof TypographyWidget) {
          found.push({ source: state.sliceDoc(from, to), replacement: spec.widget.replacement });
        }
      });
      expect(found).toEqual([
        { source: "--", replacement: "–" },
        { source: "----", replacement: "—" },
      ]);
      expect(state.doc.toString()).toBe(source);
    },
  );

  it.each(["BulletList", "OrderedList", "ListItem", "list-1", "list-2", "HyperMD-list-line-2"])(
    "accepts parsed list prose in %s",
    (name) => {
      const state = listState("\t- long--line", name);
      const from = state.doc.toString().indexOf("--");
      expect(isSafePlainTextRange(state, from, from + 2)).toBe(true);
    },
  );

  it.each(["CodeBlock", "FencedCode", "InlineCode", "Math", "HTMLTag"])(
    "keeps %s protected even inside a list",
    (name) => {
      const state = listState("        code--text", "ListItem", name);
      const from = state.doc.toString().indexOf("--");
      expect(isSafePlainTextRange(state, from, from + 2)).toBe(false);
    },
  );

  it.each([
    "\t- `code--text`", "\t- $x--y$", "\t- https://example.com/a--b",
    "\t- [label](a--b)", "\t- [[a--b]]", "\t- #tag--name", "\t----",
  ])("retains raw syntax protection in %j", (line) => {
    const state = listState(line);
    const from = state.doc.toString().indexOf("--");
    expect(isSafePlainTextRange(state, from, from + 2)).toBe(false);
  });

  it.each(["\t- long--line", "    - long--line", "    code--text"])(
    "keeps indented content protected without parsed list evidence: %j",
    (doc) => {
      const state = EditorState.create({ doc });
      const from = doc.indexOf("--");
      expect(isSafePlainTextRange(state, from, from + 2)).toBe(false);
    },
  );
});

describe("list replacement endpoint safety", () => {
  it.each([
    ["ListItem", "CodeBlock"],
    ["CodeBlock", "ListItem"],
    ["ListItem", "Paragraph"],
    ["Paragraph", "ListItem"],
  ])("rejects a range spanning %s and %s", (startName, endName) => {
    const doc = "\t- long--line";
    const state = EditorState.create({ doc });
    const from = doc.indexOf("--");
    const resolveInner = vi.fn((position: number, bias: number) => ({
      name: position === from && bias === 1 ? startName : endName,
      parent: { name: "Document", parent: null },
    }));
    vi.mocked(language.syntaxTree).mockReturnValue({
      resolveInner,
    } as unknown as ReturnType<typeof language.syntaxTree>);
    expect(isSafePlainTextRange(state, from, from + 2)).toBe(false);
    expect(resolveInner).toHaveBeenCalledWith(from, 1);
    expect(resolveInner).toHaveBeenCalledWith(from + 1, -1);
  });
});
