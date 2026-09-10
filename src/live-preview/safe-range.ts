import { syntaxTree } from "@codemirror/language";
import type { EditorState } from "@codemirror/state";
import {
  hasListSyntaxAncestor,
  hasProtectedSyntaxAncestor,
  isUnsafeRawMarkdownRange,
} from "./markdown-safety";

interface SyntaxNodeLike {
  name: string;
  parent: SyntaxNodeLike | null;
}

function ancestorNames(node: SyntaxNodeLike): string[] {
  const names: string[] = [];
  let current: SyntaxNodeLike | null = node;
  while (current) {
    names.push(current.name);
    current = current.parent;
  }
  return names;
}

export function isSafePlainTextRange(
  state: EditorState,
  from: number,
  to: number,
): boolean {
  if (from < 0 || to > state.doc.length || from >= to) return false;
  const tree = syntaxTree(state);
  const startNode = tree.resolveInner(from, 1);
  const endNode = tree.resolveInner(Math.max(from, to - 1), -1);
  const startNames = ancestorNames(startNode);
  const endNames = ancestorNames(endNode);
  if (hasProtectedSyntaxAncestor(startNames)) return false;
  if (hasProtectedSyntaxAncestor(endNames)) return false;
  const line = state.doc.lineAt(from);
  if (to > line.to) return false;
  return !isUnsafeRawMarkdownRange(
    line.text,
    from - line.from,
    to - line.from,
    // Parsed list prose may be indented; code inside lists was rejected above.
    hasListSyntaxAncestor(startNames) && hasListSyntaxAncestor(endNames),
  );
}
