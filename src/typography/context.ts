import type { PublishingTypographySettings } from "../types";

export interface TypographyContext {
  settings: Readonly<PublishingTypographySettings>;
  language?: string;
}
