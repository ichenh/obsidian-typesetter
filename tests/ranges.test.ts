import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "../src/settings";
import { TypographyEngine } from "../src/typography/engine";

const engine = new TypographyEngine();
const context = { settings: DEFAULT_SETTINGS };

describe("numerical ranges", () => {
  it.each([
    ["10-20", "10–20"],
    ["2025-2027", "2025–2027"],
    ["pp. 15-23", "pp. 15–23"],
  ])("renders an obvious range", (source, rendered) => {
    expect(engine.render(source, context)).toBe(rendered);
  });

  it.each(["10 - 5", "x-y", "v-t", "10^-3", "1e-6", "2.5E-4", "3.14-3.18"])(
    "keeps mathematical or ambiguous notation literal",
    (source) => expect(engine.render(source, context)).toBe(source),
  );
});
