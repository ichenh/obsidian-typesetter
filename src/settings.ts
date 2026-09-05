import type { PublishingTypographySettings } from "./types";

export const SETTINGS_SCHEMA_VERSION = 8;

export const DEFAULT_SETTINGS: PublishingTypographySettings = {
  schemaVersion: SETTINGS_SCHEMA_VERSION,
  enabled: true,
  sourceMode: false,
  livePreview: true,
  readingView: true,
  pdfExport: true,
  revealAtCursor: true,
  emDash: true,
  enDash: true,
  numericalRanges: true,
  rightArrow: true,
  leftArrow: true,
  bidirectionalArrow: true,
  longRightArrow: true,
  longLeftArrow: true,
  longBidirectionalArrow: true,
  rightDoubleArrow: false,
  leftDoubleArrow: false,
  bidirectionalDoubleArrow: false,
  longRightDoubleArrow: false,
  longLeftDoubleArrow: false,
  longBidirectionalDoubleArrow: false,
  ellipsis: true,
  chineseEllipsis: true,
  cjkPunctuationStyle: false,
  cjkCurlyQuoteStyle: false,
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
};

export function normalizeSettings(
  input: unknown,
): PublishingTypographySettings {
  if (!input || typeof input !== "object") return { ...DEFAULT_SETTINGS };
  const source = input as Record<string, unknown>;
  const normalized = { ...DEFAULT_SETTINGS };
  for (const key of Object.keys(DEFAULT_SETTINGS) as Array<
    keyof PublishingTypographySettings
  >) {
    if (key === "schemaVersion") continue;
    if (typeof source[key] === "boolean") normalized[key] = source[key];
  }
  if (
    typeof source.enDash !== "boolean" &&
    typeof source.explicitEnDash === "boolean"
  ) {
    normalized.enDash = source.explicitEnDash;
  }
  const sourceSchemaVersion =
    typeof source.schemaVersion === "number" ? source.schemaVersion : 0;
  if (sourceSchemaVersion < 7) {
    normalized.cjkPunctuationStyle = false;
    normalized.cjkCurlyQuoteStyle = false;
    normalized.periodCorrection = false;
    normalized.commaCorrection = false;
    normalized.colonCorrection = false;
    normalized.semicolonCorrection = false;
    normalized.questionMarkCorrection = false;
    normalized.exclamationMarkCorrection = false;
  } else if (sourceSchemaVersion < 8) {
    normalized.cjkCurlyQuoteStyle = source.cjkPunctuationStyle === true;
  }
  normalized.schemaVersion = SETTINGS_SCHEMA_VERSION;
  return normalized;
}
