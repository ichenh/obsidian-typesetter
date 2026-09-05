import type { TypographyContext } from "./context";
import type { CjkTypographySystem } from "../types";

export type TypographyLanguage = "en" | CjkTypographySystem;

export interface TypographyReplacement {
  from: number;
  to: number;
  replacement: string;
  ruleId: string;
  language?: TypographyLanguage;
}

export interface TypographyRule {
  id: string;
  name: string;
  enabledByDefault: boolean;
  priority: number;
  isEnabled(context: TypographyContext): boolean;
  apply(text: string, context: TypographyContext): TypographyReplacement[];
}
