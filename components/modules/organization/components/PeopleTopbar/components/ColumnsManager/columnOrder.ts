import type { ColumnItem } from "@/models/userTable";

/**
 * The array order *is* the table's column order, so the picker cannot merely display the chosen
 * columns first — it has to move them. Otherwise the list and the table disagree the moment someone
 * drags a row.
 *
 * Turning a column on puts it at the end of the chosen block, i.e. it appears as the rightmost
 * column: predictable, and it does not shuffle the columns already in place. Turning one off drops
 * it to the top of the rest, next to where it will be looked for again.
 */
export function toggleColumn(
  columns: ColumnItem[],
  id: string,
  checked: boolean,
  pinnedId?: string,
): ColumnItem[] {
  const target = columns.find((c) => c.id === id);
  if (!target || target.checked === checked) return columns;
  if (id === pinnedId) return columns;

  const rest = columns.filter((c) => c.id !== id);
  const moved = { ...target, checked };

  if (checked) {
    const lastChecked = rest.reduce(
      (index, column, i) => (column.checked ? i : index),
      -1,
    );
    return [...rest.slice(0, lastChecked + 1), moved, ...rest.slice(lastChecked + 1)];
  }

  const firstUnchecked = rest.findIndex((c) => !c.checked);
  const at = firstUnchecked === -1 ? rest.length : firstUnchecked;
  return [...rest.slice(0, at), moved, ...rest.slice(at)];
}

/**
 * Reorders the chosen block, leaving everything else where it was.
 *
 * Only chosen columns can be dragged, so a drop says nothing about the others: the pinned column
 * stays first whatever happens, and the unchosen keep their order below.
 */
export function reorderChecked(
  columns: ColumnItem[],
  orderedCheckedIds: string[],
  pinnedId?: string,
): ColumnItem[] {
  const byId = new Map(columns.map((c) => [c.id, c]));
  const placed = new Set<string>();

  const pinned = columns.filter((c) => c.id === pinnedId);
  pinned.forEach((c) => placed.add(c.id));

  const dragged: ColumnItem[] = [];
  for (const id of orderedCheckedIds) {
    const column = byId.get(id);
    if (!column || placed.has(id) || !column.checked) continue;
    dragged.push(column);
    placed.add(id);
  }

  // A chosen column the drop did not mention (filtered out by a search, say) keeps its place after
  // the dragged ones rather than falling out of the table.
  const restChecked = columns.filter((c) => c.checked && !placed.has(c.id));
  const unchecked = columns.filter((c) => !c.checked && !placed.has(c.id));

  return [...pinned, ...dragged, ...restChecked, ...unchecked];
}
