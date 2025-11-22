export type ReorderChange = { id: string; sortOrder: number };
export type SortableItem = { id: string; sortOrder: number };

export const sortBySortOrder = <T extends SortableItem>(items: T[]) =>
  [...items].sort((a, b) => a.sortOrder - b.sortOrder);

export function applyVerticalReorder<T extends SortableItem>(
  previousItems: T[],
  orderedIds: string[]
): { nextItems: T[]; changes: ReorderChange[] } {
  const byId = new Map(previousItems.map(it => [it.id, it]));
  const orderedItems = orderedIds.map(id => byId.get(id)).filter(Boolean) as T[];

  if (orderedItems.length !== previousItems.length) {
    const missing = previousItems.filter(it => !orderedIds.includes(it.id));
    orderedItems.push(...missing);
  }

  const nextItems: T[] = [];
  const changes: ReorderChange[] = [];

  orderedItems.forEach((item, index) => {
    const nextOrder = index + 1;
    if (item.sortOrder !== nextOrder) {
      changes.push({id: item.id, sortOrder: nextOrder});
      nextItems.push({...item, sortOrder: nextOrder} as T);
    } else {
      nextItems.push(item);
    }
  });

  return {nextItems, changes};
}
