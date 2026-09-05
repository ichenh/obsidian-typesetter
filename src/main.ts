import { MarkdownView, Notice, Plugin } from "obsidian";
import { initLocale, t } from "./l10n/locale";
import { createTypographyLivePreviewExtension } from "./live-preview/extension";
import { ReadingViewRenderer } from "./reading-view/processor";
import {
  DEFAULT_SETTINGS,
  normalizeSettings,
  SETTINGS_SCHEMA_VERSION,
} from "./settings";
import { PublishingTypographySettingTab } from "./settings-tab";
import { TypographyEngine } from "./typography/engine";
import type {
  BooleanSettingKey,
  PublishingTypographySettings,
} from "./types";

export default class PublishingTypographyPlugin extends Plugin {
  settings: PublishingTypographySettings = { ...DEFAULT_SETTINGS };
  private readonly engine = new TypographyEngine();
  private readonly readingRenderer = new ReadingViewRenderer({
    engine: this.engine,
    getSettings: () => this.settings,
  });
  private settingsWriteChain: Promise<void> = Promise.resolve();

  async onload(): Promise<void> {
    initLocale();
    const data = (await this.loadData()) as Record<string, unknown> | null;
    this.settings = normalizeSettings(data);
    if (data?.schemaVersion !== SETTINGS_SCHEMA_VERSION) {
      await this.saveSettings();
    }

    this.registerEditorExtension([
      createTypographyLivePreviewExtension({
        getSettings: () => this.settings,
      }),
    ]);
    this.registerMarkdownPostProcessor((element) => {
      this.readingRenderer.process(element);
    });
    this.addSettingTab(new PublishingTypographySettingTab(this.app, this));

    this.addCommand({
      id: "toggle-rendering",
      name: t("cmdToggleRendering"),
      callback: () => void this.toggleSetting("enabled", t("labelRendering")),
    });
    this.addCommand({
      id: "toggle-source-mode-rendering",
      name: t("cmdToggleSourceMode"),
      callback: () => void this.toggleSetting("sourceMode", t("labelSourceMode")),
    });
    this.addCommand({
      id: "toggle-live-preview-rendering",
      name: t("cmdToggleLivePreview"),
      callback: () => void this.toggleSetting("livePreview", t("labelLivePreview")),
    });
    this.addCommand({
      id: "toggle-reading-view-rendering",
      name: t("cmdToggleReadingView"),
      callback: () => void this.toggleSetting("readingView", t("labelReadingView")),
    });
    this.addCommand({
      id: "toggle-pdf-export-rendering",
      name: t("cmdTogglePdfExport"),
      callback: () => void this.toggleSetting("pdfExport", t("labelPdfExport")),
    });
  }

  onunload(): void {
    this.readingRenderer.restoreAll();
  }

  async updateSetting(
    key: BooleanSettingKey,
    value: boolean,
  ): Promise<void> {
    this.settings = { ...this.settings, [key]: value };
    await this.saveSettings();
    this.refreshRendering();
  }

  async saveSettings(): Promise<void> {
    const snapshot = { ...this.settings };
    const write = this.settingsWriteChain.then(() => this.saveData(snapshot));
    this.settingsWriteChain = write.catch(() => undefined);
    await write;
  }

  private async toggleSetting(
    key: "enabled" | "sourceMode" | "livePreview" | "readingView" | "pdfExport",
    label: string,
  ): Promise<void> {
    const enabled = !this.settings[key];
    await this.updateSetting(key, enabled);
    new Notice(t(enabled ? "noticeEnabled" : "noticeDisabled", label));
  }

  private refreshRendering(): void {
    this.readingRenderer.restoreAll();
    this.app.workspace.updateOptions();
    for (const leaf of this.app.workspace.getLeavesOfType("markdown")) {
      const view = leaf.view;
      if (view instanceof MarkdownView) view.previewMode.rerender(true);
    }
  }
}
