import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "../src/settings";
import { TypographyEngine } from "../src/typography/engine";
import type { PublishingTypographySettings } from "../src/types";

const engine = new TypographyEngine();
const context = { settings: DEFAULT_SETTINGS };

describe("ASCII arrows", () => {
  it.each([
    ["A->B", "A→B"],
    ["A<-B", "A←B"],
    ["A<->B", "A↔B"],
    ["A-->B", "A⟶B"],
    ["A<--B", "A⟵B"],
    ["A<-->B", "A⟷B"],
  ])("renders %s using longest-match precedence", (source, rendered) => {
    expect(engine.render(source, context)).toBe(rendered);
  });

  it.each(["x<=y", "A--->B", "A<==>B", "A<--->B"])(
    "leaves ambiguous or unsupported token %s literal",
    (source) => expect(engine.render(source, context)).toBe(source),
  );

  it("is independently configurable", () => {
    const settings = { ...DEFAULT_SETTINGS, rightArrow: false };
    expect(engine.render("A->B", { settings })).toBe("A->B");
  });

  it.each(["x=>x + 1", "x<=10", "A<=>B", "A==>B", "A<==B", "A<==>B"])(
    "keeps programming-style operator %s literal by default",
    (source) => expect(engine.render(source, context)).toBe(source),
  );

  const optionalArrows: Array<
    [string, string, keyof PublishingTypographySettings]
  > = [
    ["A=>B", "A⇒B", "rightDoubleArrow"],
    ["A<=B", "A⇐B", "leftDoubleArrow"],
    ["A<=>B", "A⇔B", "bidirectionalDoubleArrow"],
    ["A==>B", "A⟹B", "longRightDoubleArrow"],
    ["A<==B", "A⟸B", "longLeftDoubleArrow"],
    ["A<==>B", "A⟺B", "longBidirectionalDoubleArrow"],
  ];

  it.each(optionalArrows)(
    "offers %s as its own opt-in transformation",
    (source, rendered, setting) => {
      const settings = { ...DEFAULT_SETTINGS, [setting]: true };
      expect(engine.render(source, { settings })).toBe(rendered);
    },
  );
});
