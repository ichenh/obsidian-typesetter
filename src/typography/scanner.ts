export type ScriptCategory = "latin" | "cjk" | "digit" | "other";

const LATIN_RE = /\p{Script=Latin}/u;
const CJK_RE = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u;
const DIGIT_RE = /\p{Number}/u;
const SKIPPABLE_RE =
  /[\s"'“”‘’＂＇()[\]{}（）［］｛｝<>《》〈〉「」『』｢｣【】〔〕〖〗〘〙〚〛]/u;

export function isLatinCharacter(character: string): boolean {
  return LATIN_RE.test(character);
}

export function isCjkCharacter(character: string): boolean {
  return CJK_RE.test(character);
}

export function isDigit(character: string): boolean {
  return DIGIT_RE.test(character);
}

export function scriptCategory(character: string): ScriptCategory {
  if (isLatinCharacter(character)) return "latin";
  if (isCjkCharacter(character)) return "cjk";
  if (isDigit(character)) return "digit";
  return "other";
}

export function findMeaningfulCharacter(
  text: string,
  offset: number,
  direction: -1 | 1,
  maxDistance = 16,
): { character: string; offset: number } | null {
  let index = offset;
  let inspected = 0;
  while (index >= 0 && index < text.length && inspected < maxDistance) {
    const character = text[index];
    if (!SKIPPABLE_RE.test(character)) return { character, offset: index };
    index += direction;
    inspected += 1;
  }
  return null;
}

export function hasCjkNearbyBefore(
  text: string,
  offset: number,
  maxDistance = 24,
): boolean {
  const start = Math.max(0, offset - maxDistance);
  return CJK_RE.test(text.slice(start, offset));
}

export function isLikelyUrlAt(text: string, offset: number): boolean {
  const lineStart = text.lastIndexOf("\n", offset - 1) + 1;
  const nextBreak = text.indexOf("\n", offset);
  const lineEnd = nextBreak === -1 ? text.length : nextBreak;
  const line = text.slice(lineStart, lineEnd);
  const localOffset = offset - lineStart;
  const urlPattern = /(?:https?:\/\/|www\.)[^\s<>()]+/giu;
  for (const match of line.matchAll(urlPattern)) {
    const from = match.index;
    const to = from + match[0].length;
    if (localOffset >= from && localOffset < to) return true;
  }
  return false;
}
