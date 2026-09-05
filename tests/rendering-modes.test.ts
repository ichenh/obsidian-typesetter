import { describe, expect, it } from "vitest";
import {
  shouldPrepareRenderedDom,
  shouldRenderEditorMode,
} from "../src/rendering-modes";
import { DEFAULT_SETTINGS } from "../src/settings";

describe("rendering mode switches", () => {
  it("keeps source mode literal by default", () => {
    expect(shouldRenderEditorMode(DEFAULT_SETTINGS, false)).toBe(false);
    expect(shouldRenderEditorMode(DEFAULT_SETTINGS, true)).toBe(true);
  });

  it("controls source mode and live preview independently", () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      sourceMode: true,
      livePreview: false,
    };
    expect(shouldRenderEditorMode(settings, false)).toBe(true);
    expect(shouldRenderEditorMode(settings, true)).toBe(false);
  });

  it("prepares rendered DOM when either reading or PDF output needs it", () => {
    expect(
      shouldPrepareRenderedDom({
        ...DEFAULT_SETTINGS,
        readingView: false,
        pdfExport: true,
      }),
    ).toBe(true);
    expect(
      shouldPrepareRenderedDom({
        ...DEFAULT_SETTINGS,
        readingView: true,
        pdfExport: false,
      }),
    ).toBe(true);
    expect(
      shouldPrepareRenderedDom({
        ...DEFAULT_SETTINGS,
        readingView: false,
        pdfExport: false,
      }),
    ).toBe(false);
  });

  it("lets the master switch disable every mode", () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      enabled: false,
      sourceMode: true,
      livePreview: true,
      readingView: true,
      pdfExport: true,
    };
    expect(shouldRenderEditorMode(settings, false)).toBe(false);
    expect(shouldRenderEditorMode(settings, true)).toBe(false);
    expect(shouldPrepareRenderedDom(settings)).toBe(false);
  });
});
