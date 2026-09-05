import { describe, expect, it } from "vitest";
import { findInheritedLanguage } from "../src/reading-view/processor";

interface TestElement {
  parentElement: TestElement | null;
  getAttribute(name: string): string | null;
}

function element(language: string | null, parentElement: TestElement | null): TestElement {
  return {
    parentElement,
    getAttribute: (name) => (name === "lang" ? language : null),
  };
}

function asHtmlElement(value: TestElement): HTMLElement {
  return value as unknown as HTMLElement;
}

describe("Reading View language inheritance", () => {
  it("does not inherit Obsidian interface language above the Markdown root", () => {
    const appRoot = element("en", null);
    const markdownRoot = element(null, appRoot);
    const paragraph = element(null, markdownRoot);
    expect(
      findInheritedLanguage(
        asHtmlElement(paragraph),
        asHtmlElement(markdownRoot),
      ),
    ).toBeUndefined();
  });

  it("uses the nearest explicit language inside the Markdown root", () => {
    const markdownRoot = element("zh-TW", null);
    const section = element("ja-JP", markdownRoot);
    const paragraph = element(null, section);
    expect(
      findInheritedLanguage(
        asHtmlElement(paragraph),
        asHtmlElement(markdownRoot),
      ),
    ).toBe("ja-JP");
  });

  it("accepts an explicit language on the Markdown root", () => {
    const markdownRoot = element("ko-KR", null);
    const paragraph = element(null, markdownRoot);
    expect(
      findInheritedLanguage(
        asHtmlElement(paragraph),
        asHtmlElement(markdownRoot),
      ),
    ).toBe("ko-KR");
  });
});
