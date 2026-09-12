import type { TypesetterSettings } from "../types";
import type { TypographyEngine } from "../typography/engine";
import type { TypographyReplacement } from "../typography/rule";

export interface GlyphSegment {
  text: string;
  language?: string;
}

/** Return node-local styles from continuous prose, without joining conversion tokens. */
export function planGlyphStyles(
  segments: readonly GlyphSegment[],
  engine: TypographyEngine,
  settings: Readonly<TypesetterSettings>,
): TypographyReplacement[][] {
  const result = segments.map((): TypographyReplacement[] => []);
  let start = 0;
  while (start < segments.length) {
    const language = segments[start].language;
    let end = start + 1;
    while (end < segments.length && segments[end].language === language) end += 1;
    const text = segments.slice(start, end).map((segment) => segment.text).join("");
    const styles = engine.findReplacements(text, { settings, language }, "glyphs");
    let offset = 0;
    let styleIndex = 0;
    for (let index = start; index < end; index += 1) {
      const nextOffset = offset + segments[index].text.length;
      while (styleIndex < styles.length && styles[styleIndex].from < nextOffset) {
        const style = styles[styleIndex++];
        if (style.from >= offset && style.to <= nextOffset) {
          result[index].push({ ...style, from: style.from - offset, to: style.to - offset });
        }
      }
      offset = nextOffset;
    }
    start = end;
  }
  return result;
}
