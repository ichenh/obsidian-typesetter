import type { BooleanSettingKey } from "../../types";
import type { TypographyRule } from "../rule";

interface ArrowTokenDefinition {
  source: string;
  replacement: string;
  setting: BooleanSettingKey;
  enabledByDefault: boolean;
}

const ARROW_TOKENS: readonly ArrowTokenDefinition[] = [
  { source: "<==>", replacement: "⟺", setting: "longBidirectionalDoubleArrow", enabledByDefault: false },
  { source: "<-->", replacement: "⟷", setting: "longBidirectionalArrow", enabledByDefault: true },
  { source: "==>", replacement: "⟹", setting: "longRightDoubleArrow", enabledByDefault: false },
  { source: "<==", replacement: "⟸", setting: "longLeftDoubleArrow", enabledByDefault: false },
  { source: "<=>", replacement: "⇔", setting: "bidirectionalDoubleArrow", enabledByDefault: false },
  { source: "<->", replacement: "↔", setting: "bidirectionalArrow", enabledByDefault: true },
  { source: "-->", replacement: "⟶", setting: "longRightArrow", enabledByDefault: true },
  { source: "<--", replacement: "⟵", setting: "longLeftArrow", enabledByDefault: true },
  { source: "=>", replacement: "⇒", setting: "rightDoubleArrow", enabledByDefault: false },
  { source: "<=", replacement: "⇐", setting: "leftDoubleArrow", enabledByDefault: false },
  { source: "->", replacement: "→", setting: "rightArrow", enabledByDefault: true },
  { source: "<-", replacement: "←", setting: "leftArrow", enabledByDefault: true },
];

const ARROW_SYNTAX_RE = /[<>=-]/u;

function isEmbeddedInLongerToken(
  text: string,
  from: number,
  to: number,
): boolean {
  return (
    ARROW_SYNTAX_RE.test(text[from - 1] ?? "") ||
    ARROW_SYNTAX_RE.test(text[to] ?? "")
  );
}

function ruleIdFor(source: string): string {
  const names: Record<string, string> = {
    "->": "right-arrow",
    "<-": "left-arrow",
    "<->": "bidirectional-arrow",
    "-->": "long-right-arrow",
    "<--": "long-left-arrow",
    "<-->": "long-bidirectional-arrow",
    "=>": "right-double-arrow",
    "<=": "left-double-arrow",
    "<=>": "bidirectional-double-arrow",
    "==>": "long-right-double-arrow",
    "<==": "long-left-double-arrow",
    "<==>": "long-bidirectional-double-arrow",
  };
  return names[source];
}

function createArrowRule(definition: ArrowTokenDefinition): TypographyRule {
  const id = ruleIdFor(definition.source);
  return {
    id,
    name: `${definition.source} arrow`,
    enabledByDefault: definition.enabledByDefault,
    priority: 110,
    isEnabled: ({ settings }) => Boolean(settings[definition.setting]),
    apply(text) {
      const replacements = [];
      let index = 0;
      while (index <= text.length - definition.source.length) {
        const from = text.indexOf(definition.source, index);
        if (from === -1) break;
        const to = from + definition.source.length;
        if (!isEmbeddedInLongerToken(text, from, to)) {
          replacements.push({
            from,
            to,
            replacement: definition.replacement,
            ruleId: id,
          });
        }
        index = to;
      }
      return replacements;
    },
  };
}

export const arrowRules: readonly TypographyRule[] = ARROW_TOKENS.map(createArrowRule);
