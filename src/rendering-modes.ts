import type { PublishingTypographySettings } from "./types";

export function shouldRenderEditorMode(
  settings: Readonly<PublishingTypographySettings>,
  isLivePreview: boolean,
): boolean {
  if (!settings.enabled) return false;
  return isLivePreview ? settings.livePreview : settings.sourceMode;
}

export function shouldPrepareRenderedDom(
  settings: Readonly<PublishingTypographySettings>,
): boolean {
  return settings.enabled && (settings.readingView || settings.pdfExport);
}
