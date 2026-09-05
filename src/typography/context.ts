import type { TypesetterSettings } from "../types";

export interface TypographyContext {
  settings: Readonly<TypesetterSettings>;
  language?: string;
}
