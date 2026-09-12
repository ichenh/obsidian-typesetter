export type CjkTypographySystem = "zh" | "zh-Hans" | "zh-Hant" | "zh-HK" | "zh-MO" | "ja" | "ko";

export type ChinesePunctuationRegion = "zh-Hans" | "zh-Hant" | "zh-HK";

export interface TypesetterSettings {
  schemaVersion: number;
  enabled: boolean;
  sourceMode: boolean;
  livePreview: boolean;
  readingView: boolean;
  pdfExport: boolean;
  revealAtCursor: boolean;
  emDash: boolean;
  enDash: boolean;
  numericalRanges: boolean;
  rightArrow: boolean;
  leftArrow: boolean;
  bidirectionalArrow: boolean;
  longRightArrow: boolean;
  longLeftArrow: boolean;
  longBidirectionalArrow: boolean;
  rightDoubleArrow: boolean;
  leftDoubleArrow: boolean;
  bidirectionalDoubleArrow: boolean;
  longRightDoubleArrow: boolean;
  longLeftDoubleArrow: boolean;
  longBidirectionalDoubleArrow: boolean;
  ellipsis: boolean;
  chineseEllipsis: boolean;
  chinesePunctuationRegion: ChinesePunctuationRegion;
  cjkPunctuationStyle: boolean;
  cjkCurlyQuoteStyle: boolean;
  simplifiedChinesePunctuation: boolean;
  traditionalChinesePunctuation: boolean;
  japanesePunctuation: boolean;
  koreanPunctuation: boolean;
  periodCorrection: boolean;
  commaCorrection: boolean;
  colonCorrection: boolean;
  semicolonCorrection: boolean;
  questionMarkCorrection: boolean;
  exclamationMarkCorrection: boolean;
}

export type BooleanSettingKey = Exclude<
  keyof TypesetterSettings,
  "schemaVersion" | "chinesePunctuationRegion"
>;

export type SettingKey = BooleanSettingKey | "chinesePunctuationRegion";
