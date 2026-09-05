import type { SelectionRange } from "@codemirror/state";
import {
  Decoration,
  type DecorationSet,
  EditorView,
} from "@codemirror/view";
import type { TypographyEngine } from "../typography/engine";
import type { TypesetterSettings } from "../types";
import { isSafePlainTextRange } from "./safe-range";
import { TypographyWidget } from "./widget";

export function intersectsSelection(
  from: number,
  to: number,
  ranges: readonly SelectionRange[],
): boolean {
  return ranges.some((range) =>
    range.empty
      ? range.head >= from && range.head < to
      : range.from < to && from < range.to,
  );
}

function expandedVisibleRanges(view: EditorView): Array<{ from: number; to: number }> {
  const ranges: Array<{ from: number; to: number }> = [];
  for (const visible of view.visibleRanges) {
    const from = view.state.doc.lineAt(visible.from).from;
    const to = view.state.doc.lineAt(visible.to).to;
    const previous = ranges.at(-1);
    if (previous && from <= previous.to) {
      previous.to = Math.max(previous.to, to);
    } else {
      ranges.push({ from, to });
    }
  }
  return ranges;
}

export function buildTypographyDecorations(
  view: EditorView,
  engine: TypographyEngine,
  settings: Readonly<TypesetterSettings>,
): DecorationSet {
  const decorations = [];
  for (const range of expandedVisibleRanges(view)) {
    const text = view.state.doc.sliceString(range.from, range.to);
    for (const replacement of engine.findReplacements(text, { settings })) {
      const from = range.from + replacement.from;
      const to = range.from + replacement.to;
      if (!isSafePlainTextRange(view.state, from, to)) continue;
      const source = view.state.sliceDoc(from, to);
      if (source === replacement.replacement) {
        const attributes: Record<string, string> = {
          "data-typography-rule": replacement.ruleId,
        };
        if (replacement.language) attributes.lang = replacement.language;
        decorations.push(
          Decoration.mark({
          class: "typesetter-glyph",
            attributes,
          }).range(from, to),
        );
        continue;
      }
      if (
        settings.revealAtCursor &&
        intersectsSelection(from, to, view.state.selection.ranges)
      ) {
        continue;
      }
      decorations.push(
        Decoration.replace({
          widget: new TypographyWidget(
            from,
            to,
            replacement.replacement,
            source,
            replacement.ruleId,
            replacement.language,
          ),
          inclusive: false,
        }).range(from, to),
      );
    }
  }
  return Decoration.set(decorations, true);
}
