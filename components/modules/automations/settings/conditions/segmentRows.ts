import type { FilterDTO } from "@/models/user/fields";
import type { Segment } from "@/models/segment/Segment";
import { isNegativeOperator, type AudienceOperator } from "@/components/audience/fieldCatalog";

/**
 * One condition of the builder while it is being written. The `Segment` DSL is a flat list of filters that all must
 * hold (hris-api `SegmentDTO`: `filters`, AND) — no OR between filters and no nested groups; "Poland or Lithuania" is
 * one filter with `in`. So the builder is a list of rows joined by "and", and a row becomes a filter only once it is
 * complete. Pure: no React.
 */
export type ConditionRow = {
  id: number;
  key: string;
  op: AudienceOperator | null;
  value: string;
  valueTo: string;
  values: string[];
  includeEmpty: boolean;
};

export const isMultiOp = (op: AudienceOperator | null): boolean =>
  op === "in" || op === "has_any" || op === "not_in" || op === "not_has_any";
export const isRangeOp = (op: AudienceOperator | null): boolean => op === "between";

let seq = 1;
export const nextRowId = (): number => seq++;

export const blankRow = (): ConditionRow => ({
  id: nextRowId(),
  key: "",
  op: null,
  value: "",
  valueTo: "",
  values: [],
  includeEmpty: false,
});

export const rowComplete = (r: ConditionRow): boolean => {
  if (!r.key || !r.op) return false;
  if (isMultiOp(r.op)) return r.values.length > 0;
  if (isRangeOp(r.op)) return r.value.trim().length > 0 && r.valueTo.trim().length > 0;
  return r.value.trim().length > 0;
};

export const rowToFilter = (r: ConditionRow): FilterDTO => {
  const op = r.op as AudienceOperator;
  // Only an exclusion carries `includeEmpty`, so a positive filter's payload stays as it always was.
  const base: FilterDTO = isNegativeOperator(op) ? { field: r.key, op, includeEmpty: r.includeEmpty } : { field: r.key, op };
  if (isMultiOp(op)) return { ...base, values: r.values };
  if (isRangeOp(op)) return { ...base, value: r.value, valueTo: r.valueTo };
  return { ...base, value: r.value };
};

export const filterToRow = (f: FilterDTO): ConditionRow => ({
  id: nextRowId(),
  key: f.field,
  op: f.op,
  value: f.value ?? "",
  valueTo: f.valueTo ?? "",
  values: f.values ?? [],
  includeEmpty: f.includeEmpty === true,
});

export const rowsFromSegment = (segment: Segment | null): ConditionRow[] => (segment?.filters ?? []).map(filterToRow);

/**
 * The segment the rows say, keeping what the builder does not edit (excluded people, inactive, drafts). Null when
 * nothing is left — "no condition" — unless the base still excludes somebody.
 */
export const segmentFromRows = (rows: ConditionRow[], base: Segment | null): Segment | null => {
  const filters = rows.filter(rowComplete).map(rowToFilter);
  const excluded = base?.excludeUserIds ?? [];
  if (filters.length === 0 && excluded.length === 0) return null;
  return { ...(base ?? { excludeUserIds: [] }), filters, excludeUserIds: excluded };
};

/** The same filters in the same order — what tells an outside change from the echo of our own. */
export const sameFilters = (a: Segment | null, b: Segment | null): boolean =>
  JSON.stringify(a?.filters ?? []) === JSON.stringify(b?.filters ?? []);
