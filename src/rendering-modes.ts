import type { TypesetterSettings } from "./types";

export function shouldRenderEditorMode(
  settings: Readonly<TypesetterSettings>,
  isLivePreview: boolean,
): boolean {
  if (!settings.enabled) return false;
  return isLivePreview ? settings.livePreview : settings.sourceMode;
}

export function shouldPrepareRenderedDom(
  settings: Readonly<TypesetterSettings>,
): boolean {
  return settings.enabled && (settings.readingView || settings.pdfExport);
}
