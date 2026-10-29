/**
 * People import, as the backend answers it after every step (`PeopleImportDTO.java`). The page keeps
 * no state of its own: a reload lands on the step `status` says.
 */
export type PeopleImportStatus =
  | "UPLOADED"
  | "MAPPED"
  | "CHECKED"
  | "APPLYING"
  | "COMPLETED"
  | "COMPLETED_WITH_FAILURES"
  | "FAILED"
  | "DISCARDED";

/** What the file brings in (IMPORT_NEXT_DESIGN.md § 3.5). */
export type PeopleImportKind = "PEOPLE_CREATE" | "ORG_STRUCTURE" | "LEAVE_BALANCES";

export type PeopleImportDateFormat = "ISO" | "DMY_DOT" | "DMY_SLASH" | "MDY_SLASH";

export type PeopleImportDecimalSeparator = "DOT" | "COMMA";

export type PeopleImportFieldDTO = {
  id: string;
  header: string;
  required: boolean;
};

export type PeopleImportFileErrorDTO = {
  code: string;
  params: string[];
  rows: number[];
};

export type PeopleImportDTO = {
  id: string;
  kind: PeopleImportKind;
  /** Sent back with every edit of the preview; a stale one is refused (IMP00113). */
  version: number;
  fileName: string;
  fileFormat: "CSV" | "XLSX";
  status: PeopleImportStatus;
  headers: string[];
  /** Column index (as text) â field id. A column left out is not imported. */
  mapping: Record<string, string>;
  dateFormat: PeopleImportDateFormat;
  decimalSeparator: PeopleImportDecimalSeparator;
  inviteAfter: boolean;
  rowCount: number;
  errorRowCount: number;
  startLaterCount: number;
  withoutEmailCount: number;
  createdCount: number;
  failedCount: number;
  invitedCount: number;
  processedCount: number;
  /** Balances already at their target when the file was applied. */
  unchangedCount: number;
  /** The Confirm step's numbers only this kind has: `departments`, `teams`; `toSet`, `unchanged`. */
  summary: Record<string, number>;
  fileErrors: PeopleImportFileErrorDTO[];
  errorDetail: string | null;
  /** What this caller may map a column to, in template order. */
  fields: PeopleImportFieldDTO[];
  /** The text-date choices, each with the fourth of March 2026 written that way. */
  dateFormats: { value: PeopleImportDateFormat; example: string }[];
  canInvite: boolean;
  createdAt: string;
  checkedAt: string | null;
  finishedAt: string | null;
  /** Who last changed a row in the preview editor, and when. */
  lastEditedByName: string | null;
  lastEditedAt: string | null;
};

export type PeopleImportCellErrorDTO = {
  /** The column index, or null when the error belongs to the row as a whole. */
  column: number | null;
  columnHeader: string | null;
  code: string;
  params: string[];
};

export type PeopleImportRowDTO = {
  rowNumber: number;
  name: string | null;
  status: "PENDING" | "CREATED" | "UNCHANGED" | "FAILED";
  userId: string | null;
  /** What the row created or changed: an org unit, a balance. */
  objectId: string | null;
  /** The row's cells as text, by column index — what the preview editor edits. */
  cells: (string | null)[];
  /** What the check found the row would do: a balance's `current`, `target`, `difference`, `unit`, `asOf`. */
  preview: Record<string, string | number | boolean | null> | null;
  errors: PeopleImportCellErrorDTO[];
};

export type PeopleImportUpdateRequest = {
  mapping?: Record<string, string>;
  dateFormat?: PeopleImportDateFormat;
  decimalSeparator?: PeopleImportDecimalSeparator;
  inviteAfter?: boolean;
};

/** `POST /people-imports/{id}/rows` — the preview editor. */
export type PeopleImportRowsEditRequest = {
  version: number;
  edits: { rowNumber: number; column: number; value: string | null }[];
  removeRows: number[];
};
