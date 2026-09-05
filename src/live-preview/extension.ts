import {
  Decoration,
  EditorView,
  ViewPlugin,
  type DecorationSet,
  type ViewUpdate,
} from "@codemirror/view";
import { editorLivePreviewField } from "obsidian";
import { shouldRenderEditorMode } from "../rendering-modes";
import { TypographyEngine } from "../typography/engine";
import type { TypesetterSettings } from "../types";
import { buildTypographyDecorations } from "./decorations";

export interface TypographyExtensionOptions {
  getSettings(): Readonly<TypesetterSettings>;
}

function settingsKey(settings: Readonly<TypesetterSettings>): string {
  return [
    settings.enabled,
    settings.sourceMode,
    settings.livePreview,
    settings.revealAtCursor,
    settings.emDash,
    settings.enDash,
    settings.numericalRanges,
    settings.rightArrow,
    settings.leftArrow,
    settings.bidirectionalArrow,
    settings.longRightArrow,
    settings.longLeftArrow,
    settings.longBidirectionalArrow,
    settings.rightDoubleArrow,
    settings.leftDoubleArrow,
    settings.bidirectionalDoubleArrow,
    settings.longRightDoubleArrow,
    settings.longLeftDoubleArrow,
    settings.longBidirectionalDoubleArrow,
    settings.ellipsis,
    settings.chineseEllipsis,
    settings.cjkPunctuationStyle,
    settings.cjkCurlyQuoteStyle,
    settings.simplifiedChinesePunctuation,
    settings.traditionalChinesePunctuation,
    settings.japanesePunctuation,
    settings.koreanPunctuation,
    settings.periodCorrection,
    settings.commaCorrection,
    settings.colonCorrection,
    settings.semicolonCorrection,
    settings.questionMarkCorrection,
    settings.exclamationMarkCorrection,
  ].join(":");
}

function isLivePreview(view: EditorView): boolean {
  try {
    return view.state.field(editorLivePreviewField);
  } catch {
    return false;
  }
}

export function createTypographyLivePreviewExtension(
  options: TypographyExtensionOptions,
) {
  const engine = new TypographyEngine();
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet = Decoration.none;
      private currentSettingsKey = "";
      private livePreview = false;

      constructor(private view: EditorView) {
        this.rebuild();
      }

      update(update: ViewUpdate): void {
        this.view = update.view;
        const settings = options.getSettings();
        const nextSettingsKey = settingsKey(settings);
        const nextLivePreview = isLivePreview(update.view);
        if (
          update.docChanged ||
          update.viewportChanged ||
          update.selectionSet ||
          nextSettingsKey !== this.currentSettingsKey ||
          nextLivePreview !== this.livePreview
        ) {
          this.rebuild();
        }
      }

      private rebuild(): void {
        const settings = options.getSettings();
        this.currentSettingsKey = settingsKey(settings);
        this.livePreview = isLivePreview(this.view);
        this.decorations =
          shouldRenderEditorMode(settings, this.livePreview)
            ? buildTypographyDecorations(this.view, engine, settings)
            : Decoration.none;
      }
    },
    {
      decorations: (plugin) => plugin.decorations,
      provide: (plugin) =>
        EditorView.atomicRanges.of(
          (view) => view.plugin(plugin)?.decorations ?? Decoration.none,
        ),
    },
  );
}
