import type { FilterDTO } from "@/models/user/fields";
import type { ExportFormat } from "@/api/utils/exportResponse";
import type { ReportDataset, ReportDefinition, ReportTime } from "./ReportDefinition";

/** Mirrors `ReportDTOs` on the backend: the reports API's requests and answers (REPORTS_DESIGN.md § 11). */

/** What the caller may do with a report. */
export type ReportLevel = "OWNER" | "EDIT" | "VIEW";

export type ReportDTO = {
  id: string;
  name: string;
  description?: string;
  definition: ReportDefinition;
  ownerUserId?: string;
  ownerName?: string;
  level: ReportLevel;
  templateKey?: string;
  templateVersion?: number;
  /** Whether it is shared with anybody — the owner's view of it. */
  shared?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

/** One line of the list — without the definition, which can be long. */
export type ReportSummaryDTO = {
  id: string;
  name: string;
  description?: string;
  shape?: string;
  dataset?: string;
  ownerUserId?: string;
  ownerName?: string;
  level: ReportLevel;
  templateKey?: string;
  updatedAt?: string;
};

export type ReportCreateRequest = {
  name: string;
  description?: string | null;
  definition: ReportDefinition;
};

/** Partial: only what is sent changes. An editor may change the definition; name and description are the owner's. */
export type ReportUpdateRequest = {
  name?: string | null;
  description?: string | null;
  definition?: ReportDefinition | null;
};

/** Overrides on a saved report's run — another date or range, a table's page — without changing what is saved. */
export type ReportRunRequest = {
  time?: ReportTime | null;
  cursor?: string | null;
};

/** An unsaved definition run — the builder, a template tried before applying, the assistant. */
export type ReportRunUnsavedRequest = {
  definition: ReportDefinition;
  cursor?: string | null;
};

/** A cell's people: the definition (saved or not) and the group's key, as the result gave it. */
export type ReportDrilldownRequest = {
  reportId?: string | null;
  definition?: ReportDefinition | null;
  key: (string | number | boolean | null)[];
};

/**
 * The people behind a group, and — when the group can be said as the People table's filters — those
 * filters, so the table opens on a live segment rather than a frozen list.
 */
export type ReportDrilldownDTO = {
  userIds: string[];
  total: number;
  /** More people than `userIds` carries. */
  truncated: boolean;
  filters?: FilterDTO[];
  includeInactive?: boolean;
};

export type ReportFieldType = "TEXT" | "NUMBER" | "DATE" | "MONEY" | "BOOLEAN" | "REF" | "OPTION" | "ENUM" | "OBJECT";

export type ReportRefKind = "DEPARTMENT" | "TEAM" | "OFFICE" | "LEGAL_ENTITY" | "JOB" | "LEVEL" | "PERSON";

export type ReportFieldOption = {
  value: string;
  label: string;
};

/** One field of the catalogue, as this reader may use it. */
export type ReportFieldDTO = {
  id: string;
  label: string;
  type: ReportFieldType;
  multi: boolean;
  ref?: ReportRefKind;
  group?: string;
  groupable: boolean;
  measurable: boolean;
  historic: boolean;
  sensitive: boolean;
  /** COMPANY, or PARTIAL — a field seen on some people narrows the report. */
  reach?: "COMPANY" | "PARTIAL";
  historyFrom?: string;
  options?: ReportFieldOption[];
  buckets?: string[];
};

export type ReportMeasureInput = "NONE" | "NUMERIC" | "NUMERIC_OR_DATE";

/** STOCK is true on a date (headcount); FLOW happens in a range (hires). */
export type ReportMeasureKind = "STOCK" | "FLOW";

export type ReportMeasureDTO = {
  id: string;
  label: string;
  input: ReportMeasureInput;
  kind: ReportMeasureKind;
  percent: boolean;
};

/** `GET /reports/datasets` — a dataset's fields and measures, as this reader may use them. */
export type ReportDatasetDTO = {
  dataset: ReportDataset;
  fields: ReportFieldDTO[];
  measures: ReportMeasureDTO[];
};

/**
 * The body of both exports. `definition` only for an unsaved one; `format` is set by the route from the
 * query string, as for every other export.
 */
export type ReportExportRequest = {
  definition?: ReportDefinition | null;
  time?: ReportTime | null;
  format: ExportFormat;
};

/**
 * `GET /reports/templates` — a report template made concrete for this company: its definition with this
 * company's fields, ready for `POST /reports/run`, or why it cannot work here. Applying one is
 * `POST /templates/{key}/apply`, as for every template.
 */
export type ReportTemplateDTO = {
  key: string;
  version: number;
  ref: string;
  title: string;
  summary: string;
  name: string;
  description: string | null;
  /** Null when the template cannot work in this company. */
  definition: ReportDefinition | null;
  /** The template's fields this company does not have. */
  dropped: string[];
};
