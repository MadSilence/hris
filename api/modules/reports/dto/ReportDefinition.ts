import type { FilterDTO } from "@/models/user/fields";

/**
 * Mirrors `ReportDefinition` on the backend: what a report is — stored whole, sent whole to
 * `/reports/run` (REPORTS_DESIGN.md § 4). Java validates it before saving or running; nothing here is
 * trusted until then. Every part is optional on the wire: Java fills the defaults (PEOPLE, live, no filters).
 */
export type ReportDataset = "PEOPLE" | "TIME_OFF" | "ATTENDANCE" | "LIFECYCLE" | "REVIEWS";

export type ReportShape = "TABLE" | "AGGREGATE" | "SERIES" | "FLOW";

/** Continuous values made into a dimension. The bands are fixed lists in Java, not configuration. */
export type ReportBucket = "MONTH" | "QUARTER" | "YEAR" | "TENURE_BANDS" | "AGE_BANDS" | "NUMBER_RANGES";

export type ReportTimeMode = "LIVE" | "AS_OF" | "RANGE";

export type ReportStep = "WEEK" | "MONTH" | "QUARTER" | "YEAR";

/** A date a saved report keeps meaning: "the end of last month" is a different day each month. */
export type ReportRelativeDate =
  | "TODAY"
  | "END_OF_LAST_MONTH"
  | "END_OF_LAST_QUARTER"
  | "END_OF_LAST_YEAR"
  | "START_OF_THIS_YEAR"
  | "SAME_DATE_LAST_YEAR"
  | "SAME_DATE_LAST_MONTH";

/** Who the report is about: the People table's filters. */
export type ReportPopulation = {
  filters?: FilterDTO[] | null;
  includeInactive?: boolean | null;
};

/** `edges`: for NUMBER_RANGES, ascending boundaries, each the start of a range. */
export type ReportDimension = {
  field: string;
  bucket?: ReportBucket | null;
  edges?: number[] | null;
};

/** `id` from the dataset's catalogue (`headcount`, `avg`, …); `field` for those taken over a field. */
export type ReportMeasure = {
  id: string;
  field?: string | null;
};

/** A date, fixed (`YYYY-MM-DD`) or relative; exactly one of the two. */
export type ReportDateRef = {
  date?: string | null;
  relative?: ReportRelativeDate | null;
};

export type ReportRange = {
  from?: ReportDateRef | null;
  to?: ReportDateRef | null;
  step?: ReportStep | null;
};

/** `compareTo`: a second date the same report is run on, shown beside it. */
export type ReportTime = {
  mode?: ReportTimeMode | null;
  asOf?: ReportDateRef | null;
  range?: ReportRange | null;
  compareTo?: ReportDateRef | null;
};

export type ReportSortDirection = "ASC" | "DESC";

/** `by`: `measure:<key>`, `dimension:<index>` or a column's field id. */
export type ReportSort = {
  by: string;
  dir?: ReportSortDirection | null;
};

/** A hint for the screen; the engine never reads it. */
export type ReportChart = {
  type?: string | null;
};

export type ReportDefinition = {
  definitionVersion?: number | null;
  dataset?: ReportDataset | null;
  population?: ReportPopulation | null;
  shape?: ReportShape | null;
  /** A TABLE's columns, field ids. */
  columns?: string[] | null;
  /** Up to two dimensions. */
  groupBy?: ReportDimension[] | null;
  measures?: ReportMeasure[] | null;
  time?: ReportTime | null;
  sort?: ReportSort[] | null;
  limit?: number | null;
  chart?: ReportChart | null;
};

/** How a measure is named in a result: `avg:attr:…`, or the id alone — `ReportDefinition.Measure.key()`. */
export const reportMeasureKey = (measure: ReportMeasure): string =>
  measure.field ? `${measure.id}:${measure.field}` : measure.id;
