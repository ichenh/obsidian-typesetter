export const en = {
  settingsTitle: "Typesetter",
  settingsSubtitle: "Non-destructive typography for ordinary prose.",
  settingsIntro:
    "Choose where typography is rendered and enable only the rules that fit your writing.",
  headingRendering: "Rendering",
  headingDashes: "Dashes",
  headingSymbols: "Symbols",
  headingPunctuation: "Punctuation",
  headingSafety: "Safety",
  enableTypographyName: "Enable typography",
  enableTypographyDesc: "Master switch for every rendering mode.",
  sourceModeName: "Enable in source mode",
  sourceModeDesc:
    "Visually typesets source mode without changing or hiding the underlying document.",
  livePreviewName: "Enable in Live Preview",
  livePreviewDesc: "Visually typesets prose while editing.",
  readingViewName: "Enable in Reading View",
  readingViewDesc: "Typesets safe rendered text nodes.",
  pdfExportName: "Enable for print and PDF output",
  pdfExportDesc:
    "Uses typeset tokens when the host or exporter prints Obsidian's rendered view.",
  revealAtCursorName: "Reveal source token at cursor",
  revealAtCursorDesc:
    "Shows the literal Markdown token when a cursor or selection touches it.",
  enDashName: "En dash shorthand",
  emDashName: "Em dash shorthand",
  arrowName: "Arrow %1",
  longArrowName: "Long arrow %1",
  doubleArrowName: "Double arrow %1",
  longDoubleArrowName: "Long double arrow %1",
  englishEllipsisName: "English ellipsis",
  chineseEllipsisName: "Chinese ellipsis",
  enDashDesc: "Source token: %1. Displayed as en dash %2 in ordinary prose.",
  emDashDesc:
    "Source token: %1. Displayed as em dash %2; this rule runs before the shorter dash rule.",
  numericalRangesName: "Detect numerical ranges",
  numericalRangesDesc:
    "Displays conservative number ranges with an en dash.",
  symbolDefaultDesc:
    "Source token: %1. Displayed symbol: %2. Enabled by default for prose.",
  symbolOperatorDesc:
    "Source token: %1. Displayed symbol: %2. Disabled by default because the source can be programming syntax.",
  englishEllipsisDesc:
    "Source token: %1. Displayed as the single ellipsis character %2.",
  chineseEllipsisDesc:
    "Source token: %1. Displayed as the centered two-character Chinese ellipsis %2.",
  cjkGlyphName: "Apply regional CJK punctuation glyphs",
  cjkGlyphDesc:
    "Advanced opt-in. Applies regional glyphs to CJK punctuation written by the input method without changing its characters.",
  cjkCurlyQuoteName: "Apply regional curly-quote glyphs",
  cjkCurlyQuoteDesc:
    "Advanced opt-in. Styles curly quote characters independently of their contents. Straight ASCII quotes remain literal; an explicit language tag takes precedence.",
  simplifiedChineseName: "Simplified Chinese punctuation",
  traditionalChineseName: "Traditional Chinese punctuation",
  japaneseName: "Japanese punctuation",
  koreanName: "Korean punctuation",
  cjkSystemDesc: "Enable localized punctuation handling for %1 prose.",
  visualCorrectionName: "Visually correct %1",
  visualCorrectionDesc:
    "Advanced opt-in. Displays likely %1 mismatches differently without changing Markdown.",
  colonCorrectionDesc:
    "Advanced opt-in. Times such as 10:30 remain literal.",
  fullStops: "full stops",
  commas: "commas",
  colons: "colons",
  semicolons: "semicolons",
  questionMarks: "question marks",
  exclamationMarks: "exclamation marks",
  safetyName: "Always protected",
  safetyDesc:
    "Frontmatter, properties, code, math, TikZ, URLs, link targets, tags, block IDs, HTML source, SVG, scripts, styles, embeds, and Markdown structural syntax.",
  cmdToggleRendering: "Toggle rendering",
  cmdToggleSourceMode: "Toggle source mode rendering",
  cmdToggleLivePreview: "Toggle Live Preview rendering",
  cmdToggleReadingView: "Toggle Reading View rendering",
  cmdTogglePdfExport: "Toggle print and PDF rendering",
  labelRendering: "Typography rendering",
  labelSourceMode: "Source mode typography",
  labelLivePreview: "Live Preview typography",
  labelReadingView: "Reading View typography",
  labelPdfExport: "Print and PDF typography",
  noticeEnabled: "%1 enabled.",
  noticeDisabled: "%1 disabled.",
} as const;

export type TranslationKey = keyof typeof en;
