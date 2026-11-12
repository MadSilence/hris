import { Extension, Node, mergeAttributes, type AnyExtension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import { Placeholder } from "@tiptap/extensions";
import { hubFileUrl } from "@/models/hub";
import { ID_BLOCKS, isSafeHref, newBlockId } from "./doc";

/*
 * The hub's editor schema (CH5: TipTap, every package MIT). It is the backend's whitelist (`HubDocument`), node
 * for node and attribute for attribute: a TipTap default the backend does not know — a link's `title`, a cell's
 * `align`, an image's `src` — is taken out here, because the backend refuses a body rather than cleaning it.
 */

/** Every top-level block keeps a stable `id` (§ 7.3 compares revisions by it); a new or split block gets a fresh one. */
export const BlockId = Extension.create({
  name: "hubBlockId",
  addGlobalAttributes() {
    return [
      {
        types: [...ID_BLOCKS],
        attributes: {
          id: {
            default: null,
            keepOnSplit: false,
            parseHTML: (element: HTMLElement) => element.getAttribute("data-block-id"),
            renderHTML: (attributes: Record<string, unknown>) =>
              attributes.id ? { "data-block-id": String(attributes.id) } : {},
          },
        },
      },
    ];
  },
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("hubBlockId"),
        appendTransaction: (transactions, _old, state) => {
          if (!transactions.some((tr) => tr.docChanged)) return null;
          const tr = state.tr;
          const seen = new Set<string>();
          let changed = false;
          state.doc.forEach((node, offset) => {
            if (!("id" in node.attrs)) return;
            const id = typeof node.attrs.id === "string" ? node.attrs.id : "";
            if (id && !seen.has(id)) {
              seen.add(id);
              return;
            }
            let next = newBlockId();
            while (seen.has(next)) next = newBlockId();
            seen.add(next);
            tr.setNodeMarkup(offset, undefined, { ...node.attrs, id: next });
            changed = true;
          });
          if (!changed) return null;
          tr.setMeta("addToHistory", false);
          return tr;
        },
      }),
    ];
  },
});

/** A link to a handbook page, inline in the text: `pageId`, the title when it was linked, and an id. */
export const PageLink = Node.create({
  name: "pageLink",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,
  addAttributes() {
    return {
      pageId: { default: null, parseHTML: (el: HTMLElement) => el.getAttribute("data-page-id") },
      title: { default: null, parseHTML: (el: HTMLElement) => el.getAttribute("data-title") },
      id: { default: null, parseHTML: () => null, renderHTML: () => ({}) },
    };
  },
  parseHTML() {
    return [{ tag: "a[data-page-id]" }];
  },
  renderHTML({ node, HTMLAttributes }) {
    return [
      "a",
      mergeAttributes(HTMLAttributes, {
        href: `/hub/handbook/${String(node.attrs.pageId ?? "")}`,
        "data-page-id": node.attrs.pageId,
        "data-title": node.attrs.title,
        class: "hub-page-link",
      }),
      String(node.attrs.title ?? ""),
    ];
  },
  renderText({ node }) {
    return String(node.attrs.title ?? "");
  },
});

/** An image is a hub file, never an address: `fileId`, read through the session-bound route. */
export const HubImage = Node.create({
  name: "image",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      fileId: { default: null, parseHTML: (el: HTMLElement) => el.getAttribute("data-file-id") },
      alt: { default: null },
      title: { default: null },
      id: { default: null, parseHTML: (el: HTMLElement) => el.getAttribute("data-block-id"), renderHTML: () => ({}) },
    };
  },
  parseHTML() {
    return [{ tag: "img[data-file-id]" }];
  },
  renderHTML({ node, HTMLAttributes }) {
    const fileId = String(node.attrs.fileId ?? "");
    return ["img", mergeAttributes(HTMLAttributes, { src: fileId ? hubFileUrl(fileId) : "", "data-file-id": fileId, class: "hub-image" })];
  },
});

/** The link mark without `title`, which the backend does not accept; only https, mailto and hub paths. */
const HubLink = Link.extend({
  addAttributes() {
    const parent = (this.parent?.() ?? {}) as Record<string, unknown>;
    const { title: _title, ...rest } = parent;
    return rest;
  },
}).configure({
  openOnClick: false,
  autolink: true,
  defaultProtocol: "https",
  protocols: ["https", "mailto"],
  isAllowedUri: (url) => isSafeHref(url),
});

/** A cell without `align`, which the backend does not accept. */
const withoutAlign = <T extends typeof TableCell | typeof TableHeader>(node: T) =>
  node.extend({
    addAttributes() {
      const parent = (this.parent?.() ?? {}) as Record<string, unknown>;
      const { align: _align, ...rest } = parent;
      return rest;
    },
  });

export type HubDocKind = "POST" | "PAGE";

/**
 * The extensions of one editor. A post is the subset (text, headings, lists, links, page links); a page has
 * everything — images, tables, dividers and quotes.
 */
export const hubExtensions = (kind: HubDocKind, placeholder: string): AnyExtension[] => {
  const page = kind === "PAGE";
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
      code: false,
      codeBlock: false,
      underline: false,
      link: false,
      blockquote: page ? {} : false,
      horizontalRule: page ? {} : false,
      trailingNode: page ? {} : false,
    }),
    HubLink,
    Highlight,
    PageLink,
    BlockId,
    Placeholder.configure({ placeholder, showOnlyCurrent: true }),
    ...(page ? [HubImage, Table.configure({ resizable: false }), TableRow, withoutAlign(TableHeader), withoutAlign(TableCell)] : []),
  ];
};
