/**
 * The hub's document format (COMPANY_HUB_DESIGN.md § 6.1): ProseMirror JSON, carried as a string. These helpers
 * are pure — the editor and the read-only view both lean on them, and neither ever touches HTML.
 */

export type DocMark = { type: string; attrs?: Record<string, unknown> };
export type DocNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: DocNode[];
  marks?: DocMark[];
  text?: string;
};

export const EMPTY_DOC: DocNode = { type: "doc", content: [] };

/** The blocks that carry a stable `id` — the backend allows it on exactly these (`HubDocument.NODE_ATTRS`). */
export const ID_BLOCKS = ["paragraph", "heading", "bulletList", "orderedList", "listItem", "table", "horizontalRule", "blockquote"] as const;
/** The custom nodes declare their own `id`. */
export const ID_NODES = [...ID_BLOCKS, "image", "pageLink"] as const;

const ALPHABET = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** A short random id: eight characters, matching the backend's `^[A-Za-z0-9_-]{1,64}$`. */
export const newBlockId = (): string => {
  let id = "";
  const random = typeof crypto !== "undefined" && "getRandomValues" in crypto ? crypto.getRandomValues(new Uint8Array(8)) : null;
  for (let i = 0; i < 8; i++) id += ALPHABET[(random ? random[i] : Math.floor(Math.random() * 256)) % ALPHABET.length];
  return id;
};

/** Reads a stored body. Anything that is not a document — empty, broken, another shape — reads as an empty one. */
export const parseDoc = (body: string | null | undefined): DocNode => {
  if (!body) return EMPTY_DOC;
  try {
    const parsed: unknown = JSON.parse(body);
    if (parsed && typeof parsed === "object" && (parsed as DocNode).type === "doc") return parsed as DocNode;
  } catch {
    // An unreadable body is shown as empty rather than failing the page.
  }
  return EMPTY_DOC;
};

export const serializeDoc = (doc: DocNode): string => JSON.stringify(doc);

const hasText = (node: DocNode): boolean => {
  if (node.type === "text") return Boolean(node.text?.trim());
  if (["image", "pageLink", "table", "horizontalRule"].includes(node.type)) return true;
  return (node.content ?? []).some(hasText);
};

/** Nothing written: no text, no image, no table, no page link. */
export const isEmptyDoc = (doc: DocNode): boolean => !(doc.content ?? []).some(hasText);

/**
 * Gives every top-level block that can carry one an id, and a fresh one to a block whose id repeats an earlier
 * one (a split paragraph copies its attributes). Returns the same object when nothing changed.
 */
export const withBlockIds = (doc: DocNode): DocNode => {
  const seen = new Set<string>();
  let changed = false;
  const content = (doc.content ?? []).map((block) => {
    if (!(ID_NODES as readonly string[]).includes(block.type)) return block;
    const id = typeof block.attrs?.id === "string" ? (block.attrs.id as string) : "";
    if (id && !seen.has(id)) {
      seen.add(id);
      return block;
    }
    changed = true;
    let next = newBlockId();
    while (seen.has(next)) next = newBlockId();
    seen.add(next);
    return { ...block, attrs: { ...(block.attrs ?? {}), id: next } };
  });
  return changed ? { ...doc, content } : doc;
};

/** `https:`, `mailto:` or a path inside the hub — the backend's `safeHref`, repeated so the view never draws another. */
export const isSafeHref = (href: unknown): href is string => {
  if (typeof href !== "string") return false;
  const h = href.trim();
  if (!h || h.length > 2000) return false;
  const lower = h.toLowerCase();
  return lower.startsWith("https://") || lower.startsWith("mailto:") || /^\/hub(\/[A-Za-z0-9_\-/#?=&.]*)?$/.test(h);
};

/** The plain text of a document — what the "/" placeholder and the tests read. */
export const plainText = (node: DocNode): string => {
  if (node.type === "text") return node.text ?? "";
  if (node.type === "pageLink") return String(node.attrs?.title ?? "");
  return (node.content ?? []).map(plainText).join(node.type === "doc" ? "\n" : "");
};
