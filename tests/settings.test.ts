import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, normalizeSettings } from "../src/settings";

describe("settings", () => {
  it("defaults rendered views on while keeping source mode literal", () => {
    expect(DEFAULT_SETTINGS).toMatchObject({
      schemaVersion: 9,
      enabled: true,
      sourceMode: false,
      livePreview: true,
      readingView: true,
      pdfExport: true,
      enDash: true,
      cjkPunctuationStyle: false,
      cjkCurlyQuoteStyle: false,
      chineseEllipsis: true,
      simplifiedChinesePunctuation: true,
      traditionalChinesePunctuation: true,
      japanesePunctuation: true,
      koreanPunctuation: true,
      periodCorrection: false,
      commaCorrection: false,
      colonCorrection: false,
      semicolonCorrection: false,
      questionMarkCorrection: false,
      exclamationMarkCorrection: false,
      rightArrow: true,
      rightDoubleArrow: false,
      leftDoubleArrow: false,
      revealAtCursor: true,
    });
  });

  it("accepts booleans and ignores invalid persisted values", () => {
    expect(normalizeSettings({ emDash: false, ellipsis: "no" })).toEqual({
      ...DEFAULT_SETTINGS,
      emDash: false,
    });
  });

  it("migrates the 0.1.0 explicit en-dash key and stamps the schema", () => {
    expect(normalizeSettings({ explicitEnDash: false, schemaVersion: 1 })).toMatchObject({
      schemaVersion: 9,
      enDash: false,
    });
  });

  it("turns legacy inferred punctuation rendering off during migration", () => {
    expect(
      normalizeSettings({
        schemaVersion: 5,
        periodCorrection: true,
        commaCorrection: true,
      }),
    ).toMatchObject({
      schemaVersion: 9,
      cjkPunctuationStyle: false,
      cjkCurlyQuoteStyle: false,
      periodCorrection: false,
      commaCorrection: false,
    });
    expect(
      normalizeSettings({
        schemaVersion: 7,
        cjkPunctuationStyle: true,
        periodCorrection: true,
      }),
    ).toMatchObject({
      schemaVersion: 9,
      cjkPunctuationStyle: true,
      cjkCurlyQuoteStyle: true,
      periodCorrection: true,
    });
  });
});
