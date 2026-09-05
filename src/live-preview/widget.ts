import { EditorView, WidgetType } from "@codemirror/view";
import type { TypographyLanguage } from "../typography/rule";

interface ObsidianWindow extends Window {
  createSpan(): HTMLSpanElement;
}

export class TypographyWidget extends WidgetType {
  constructor(
    readonly from: number,
    readonly to: number,
    readonly replacement: string,
    readonly source: string,
    readonly ruleId: string,
    readonly language?: TypographyLanguage,
  ) {
    super();
  }

  eq(other: TypographyWidget): boolean {
    return (
      other.from === this.from &&
      other.to === this.to &&
      other.replacement === this.replacement &&
      other.source === this.source &&
      other.ruleId === this.ruleId &&
      other.language === this.language
    );
  }

  toDOM(view: EditorView): HTMLElement {
    const ownerWindow = view.dom.win as ObsidianWindow;
    const span = ownerWindow.createSpan();
    span.className = "typesetter-widget";
    span.dataset.typographyRule = this.ruleId;
    if (this.language) span.lang = this.language;
    span.setAttribute("aria-label", this.source);
    span.textContent = this.replacement;
    span.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      const anchor = Math.min(this.to - 1, this.from + 1);
      view.dispatch({ selection: { anchor } });
      view.focus();
    });
    return span;
  }

  ignoreEvent(): boolean {
    return true;
  }
}
