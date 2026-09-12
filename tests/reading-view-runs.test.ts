import { describe, expect, it } from "vitest";
import { collectSafeTextRuns } from "../src/reading-view/dom-walker";

// A small DOM test double checks traversal boundaries, not browser layout.
class TextNode {
  readonly nodeType = 3;
  parentElement: ElementNode | null = null;
  constructor(readonly data: string) {}
}
class ElementNode {
  readonly nodeType = 1;
  parentElement: ElementNode | null = null;
  constructor(readonly tag: string, readonly children: Array<ElementNode | TextNode>, readonly attributes: Record<string, string> = {}) {
    for (const child of children) child.parentElement = this;
  }
  get textContent(): string {
    return this.children.map((child) => child instanceof TextNode ? child.data : child.textContent).join("");
  }
  getAttribute(name: string): string | null { return this.attributes[name] ?? null; }
  classList = { contains: (name: string) => (this.attributes.class ?? "").split(" ").includes(name) };
  matches(selector: string): boolean {
    return selector.split(",").some((part) => part === this.tag ||
      (part.startsWith(".") && this.classList.contains(part.slice(1))));
  }
  closest(selector: string): ElementNode | null {
    return this.matches(selector) ? this : this.parentElement?.closest(selector) ?? null;
  }
  get ownerDocument() {
    return {
      defaultView: { NodeFilter: { SHOW_ELEMENT: 1, SHOW_TEXT: 4 } },
      createTreeWalker: () => {
        const nodes: Array<ElementNode | TextNode> = [];
        const visit = (element: ElementNode) => {
          for (const child of element.children) {
            nodes.push(child);
            if (child instanceof ElementNode) visit(child);
          }
        };
        visit(this);
        let index = 0;
        return { nextNode: () => nodes[index++] ?? null };
      },
    };
  }
}
function element(tag: string, children: Array<string | ElementNode>, attributes?: Record<string, string>): ElementNode {
  return new ElementNode(tag, children.map((child) => typeof child === "string" ? new TextNode(child) : child), attributes);
}
function runs(root: ElementNode): string[][] {
  return collectSafeTextRuns(root as unknown as HTMLElement).map((run) => run.map((node) => node.data));
}

describe("Reading View prose boundaries", () => {
  it("joins text around inline formatting in one paragraph", () => {
    expect(runs(element("div", [element("p", ["“欢迎", element("strong", ["光临"]), "”"])]))).toEqual([["“欢迎", "光临", "”"]]);
  });
  it.each(["code", "svg", "br", "img"])("does not cross %s content, including empty nodes", (tag) => {
    expect(runs(element("p", ["“中文", element(tag, []), "”"]))).toEqual([["“中文"], ["”"]]);
  });
  it("does not use protected text or combine different paragraphs", () => {
    expect(runs(element("div", [
      element("p", ["“中文", element("code", ["hidden"]), "”"]),
      element("p", ["next paragraph"]),
    ]))).toEqual([["“中文"], ["”"], ["next paragraph"]]);
  });
  it("excludes an entire URL link even when formatting splits its label", () => {
    expect(runs(element("p", ["before", element("a", ["https://example.com/", element("strong", ["a--b"])], {
      href: "https://example.com/a--b",
    }), "after"]))).toEqual([["before"], ["after"]]);
  });
});
