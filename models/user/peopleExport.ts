import type { DraftVisibility, FilterDTO } from "@/models/user/fields";

export type PeopleExportFormat = "csv" | "xlsx";

/**
 * The body of `POST /users/export`: the People table's current view.
 *
 * `columns` are field ids in the table's order. They are a request, not a grant — the backend drops
 * any column the caller may not read, and with `allColumns` it takes every readable column, these
 * first.
 */
export type PeopleExportRequest = {
  q?: string | null;
  sortField?: string | null;
  sortDir?: "asc" | "desc" | null;
  filters?: FilterDTO[] | null;
  drafts?: DraftVisibility | null;
  columns: string[];
  allColumns: boolean;
  format: PeopleExportFormat;
};
