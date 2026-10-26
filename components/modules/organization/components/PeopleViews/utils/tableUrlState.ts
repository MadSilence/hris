import type { FilterDTO } from "@/models/user/fields";
import type { ViewPayload, ViewSort } from "@/models/peopleView";

/**
 * The People table's state in the page's own URL, so "send me what you are looking at" is a plain link
 * (PLATFORM_PLAN 4.7 — the share-by-token link this replaces was retired with it).
 *
 * The link carries a definition, never data, and never anybody's access: whoever opens it gets the
 * table under their own, because the reader applies it through `applyPayload` like any saved view —
 * a column they may not see is dropped, and the rows come from `/users/search` under their own scope.
 *
 * Only what differs from the table's default is written, so an untouched table has a clean address:
 *
 * | param    | holds                                   |
 * |----------|-----------------------------------------|
 * | `cols`   | column ids in order, comma-separated    |
 * | `f`      | the filters, as JSON                    |
 * | `sort`   | `<sort key>:<asc or desc>`              |
 * | `q`      | the search box                          |
 * | `drafts` | `1` while the Drafts segment is open    |
 */
export type TableUrlState = {
  columns: string[] | null;
  filters: FilterDTO[];
  sort: ViewSort | undefined;
  q: string;
  drafts: boolean;
};

export const TABLE_URL_PARAMS = ["cols", "f", "sort", "q", "drafts"] as const;

type ReadableParams = Pick<URLSearchParams, "get">;

export type TableStateDefaults = {
  columns: string[];
  sort: ViewSort;
};

const sameList = (a: string[], b: string[]) => a.length === b.length && a.every((v, i) => v === b[i]);

const sameSort = (a: ViewSort, b: ViewSort) =>
  (a?.fieldId ?? null) === (b?.fieldId ?? null) && (a?.dir ?? null) === (b?.dir ?? null);

/**
 * Writes the table's state into `base` (other params are kept as they are) and returns the query
 * string, without the leading `?`. A part equal to the default is removed rather than written.
 */
export function encodeTableState(
  state: { columns: string[]; filters: FilterDTO[]; sort: ViewSort; q: string; drafts: boolean },
  defaults: TableStateDefaults,
  base?: ReadableParams & { toString(): string },
): string {
  const params = new URLSearchParams(base ? base.toString() : "");
  TABLE_URL_PARAMS.forEach((p) => params.delete(p));

  if (!sameList(state.columns, defaults.columns)) params.set("cols", state.columns.join(","));
  if (state.filters.length) params.set("f", JSON.stringify(state.filters));
  if (!sameSort(state.sort, defaults.sort)) {
    params.set("sort", state.sort ? `${state.sort.fieldId}:${state.sort.dir}` : "none");
  }
  const q = state.q.trim();
  if (q) params.set("q", q);
  if (state.drafts) params.set("drafts", "1");
  return params.toString();
}

const isFilter = (value: unknown): value is FilterDTO =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as { field?: unknown }).field === "string" &&
  typeof (value as { op?: unknown }).op === "string";

/**
 * Reads the table's state back. A part that is absent or does not parse is `null` / `undefined` /
 * empty — the table keeps its default for it rather than refusing the whole link.
 */
export function decodeTableState(params: ReadableParams): TableUrlState {
  const rawCols = params.get("cols");
  const columns = rawCols
    ? rawCols.split(",").map((c) => c.trim()).filter(Boolean)
    : null;

  let filters: FilterDTO[] = [];
  const rawFilters = params.get("f");
  if (rawFilters) {
    try {
      const parsed: unknown = JSON.parse(rawFilters);
      if (Array.isArray(parsed)) filters = parsed.filter(isFilter);
    } catch {
      filters = [];
    }
  }

  let sort: ViewSort | undefined;
  const rawSort = params.get("sort");
  if (rawSort === "none") {
    sort = null;
  } else if (rawSort) {
    const at = rawSort.lastIndexOf(":");
    const fieldId = at > 0 ? rawSort.slice(0, at) : "";
    const dir = at > 0 ? rawSort.slice(at + 1) : "";
    if (fieldId && (dir === "asc" || dir === "desc")) sort = { fieldId, dir };
  }

  return {
    columns,
    filters,
    sort,
    q: params.get("q") ?? "",
    drafts: params.get("drafts") === "1",
  };
}

/** Whether the URL says anything about the table at all. */
export function hasTableState(params: ReadableParams): boolean {
  return TABLE_URL_PARAMS.some((p) => params.get(p) !== null);
}

/** The URL's state as a view definition, with the defaults filled in where the URL is silent. */
export function urlStateToPayload(state: TableUrlState, defaults: TableStateDefaults): ViewPayload {
  return {
    columns: state.columns ?? defaults.columns,
    filters: state.filters,
    sort: state.sort === undefined ? defaults.sort : state.sort,
  };
}
