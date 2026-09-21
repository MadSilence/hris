import type { FieldDTO, FilterDTO } from "@/models/user/fields";
import type { ColumnItem } from "@/models/userTable";
import type { ViewPayload, ViewSort } from "@/models/peopleView";
import { isSortKeyAvailable } from "@/components/modules/organization/components/PeopleTable/peopleSort";

const PINNED_COLUMN_ID = "sys:first_name";

export function extractPayload(
  visibleColumns: ColumnItem[],
  filters: FilterDTO[],
  sort: ViewSort,
): ViewPayload {
  return {
    columns: visibleColumns.map((c) => c.id),
    filters: filters ?? [],
    sort: sort ?? null,
  };
}

export type AppliedView = {
  columns: ColumnItem[];
  filters: FilterDTO[];
  sort: ViewSort;
  dropped: number;
};

export function applyPayload(payload: ViewPayload, visibleFields: FieldDTO[]): AppliedView {
  const byId = new Map(visibleFields.map((f) => [f.id, f]));

  const toCol = (f: FieldDTO, checked: boolean): ColumnItem => ({
    id: f.id,
    label: f.label ?? f.key ?? f.id,
    checked,
    group: f.isSystem ? "system" : "other",
  });

  const wanted = (payload.columns ?? []).filter((id) => byId.has(id));
  const wantedSet = new Set(wanted);
  const droppedCols = (payload.columns ?? []).length - wanted.length;

  const columns: ColumnItem[] = [];
  for (const id of wanted) columns.push(toCol(byId.get(id)!, true));
  for (const f of visibleFields) if (!wantedSet.has(f.id)) columns.push(toCol(f, false));

  const pinned = columns.find((c) => c.id === PINNED_COLUMN_ID);
  if (pinned) pinned.checked = true;

  const keptFilters = (payload.filters ?? []).filter((f) => {
    if (!f?.field) return false;
    if (f.field.startsWith("attr:")) return byId.has(f.field);
    return true;
  });
  const droppedFilters = (payload.filters ?? []).length - keptFilters.length;

  // The table's own list of sortable columns, not a copy — the copy was six columns long and dropped
  // a saved sort by hire date. An attribute sort needs the field among the reader's visible ones.
  const sort =
    payload.sort && isSortKeyAvailable(payload.sort.fieldId, visibleFields) ? payload.sort : null;
  const droppedSort = payload.sort && !sort && payload.sort.fieldId.startsWith("attr:") ? 1 : 0;

  return {
    columns,
    filters: keptFilters,
    sort,
    dropped: droppedCols + droppedFilters + droppedSort,
  };
}

export function payloadsEqual(a: ViewPayload | null, b: ViewPayload | null): boolean {
  if (!a || !b) return false;
  const norm = (p: ViewPayload) =>
    JSON.stringify({ columns: p.columns ?? [], filters: p.filters ?? [], sort: p.sort ?? null });
  return norm(a) === norm(b);
}
