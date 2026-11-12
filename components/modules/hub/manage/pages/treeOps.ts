import type { MoveRequest, ReorderRequest, TreePage, TreeSection } from "@/models/hub";

/*
 * The page tree's drag and drop (CM03) as pure moves: what the tree looks like after a drop, and the one request
 * that tells the backend. A page moved within its section is a reorder of that section's ids; into another section
 * it is a move with its new position; a section moved among sections is a reorder with no section.
 */

export type DragId = `section:${string}` | `page:${string}` | `drop:${string}`;

export const sectionDragId = (id: string): DragId => `section:${id}`;
export const pageDragId = (id: string): DragId => `page:${id}`;
export const dropDragId = (sectionId: string): DragId => `drop:${sectionId}`;

export const parseDragId = (id: string | number | null | undefined): { kind: "section" | "page" | "drop"; id: string } | null => {
  if (typeof id !== "string") return null;
  const at = id.indexOf(":");
  if (at < 0) return null;
  const kind = id.slice(0, at);
  if (kind !== "section" && kind !== "page" && kind !== "drop") return null;
  return { kind, id: id.slice(at + 1) };
};

const arrayMove = <T,>(list: T[], from: number, to: number): T[] => {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

export type SectionMove = { sections: TreeSection[]; request: ReorderRequest };

/** A section dropped on another: it takes that one's place. Null when nothing moves. */
export const moveSection = (sections: TreeSection[], activeId: string, overId: string): SectionMove | null => {
  const from = sections.findIndex((s) => s.id === activeId);
  const to = sections.findIndex((s) => s.id === overId);
  if (from < 0 || to < 0 || from === to) return null;
  const next = arrayMove(sections, from, to);
  return { sections: next, request: { sectionId: null, ids: next.map((s) => s.id) } };
};

export type PageMove =
  | { kind: "reorder"; sections: TreeSection[]; request: ReorderRequest }
  | { kind: "move"; sections: TreeSection[]; request: MoveRequest; pageId: string; from: { sectionId: string; position: number } };

export const findPage = (sections: TreeSection[], pageId: string): { section: TreeSection; index: number; page: TreePage } | null => {
  for (const section of sections) {
    const index = section.pages.findIndex((p) => p.id === pageId);
    if (index >= 0) return { section, index, page: section.pages[index] };
  }
  return null;
};

/**
 * A page dropped at `index` of `targetSectionId` (null index: the end — a drop on the section's own row). Null when
 * it lands where it was.
 */
export const movePage = (sections: TreeSection[], pageId: string, targetSectionId: string, index: number | null): PageMove | null => {
  const found = findPage(sections, pageId);
  const target = sections.find((s) => s.id === targetSectionId);
  if (!found || !target) return null;

  if (found.section.id === target.id) {
    const to = index === null ? target.pages.length - 1 : Math.min(index, target.pages.length - 1);
    if (to === found.index) return null;
    const pages = arrayMove(target.pages, found.index, to);
    return {
      kind: "reorder",
      sections: sections.map((s) => (s.id === target.id ? { ...s, pages } : s)),
      request: { sectionId: target.id, ids: pages.map((p) => p.id) },
    };
  }

  const position = index === null ? target.pages.length : Math.max(0, Math.min(index, target.pages.length));
  const pages = [...target.pages];
  pages.splice(position, 0, found.page);
  return {
    kind: "move",
    pageId,
    from: { sectionId: found.section.id, position: found.index },
    sections: sections.map((s) => {
      if (s.id === found.section.id) return { ...s, pages: s.pages.filter((p) => p.id !== pageId) };
      if (s.id === target.id) return { ...s, pages };
      return s;
    }),
    request: { sectionId: target.id, position },
  };
};

/** The next colour no section uses yet, in the package's order; when all are used, the first. */
export const nextFreeColor = (used: (string | null)[], palette: readonly string[]): string =>
  palette.find((c) => !used.includes(c)) ?? palette[0];

/** The tree filtered by a page title; a section stays when its name or any of its pages matches. */
export const filterTree = (sections: TreeSection[], query: string): TreeSection[] => {
  const q = query.trim().toLocaleLowerCase();
  if (!q) return sections;
  return sections
    .map((s) =>
      s.name.toLocaleLowerCase().includes(q) ? s : { ...s, pages: s.pages.filter((p) => p.title.toLocaleLowerCase().includes(q)) },
    )
    .filter((s) => s.name.toLocaleLowerCase().includes(q) || s.pages.length > 0);
};
