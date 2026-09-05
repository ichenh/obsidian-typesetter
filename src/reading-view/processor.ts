import type { TypographyEngine } from "../typography/engine";
import type { PublishingTypographySettings } from "../types";
import { shouldPrepareRenderedDom } from "../rendering-modes";
import { collectSafeTextNodes } from "./dom-walker";

export interface ReadingViewRendererOptions {
  engine: TypographyEngine;
  getSettings(): Readonly<PublishingTypographySettings>;
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
    const language = current.getAttribute("lang")?.trim();
    if (language) return language;
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

    for (const node of collectSafeTextNodes(root)) {
      const inheritedLanguage = findInheritedLanguage(node.parentElement, root);
      const replacements = this.options.engine.findReplacements(node.data, {
        settings,
        language: inheritedLanguage,
      });
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
          cls: "publishing-typography-token",
        });
        token.toggleClass("is-reading-enabled", settings.readingView);
        token.toggleClass("is-pdf-enabled", settings.pdfExport);
        token.dataset.typographyRule = replacement.ruleId;
        token.createSpan({
          cls: "publishing-typography-source",
          text: source,
        });
        const rendered = token.createSpan({
          cls: "publishing-typography-rendered",
          text: replacement.replacement,
        });
        if (inheritedLanguage || replacement.language) {
          rendered.lang = replacement.language || inheritedLanguage || "";
        }
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
        token.hasClass("publishing-typography-token")
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
