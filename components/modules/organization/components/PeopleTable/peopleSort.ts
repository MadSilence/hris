import type { FieldDTO } from "@/models/user/fields";

/**
 * What the People table can be ordered by. One answer for the header, the saved views and the share
 * link — and it is the backend's: `GET /users/fields` marks each field `sortable`, computed from
 * `ALLOWED_SORT_FIELDS` and `AttributeSortKey` in the same place that executes the sort. This file
 * used to keep its own two copies of those lists; a copy that drifted showed a header that sorted by
 * the surname instead (the search falls back to `last_name` silently for a key it does not know).
 */
type SortableMeta = Pick<FieldDTO, "sortable">;

/**
 * The sort key a column's header sends, or null when the column does not sort.
 *
 * A system column sorts by its bare key (`hire_date`); a custom attribute by its full column id
 * (`attr:<uuid>`), which is what the backend reads as "join this attribute". Without the field's
 * metadata the header stays inert rather than offering a sort that would fall back to the surname.
 */
export function sortKeyForColumn(columnId: string, meta?: SortableMeta | null): string | null {
  if (!meta?.sortable) return null;
  if (columnId.startsWith("sys:")) return columnId.slice(4);
  if (columnId.startsWith("attr:")) return columnId;
  return null;
}

/**
 * Whether a saved sort still applies for this reader: the field must be among the fields they may see
 * as a column (`visibleFields`) and still sort. An attribute the reader cannot see is refused by the
 * backend (SG00005), because the order of the rows would read the hidden value out.
 */
export function isSortKeyAvailable(sortKey: string, visibleFields: FieldDTO[]): boolean {
  const columnId = sortKey.startsWith("attr:") ? sortKey : `sys:${sortKey}`;
  const field = visibleFields.find((f) => f.id === columnId);
  return !!field && sortKeyForColumn(field.id, field) === sortKey;
}
