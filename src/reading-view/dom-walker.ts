import { isExcludedTextNode } from "./exclusions";

export function collectSafeTextNodes(root: HTMLElement): Text[] {
  const ownerWindow = root.ownerDocument.defaultView;
  const NodeFilterCtor = ownerWindow?.NodeFilter;
  const TextCtor = ownerWindow?.Text;
  if (!NodeFilterCtor || !TextCtor) return [];
  const walker = root.ownerDocument.createTreeWalker(
    root,
    NodeFilterCtor.SHOW_TEXT,
    {
      acceptNode(node) {
        if (!node.instanceOf(TextCtor)) {
          return NodeFilterCtor.FILTER_REJECT;
        }
        if (!node.data.trim() || isExcludedTextNode(node)) {
          return NodeFilterCtor.FILTER_REJECT;
        }
        return NodeFilterCtor.FILTER_ACCEPT;
      },
    },
  );
  const nodes: Text[] = [];
  let current = walker.nextNode();
  while (current) {
    nodes.push(current as Text);
    current = walker.nextNode();
  }
  return nodes;
}
