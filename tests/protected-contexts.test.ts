import { describe, expect, it } from "vitest";
import {
  hasProtectedSyntaxAncestor,
  isUnsafeRawMarkdownRange,
} from "../src/live-preview/markdown-safety";

describe("Live Preview safety", () => {
  it.each([
    "Frontmatter",
    "YAMLValue",
    "MetadataProperty",
    "Properties",
    "InlineCode",
    "FencedCode",
    "CodeBlock",
    "Math",
    "MathBlock",
    "LaTeX",
    "TikzCode",
    "HTMLTag",
    "URL",
    "LinkDestination",
    "WikiLinkTarget",
    "Embed",
    "Hashtag",
    "BlockID",
    "BlockReference",
    "HorizontalRule",
  ])("protects syntax ancestor %s", (name) => {
    expect(hasProtectedSyntaxAncestor(["Document", name])).toBe(true);
  });

  it("allows ordinary paragraph and link-label syntax ancestors", () => {
    expect(hasProtectedSyntaxAncestor(["Document", "Paragraph"])).toBe(false);
    expect(hasProtectedSyntaxAncestor(["Document", "Link"])).toBe(false);
  });

  it.each([
    ["https://example.com/a--b", 21, 23],
    ["[label](https://example.com/a--b)", 29, 31],
    ["[[thermal--energy|alias]]", 9, 11],
    ["#tag--name", 4, 6],
    ["^block--id", 6, 8],
    ["---", 0, 3],
    ["----", 0, 4],
    ["    code--text", 8, 10],
  ])("rejects protected raw Markdown in %s", (text, from, to) => {
    expect(isUnsafeRawMarkdownRange(text, from, to)).toBe(true);
  });

  it("allows a visible Markdown link label", () => {
    const text = "[important--result](https://example.com/a--b)";
    expect(isUnsafeRawMarkdownRange(text, 10, 12)).toBe(false);
  });

  it("allows a visible wikilink alias", () => {
    const text = "[[thermal-energy|thermal energy--and heat]]";
    expect(isUnsafeRawMarkdownRange(text, 31, 33)).toBe(false);
  });

  it.each([
    ["Inline code: `a->b`.", 15, 17],
    ["Inline math: $x->y$.", 15, 17],
    ["A URL: https://example.com/a->b", 28, 30],
  ])("rejects arrow shorthand in protected inline content", (text, from, to) => {
    expect(isUnsafeRawMarkdownRange(text, from, to)).toBe(true);
  });

  it("protects a frontmatter delimiter and content", () => {
    const text = "---\ntitle: test--note\n---\n\nBody--text";
    expect(isUnsafeRawMarkdownRange(text, 15, 17)).toBe(true);
    expect(isUnsafeRawMarkdownRange(text, 32, 34)).toBe(false);
  });
});
