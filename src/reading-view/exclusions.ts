const EXCLUDED_SELECTOR = [
  "pre",
  "code",
  "script",
  "style",
  "svg",
  "mjx-container",
  "textarea",
  "kbd",
  "samp",
  ".math",
  ".math-block",
  ".math-inline",
  ".MathJax",
  ".frontmatter",
  ".frontmatter-container",
  ".metadata-container",
  ".metadata-content",
  ".metadata-properties",
  ".metadata-property",
  ".metadata-property-key",
  ".metadata-property-value",
  ".metadata-input",
  ".property",
  ".tag",
  ".internal-embed",
  ".markdown-embed",
  ".footnote-link",
  ".block-language-tikz",
  "[data-property-key]",
  ".typesetter-token",
  "[class*='language-tikz']",
  "[contenteditable='true']",
].join(",");

function looksLikeUrl(text: string): boolean {
  return /^(?:https?:\/\/|www\.|mailto:)[^\s]+$/iu.test(text.trim());
}

export function isExcludedTextNode(node: Text): boolean {
  const parent = node.parentElement;
  if (!parent) return true;
  if (parent.closest(EXCLUDED_SELECTOR)) return true;
  const link = parent.closest("a");
  if (link) {
    const visible = node.data.trim();
    if (looksLikeUrl(visible)) return true;
    if (link.classList.contains("tag")) return true;
    const href = link.getAttribute("href");
    if (href && visible === href) return true;
    const internalTarget = link.getAttribute("data-href");
    if (internalTarget && visible === internalTarget) return true;
  }
  return false;
}
