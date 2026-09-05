import {
  App,
  PluginSettingTab,
  Setting,
  type SettingDefinition,
  type SettingDefinitionItem,
} from "obsidian";
import { t, type TranslationKey } from "./l10n/locale";
import type PublishingTypographyPlugin from "./main";
import { DEFAULT_SETTINGS } from "./settings";
import type {
  BooleanSettingKey,
  PublishingTypographySettings,
} from "./types";

interface ToggleSpec {
  name(): string;
  description(): string;
  key?: BooleanSettingKey;
}

interface SettingSection {
  heading(): string;
  items: readonly ToggleSpec[];
}

function localized(
  nameKey: TranslationKey,
  descriptionKey: TranslationKey,
  key?: BooleanSettingKey,
): ToggleSpec {
  return {
    name: () => t(nameKey),
    description: () => t(descriptionKey),
    key,
  };
}

function mapping(
  nameKey: TranslationKey,
  source: string,
  replacement: string,
  descriptionKey: TranslationKey,
  key: BooleanSettingKey,
): ToggleSpec {
  return {
    name: () => t(nameKey, replacement),
    description: () => t(descriptionKey, source, replacement),
    key,
  };
}

function cjkSystem(nameKey: TranslationKey, key: BooleanSettingKey): ToggleSpec {
  return {
    name: () => t(nameKey),
    description: () => t("cjkSystemDesc", t(nameKey)),
    key,
  };
}

function correction(
  punctuationKey: TranslationKey,
  key: BooleanSettingKey,
  descriptionKey: TranslationKey = "visualCorrectionDesc",
): ToggleSpec {
  return {
    name: () => t("visualCorrectionName", t(punctuationKey)),
    description: () => t(descriptionKey, t(punctuationKey)),
    key,
  };
}

const SETTING_SECTIONS: readonly SettingSection[] = [
  {
    heading: () => t("headingRendering"),
    items: [
      localized("enableTypographyName", "enableTypographyDesc", "enabled"),
      localized("sourceModeName", "sourceModeDesc", "sourceMode"),
      localized("livePreviewName", "livePreviewDesc", "livePreview"),
      localized("readingViewName", "readingViewDesc", "readingView"),
      localized("pdfExportName", "pdfExportDesc", "pdfExport"),
      localized("revealAtCursorName", "revealAtCursorDesc", "revealAtCursor"),
    ],
  },
  {
    heading: () => t("headingDashes"),
    items: [
      mapping("enDashName", "--", "–", "enDashDesc", "enDash"),
      mapping("emDashName", "----", "—", "emDashDesc", "emDash"),
      localized("numericalRangesName", "numericalRangesDesc", "numericalRanges"),
    ],
  },
  {
    heading: () => t("headingSymbols"),
    items: [
      mapping("arrowName", "->", "→", "symbolDefaultDesc", "rightArrow"),
      mapping("arrowName", "<-", "←", "symbolDefaultDesc", "leftArrow"),
      mapping("arrowName", "<->", "↔", "symbolDefaultDesc", "bidirectionalArrow"),
      mapping("longArrowName", "-->", "⟶", "symbolDefaultDesc", "longRightArrow"),
      mapping("longArrowName", "<--", "⟵", "symbolDefaultDesc", "longLeftArrow"),
      mapping("longArrowName", "<-->", "⟷", "symbolDefaultDesc", "longBidirectionalArrow"),
      mapping("doubleArrowName", "=>", "⇒", "symbolOperatorDesc", "rightDoubleArrow"),
      mapping("doubleArrowName", "<=", "⇐", "symbolOperatorDesc", "leftDoubleArrow"),
      mapping("doubleArrowName", "<=>", "⇔", "symbolOperatorDesc", "bidirectionalDoubleArrow"),
      mapping("longDoubleArrowName", "==>", "⟹", "symbolOperatorDesc", "longRightDoubleArrow"),
      mapping("longDoubleArrowName", "<==", "⟸", "symbolOperatorDesc", "longLeftDoubleArrow"),
      mapping("longDoubleArrowName", "<==>", "⟺", "symbolOperatorDesc", "longBidirectionalDoubleArrow"),
    ],
  },
  {
    heading: () => t("headingPunctuation"),
    items: [
      mapping("englishEllipsisName", "...", "…", "englishEllipsisDesc", "ellipsis"),
      mapping("chineseEllipsisName", "......", "……", "chineseEllipsisDesc", "chineseEllipsis"),
      localized("cjkGlyphName", "cjkGlyphDesc", "cjkPunctuationStyle"),
      localized(
        "cjkCurlyQuoteName",
        "cjkCurlyQuoteDesc",
        "cjkCurlyQuoteStyle",
      ),
      cjkSystem("simplifiedChineseName", "simplifiedChinesePunctuation"),
      cjkSystem("traditionalChineseName", "traditionalChinesePunctuation"),
      cjkSystem("japaneseName", "japanesePunctuation"),
      cjkSystem("koreanName", "koreanPunctuation"),
      correction("fullStops", "periodCorrection"),
      correction("commas", "commaCorrection"),
      correction("colons", "colonCorrection", "colonCorrectionDesc"),
      correction("semicolons", "semicolonCorrection"),
      correction("questionMarks", "questionMarkCorrection"),
      correction("exclamationMarks", "exclamationMarkCorrection"),
    ],
  },
  {
    heading: () => t("headingSafety"),
    items: [localized("safetyName", "safetyDesc")],
  },
];

function isBooleanSettingKey(key: string): key is BooleanSettingKey {
  return (
    key !== "schemaVersion" &&
    key in DEFAULT_SETTINGS &&
    typeof DEFAULT_SETTINGS[key as keyof PublishingTypographySettings] ===
      "boolean"
  );
}

function toDefinition(
  spec: ToggleSpec,
): SettingDefinition<BooleanSettingKey> {
  if (!spec.key) return { name: spec.name(), desc: spec.description() };
  return {
    name: spec.name(),
    desc: spec.description(),
    control: { type: "toggle", key: spec.key },
  };
}

export class PublishingTypographySettingTab extends PluginSettingTab {
  constructor(app: App, private readonly plugin: PublishingTypographyPlugin) {
    super(app, plugin);
  }

  getSettingDefinitions(): SettingDefinitionItem<BooleanSettingKey>[] {
    return [
      {
        name: t("settingsTitle"),
        desc: t("settingsSubtitle"),
        searchable: false,
        render: (setting) => {
          this.containerEl.addClass("publishing-typography-settings");
          setting.settingEl.empty();
          setting.settingEl.createEl("p", {
            cls: "publishing-typography-settings-intro",
            text: t("settingsIntro"),
          });
        },
      },
      ...SETTING_SECTIONS.map((section) => ({
        type: "group" as const,
        heading: section.heading(),
        items: section.items.map(toDefinition),
      })),
    ];
  }

  getControlValue(key: string): unknown {
    return isBooleanSettingKey(key) ? this.plugin.settings[key] : undefined;
  }

  async setControlValue(key: string, value: unknown): Promise<void> {
    if (!isBooleanSettingKey(key) || typeof value !== "boolean") return;
    await this.plugin.updateSetting(key, value);
  }

  display(): void {
    this.containerEl.empty();
    this.containerEl.addClass("publishing-typography-settings");
    this.containerEl.createEl("p", {
      cls: "publishing-typography-settings-intro",
      text: t("settingsIntro"),
    });
    for (const section of SETTING_SECTIONS) {
      new Setting(this.containerEl).setName(section.heading()).setHeading();
      for (const item of section.items) {
        if (item.key) {
          this.addToggle(item, item.key);
        } else {
          new Setting(this.containerEl)
            .setName(item.name())
            .setDesc(item.description());
        }
      }
    }
  }

  private addToggle(spec: ToggleSpec, key: BooleanSettingKey): void {
    new Setting(this.containerEl)
      .setName(spec.name())
      .setDesc(spec.description())
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings[key])
          .onChange((value) => this.plugin.updateSetting(key, value)),
      );
  }
}
