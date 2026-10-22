import type { TypographyContext } from "./context";
import type { CjkTypographySystem } from "../types";

export type TypographyLanguage = "en" | CjkTypographySystem;

export interface TypographyReplacement {
  from: number;
  to: number;
  replacement: string;
  ruleId: string;
  language?: TypographyLanguage;
  glyphWidth?: "half" | "two-thirds" | "full";
  glyphAlign?: "center";
}

export interface TypographyRule {
  /** Glyph rules may assign fonts and widths but must preserve every source character. */
  kind?: "glyph";
  id: string;
  name: string;
  enabledByDefault: boolean;
  priority: number;
  isEnabled(context: TypographyContext): boolean;
  apply(text: string, context: TypographyContext): TypographyReplacement[];
}
