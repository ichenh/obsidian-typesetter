import type { TypographyEngine } from "../typography/engine";
import type { TypesetterSettings } from "../types";
import { shouldPrepareRenderedDom } from "../rendering-modes";
import { collectSafeTextRuns } from "./dom-walker";
import { planGlyphStyles } from "./glyph-runs";

export interface ReadingViewRendererOptions {
  engine: TypographyEngine;
  getSettings(): Readonly<TypesetterSettings>;
}

interface ObsidianWindow extends Window {
  createFragment(callback?: (fragment: DocumentFragment) => void): DocumentFragment;
}

export function findInheritedLanguage(
  element: HTMLElement | null,
  boundary: HTMLElement,
): string | undefined {
  let current = element;
  while (current) {
    const language = current.getAttribute("lang");
    if (language !== null) return language.trim() || undefined;
    if (current === boundary) break;
    current = current.parentElement;
  }
  return undefined;
}

export class ReadingViewRenderer {
  private readonly tokenSources = new WeakMap<HTMLElement, string>();
  private readonly tokens = new Set<HTMLElement>();

  constructor(private readonly options: ReadingViewRendererOptions) {}

  process(root: HTMLElement): void {
    this.pruneDisconnectedTokens();
    const settings = this.options.getSettings();
    if (!shouldPrepareRenderedDom(settings)) return;

    const entries = collectSafeTextRuns(root).flatMap((run) => {
      const segments = run.map((node) => ({
        text: node.data,
        language: findInheritedLanguage(node.parentElement, root),
      }));
      const styles = planGlyphStyles(segments, this.options.engine, settings);
      return run.map((node, index) => ({ node, language: segments[index].language, styles: styles[index] }));
    });
    for (const { node, language, styles } of entries) {
      const substitutions = this.options.engine.findReplacements(node.data, {
        settings, language,
      }, "substitutions");
      const replacements = [...substitutions, ...styles.filter((style) =>
        !substitutions.some((item) => style.from < item.to && item.from < style.to),
      )].sort((left, right) => left.from - right.from);
      if (replacements.length === 0) continue;

      const ownerWindow = node.doc.win as ObsidianWindow;
      const fragment = ownerWindow.createFragment();
      let cursor = 0;
      for (const replacement of replacements) {
        if (replacement.from > cursor) {
          fragment.append(
            node.doc.createTextNode(
              node.data.slice(cursor, replacement.from),
            ),
          );
        }

        const source = node.data.slice(replacement.from, replacement.to);
        const token = fragment.createSpan({
      cls: "typesetter-token",
        });
        token.toggleClass("is-reading-enabled", settings.readingView);
        token.toggleClass("is-pdf-enabled", settings.pdfExport);
        token.dataset.typographyRule = replacement.ruleId;
        token.createSpan({
      cls: "typesetter-source",
          text: source,
        });
        const rendered = token.createSpan({
      cls: "typesetter-rendered",
          text: replacement.replacement,
        });
        if (replacement.language) {
          rendered.lang = replacement.language;
        }
        if (replacement.glyphWidth) rendered.dataset.typographyWidth = replacement.glyphWidth;
        if (replacement.glyphAlign) rendered.dataset.typographyAlign = replacement.glyphAlign;
        this.tokenSources.set(token, source);
        this.tokens.add(token);
        cursor = replacement.to;
      }

      if (cursor < node.data.length) {
        fragment.append(node.doc.createTextNode(node.data.slice(cursor)));
      }
      node.replaceWith(fragment);
    }
  }

  restoreAll(): void {
    for (const token of this.tokens) {
      const source = this.tokenSources.get(token);
      if (
        source !== undefined &&
        token.isConnected &&
      token.hasClass("typesetter-token")
      ) {
        token.replaceWith(token.doc.createTextNode(source));
      }
    }
    this.tokens.clear();
  }

  private pruneDisconnectedTokens(): void {
    for (const token of this.tokens) {
      if (!token.isConnected) this.tokens.delete(token);
    }
  }
}
