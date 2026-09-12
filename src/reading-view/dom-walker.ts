import { isExcludedElement, isExcludedTextNode } from "./exclusions";

const BLOCK_SELECTOR = "p,div,section,article,blockquote,li,dt,dd,td,th,h1,h2,h3,h4,h5,h6,pre";
const INLINE_SELECTOR = "span,strong,em,b,i,u,s,del,mark,a,small,sub,sup";

/** Formatting may split a quote into nodes; structural/protected content may not be crossed. */
export function collectSafeTextRuns(root: HTMLElement): Text[][] {
  const nodeFilter = root.ownerDocument.defaultView?.NodeFilter;
  if (!nodeFilter || isExcludedElement(root)) return [];
  const walker = root.ownerDocument.createTreeWalker(
    root, nodeFilter.SHOW_ELEMENT | nodeFilter.SHOW_TEXT,
  );
  const runs: Text[][] = [];
  let run: Text[] = [];
  let block: Element | null = null;
  const flush = () => {
    if (run.length) runs.push(run);
    run = [];
    block = null;
  };
  let current = walker.nextNode();
  while (current) {
    if (current.nodeType === 1) {
      const element = current as Element;
      if (isExcludedElement(element) || !element.matches(INLINE_SELECTOR)) flush();
    } else if (current.nodeType === 3) {
      const node = current as Text;
      if (isExcludedTextNode(node)) {
        flush();
      } else {
        const nextBlock = node.parentElement?.closest(BLOCK_SELECTOR) ?? root;
        if (block && block !== nextBlock) flush();
        block = nextBlock;
        run.push(node);
      }
    }
    current = walker.nextNode();
  }
  flush();
  return runs;
}
