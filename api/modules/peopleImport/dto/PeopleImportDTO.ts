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
  fileName: string;
  fileFormat: "CSV" | "XLSX";
  status: PeopleImportStatus;
  headers: string[];
  /** Column index (as text) → field id. A column left out is not imported. */
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
  status: "PENDING" | "CREATED" | "FAILED";
  userId: string | null;
  errors: PeopleImportCellErrorDTO[];
};

export type PeopleImportUpdateRequest = {
  mapping?: Record<string, string>;
  dateFormat?: PeopleImportDateFormat;
  decimalSeparator?: PeopleImportDecimalSeparator;
  inviteAfter?: boolean;
};
