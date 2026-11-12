import type { ReportDefinition } from "./ReportDefinition";

/** Mirrors `ReportDriversService` on the backend: a measure's change broken down by every dimension the caller may use (§ 10). */

/** Exactly one of `reportId` and `definition`; `from` must be before `to`. */
export type ReportDriversRequest = {
  reportId?: string | null;
  definition?: ReportDefinition | null;
  /** The measure's key or id; the definition's first measure when absent. */
  measure?: string | null;
  from: string;
  to: string;
};

/** One group's part in the change. */
export type ReportContributionDTO = {
  value: string | number | boolean | null;
  label: string | null;
  before: number;
  after: number;
  delta: number;
};

export type ReportDriverDTO = {
  field: string;
  label: string;
  top: ReportContributionDTO[];
};

/**
 * `before`: the measure over everyone at the start (a stock) or over the previous range (a flow);
 * `after`: the same at the end, or over the range.
 */
export type ReportDriversDTO = {
  measure: string;
  label: string;
  from: string;
  to: string;
  previousFrom: string | null;
  before: number | null;
  after: number | null;
  delta: number | null;
  drivers: ReportDriverDTO[];
};
