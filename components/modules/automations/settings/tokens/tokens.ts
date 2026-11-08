/**
 * A text with field tokens, as stored: plain text where `{name}` is a placeholder (hris-api `Placeholders`). The field
 * draws a token as a chip; the stored value stays `{name}` text (plan batch 10, answering NEED_TO_DISCUSS § 32 Q2 by
 * keeping the storage). Pure: no React, no DOM.
 */
export type Piece = { kind: "text"; text: string } | { kind: "token"; name: string };

const TOKEN = /\{([A-Za-z][A-Za-z0-9_]*)\}/g;

export const parseTokens = (value: string | null | undefined): Piece[] => {
  const s = value ?? "";
  const out: Piece[] = [];
  let last = 0;
  for (const m of s.matchAll(TOKEN)) {
    const at = m.index ?? 0;
    if (at > last) out.push({ kind: "text", text: s.slice(last, at) });
    out.push({ kind: "token", name: m[1] });
    last = at + m[0].length;
  }
  if (last < s.length) out.push({ kind: "text", text: s.slice(last) });
  return out;
};

export const serializeTokens = (pieces: Piece[]): string =>
  pieces.map((p) => (p.kind === "text" ? p.text : `{${p.name}}`)).join("");

/** The names a text uses, in order, once each. */
export const tokenNames = (value: string | null | undefined): string[] => [
  ...new Set(parseTokens(value).flatMap((p) => (p.kind === "token" ? [p.name] : []))),
];

/** The text with each token replaced by its label — for one-line words ("Book the review with First name"). */
export const tokensAsWords = (value: string | null | undefined, label: (name: string) => string): string =>
  parseTokens(value)
    .map((p) => (p.kind === "text" ? p.text : label(p.name)))
    .join("");

/** What the DOM of the field says, as stored text: a token element is `{name}`, a line break or a new block is "\n". */
export const readEditable = (root: Node): string => {
  let out = "";
  const walk = (node: Node) => {
    node.childNodes.forEach((child) => {
      if (child.nodeType === 3) {
        out += (child.nodeValue ?? "").replace(/​/g, "");
        return;
      }
      if (child.nodeType !== 1) return;
      const el = child as HTMLElement;
      const token = el.getAttribute("data-token");
      if (token) {
        out += `{${token}}`;
        return;
      }
      if (el.tagName === "BR") {
        out += "\n";
        return;
      }
      const block = el.tagName === "DIV" || el.tagName === "P";
      if (block && out.length > 0 && !out.endsWith("\n")) out += "\n";
      walk(el);
    });
  };
  walk(root);
  return out;
};
