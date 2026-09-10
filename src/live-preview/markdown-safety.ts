import { isLikelyUrlAt } from "../typography/scanner";

const PROTECTED_NODE_PARTS = [
  "frontmatter",
  "yaml",
  "metadata",
  "properties",
  "property",
  "code",
  "math",
  "equation",
  "latex",
  "tikz",
  "html",
  "svg",
  "script",
  "style",
  "comment",
  "url",
  "autolink",
  "linkdestination",
  "linkmark",
  "linkurl",
  "wikilinktarget",
  "internallinktarget",
  "embed",
  "hashtag",
  "blockid",
  "blockreference",
  "horizontalrule",
  "thematicbreak",
];

function normalizeNodeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z]/gu, "");
}

export function isProtectedSyntaxNodeName(name: string): boolean {
  const normalized = normalizeNodeName(name);
  return PROTECTED_NODE_PARTS.some((part) => normalized.includes(part));
}

export function hasProtectedSyntaxAncestor(names: readonly string[]): boolean {
  return names.some(isProtectedSyntaxNodeName);
}

export function hasListSyntaxAncestor(names: readonly string[]): boolean {
  return names.some((name) =>
    // StreamLanguage joins simultaneous styles (for example list-2 + strong)
    // with underscores. Check each style without merging away its boundaries.
    name.split(/[\s_]+/u).some((part) =>
      /^(?:bulletlist|orderedlist|listitem|list\d*|hypermdlistline\d*)$/u.test(
        part.toLowerCase().replace(/[^a-z0-9]/gu, ""),
      ),
    ),
  );
}

function liesInside(
  text: string,
  offset: number,
  opener: string,
  closer: string,
): { from: number; to: number } | null {
  const from = text.lastIndexOf(opener, offset);
  if (from === -1) return null;
  const earlierClose = text.lastIndexOf(closer, offset);
  if (earlierClose > from) return null;
  const close = text.indexOf(closer, offset);
  return close === -1 ? null : { from, to: close + closer.length };
}

function isEscaped(text: string, offset: number): boolean {
  let slashCount = 0;
  for (let index = offset - 1; index >= 0 && text[index] === "\\"; index -= 1) {
    slashCount += 1;
  }
  return slashCount % 2 === 1;
}

function isInsidePairedDelimiter(
  text: string,
  from: number,
  to: number,
  delimiter: string,
): boolean {
  let opener = -1;
  let index = 0;
  while (index <= text.length - delimiter.length) {
    const found = text.indexOf(delimiter, index);
    if (found === -1) return false;
    index = found + delimiter.length;
    if (isEscaped(text, found)) continue;
    const delimiterCharacter = delimiter[0];
    if (
      text[found - 1] === delimiterCharacter ||
      text[index] === delimiterCharacter
    ) {
      continue;
    }
    if (opener === -1) {
      opener = found;
    } else {
      if (from >= opener && to <= index) return true;
      opener = -1;
    }
  }
  return false;
}

export function isUnsafeRawMarkdownRange(
  text: string,
  from: number,
  to: number,
  isListText = false,
): boolean {
  if (from < 0 || to > text.length || from >= to) return true;
  if (isLikelyUrlAt(text, from)) return true;

  const lineFrom = text.lastIndexOf("\n", from - 1) + 1;
  const nextBreak = text.indexOf("\n", to);
  const lineTo = nextBreak === -1 ? text.length : nextBreak;
  const line = text.slice(lineFrom, lineTo);
  if (/^\s*-{3,}\s*$/u.test(line)) return true;
  if (!isListText && /^(?: {4}|\t)/u.test(line)) return true;
  if (isInsidePairedDelimiter(line, from, to, "`")) return true;
  if (isInsidePairedDelimiter(line, from, to, "$$")) return true;
  if (isInsidePairedDelimiter(line, from, to, "$")) return true;

  if (text.startsWith("---\n") || text.startsWith("---\r\n")) {
    const close = text.indexOf("\n---", 4);
    if (close !== -1 && from <= close + 4) return true;
  }

  const wikiLink = liesInside(text, from, "[[", "]]" );
  if (wikiLink) {
    const alias = text.indexOf("|", wikiLink.from + 2);
    if (alias === -1 || from <= alias) return true;
  }

  const markdownDestination = liesInside(text, from, "](", ")");
  if (markdownDestination) return true;

  const localTokenStart = Math.max(
    lineFrom,
    text.lastIndexOf(" ", from - 1) + 1,
    text.lastIndexOf("\t", from - 1) + 1,
  );
  const localTokenEndCandidates = [
    text.indexOf(" ", to),
    text.indexOf("\t", to),
    lineTo,
  ].filter((value) => value !== -1);
  const localTokenEnd = Math.min(...localTokenEndCandidates);
  const token = text.slice(localTokenStart, localTokenEnd);
  if (/^(?:#|\^)[^\s]+$/u.test(token)) return true;
  if (/<[^>]*$/u.test(text.slice(lineFrom, from)) && /^[^<]*>/u.test(text.slice(to, lineTo))) {
    return true;
  }
  return false;
}
