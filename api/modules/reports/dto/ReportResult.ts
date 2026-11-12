/**
 * Mirrors `ReportResult` on the backend: what running a report returns (REPORTS_DESIGN.md § 7). The same
 * shape for every shape of report, so a screen, an export, a publication and the assistant read one thing.
 * Java leaves out what is null, so most of it is optional.
 */

/** A raw id, code, date or number — what a group's key and a cell's value are made of. */
export type ReportRawValue = string | number | boolean | null;

/** A money amount in one currency — money is never summed across currencies. */
export type ReportAmount = {
  currency: string;
  amount: number;
};

/** A measure's value: a number, money per currency, or nothing. */
export type ReportMeasureValue = number | ReportAmount[] | null;

export type ReportColumnKind = "DIMENSION" | "MEASURE" | "FIELD";

export type ReportColumn = {
  key: string;
  label: string;
  /** DIMENSION, MEASURE or FIELD (a TABLE's column). */
  kind: ReportColumnKind;
  type?: string;
  percent?: boolean;
};

/** One value and how it reads. `value` is the raw id, code, date or number. */
export type ReportCell = {
  value?: ReportRawValue;
  label?: string;
};

export type ReportRow = {
  /** The group's identity — its raw dimension values, which the drill-down is asked with. */
  key?: ReportRawValue[];
  /** The group's dimension values, in the order of the definition. */
  dimensions?: ReportCell[];
  /** Each measure's value by its key (`reportMeasureKey`). */
  values?: Record<string, ReportMeasureValue>;
  /** The same measures on the compare-to date. */
  compare?: Record<string, ReportMeasureValue>;
  /** How many people the group holds. */
  people?: number;
  /** The measures left out because the group is too small to show them. */
  suppressed?: string[];
  /** A TABLE row's person. */
  userId?: string;
  /** A TABLE row's columns, by field id. */
  fields?: Record<string, ReportCell>;
};

/** `from`: the first day the field has history; null when it has none at all. */
export type ReportCoverage = {
  field: string;
  from: string | null;
};

export type ReportNarrowing = {
  field: string;
  includedCount: number;
  excludedCount: number;
};

export type ReportResult = {
  shape: string;
  timeMode?: string;
  asOf?: string;
  from?: string;
  to?: string;
  compareTo?: string;
  /** What each position of a row means: the dimensions, then the measures — or a TABLE's columns. */
  columns: ReportColumn[];
  rows: ReportRow[];
  /** The whole population, each person counted once; absent for a TABLE. */
  totals?: ReportRow;
  /** A TABLE's next page. */
  nextCursor?: string;
  /** How many people the report is about. */
  total?: number;
  /** Where history begins for each field the run read on a past date. */
  coverage?: ReportCoverage[];
  /** The fields that narrowed the population to the people the reader may see them on. */
  narrowedBy?: ReportNarrowing[];
  /** Fields of the definition this reader may not use, left out of the result. */
  droppedFields?: string[];
};
