/**
 * Something archived under the record being restored, which may come back with it.
 *
 * One shape for the three callers: a job family's positions (flat — `parentId` null, `depth` 1) and a
 * department's or team's sub-units (a tree, listed parents before children).
 */
export type RestoreChild = {
  id: string;
  name: string;
  /** Shown muted after the name — a position's code. */
  detail?: string | null;
  /** The sub-unit above it; null, or an id outside the list, when it sits right under the restored record. */
  parentId: string | null;
  /** 1 = directly under the restored record. */
  depth: number;
  archivedAt: string | null;
  /** True when archiving the parent took it along; false when it was archived on its own. */
  archivedWithParent: boolean;
};

const byId = (items: RestoreChild[]) => new Map(items.map((item) => [item.id, item]));

/** The archived ancestors of `id` inside the list, nearest first. */
const ancestorsOf = (index: Map<string, RestoreChild>, id: string): string[] => {
  const result: string[] = [];
  const seen = new Set<string>([id]);
  let parentId = index.get(id)?.parentId ?? null;
  while (parentId && index.has(parentId) && !seen.has(parentId)) {
    result.push(parentId);
    seen.add(parentId);
    parentId = index.get(parentId)?.parentId ?? null;
  }
  return result;
};

/**
 * What is ticked when the dialog opens: whatever the cascade took along, unless something above it
 * was archived on its own and therefore starts unticked — a child cannot come back without its parent,
 * so pre-ticking it would open the dialog on a choice the backend refuses.
 */
export const initialSelection = (items: RestoreChild[]): Set<string> => {
  const index = byId(items);
  return new Set(
    items
      .filter((item) => item.archivedWithParent)
      .filter((item) => ancestorsOf(index, item.id).every((ancestor) => index.get(ancestor)?.archivedWithParent))
      .map((item) => item.id),
  );
};

/**
 * The tree rule. Ticking something ticks every archived ancestor up to the restored record, and
 * unticking something unticks everything below it — so no choice made here can leave a sub-unit
 * restored under a parent that stays archived.
 */
export const toggleSelection = (
  items: RestoreChild[],
  selected: ReadonlySet<string>,
  id: string,
  checked: boolean,
): Set<string> => {
  const index = byId(items);
  const next = new Set(selected);

  if (checked) {
    next.add(id);
    ancestorsOf(index, id).forEach((ancestor) => next.add(ancestor));
    return next;
  }

  next.delete(id);
  items
    .filter((item) => ancestorsOf(index, item.id).includes(id))
    .forEach((item) => next.delete(item.id));
  return next;
};
