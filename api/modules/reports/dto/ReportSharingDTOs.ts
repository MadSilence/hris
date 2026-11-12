import type { ReportTime } from "./ReportDefinition";
import type { ReportResult } from "./ReportResult";

/**
 * Mirrors `ReportShareService` and `ReportPublicationService` on the backend: sharing a report inside the
 * company, and publishing a frozen snapshot outside it (REPORTS_DESIGN.md § 8.3).
 */

export type ReportGranteeType = "PERSON" | "TEAM" | "DEPARTMENT" | "ROLE";

export type ReportSharePermission = "VIEW" | "EDIT";

export type ReportGrantee = {
  granteeType: ReportGranteeType;
  granteeId: string;
  permission: ReportSharePermission;
};

export type ReportShareRequest = {
  grantees: ReportGrantee[];
};

export type ReportUpdateShareRequest = {
  permission: ReportSharePermission;
};

export type ReportShareDTO = {
  id: string;
  granteeType: ReportGranteeType;
  granteeId: string;
  /** The grantee's name today; null when it no longer exists. */
  granteeName: string | null;
  permission: ReportSharePermission;
  createdAt: string;
};

/** How many recipients may see a field of the report on nobody — it is left out of their result. */
export type ReportShareHiddenFieldDTO = {
  fieldId: string;
  label: string;
  peopleCount: number;
  sampleNames: string[];
};

/** `POST /reports/{id}/shares/preview` — what sharing with these grantees would mean. Reads only. */
export type ReportSharePreviewDTO = {
  recipientCount: number;
  /** Recipients who cannot open reports, or people, at all. */
  noAccessCount: number;
  hiddenFields: ReportShareHiddenFieldDTO[];
};

export type ReportPublishRequest = {
  title?: string | null;
  /** The fields that may leave — dimensions, columns and the fields measures are taken over. */
  fields?: string[] | null;
  /** 1 to 90; 30 when absent. */
  expiresInDays?: number | null;
  time?: ReportTime | null;
  /** A second, explicit yes to publishing a list of named people. */
  confirmPeople?: boolean | null;
};

/** `token` is shown once — only its hash is kept. `path` is the backend's `/public/reports/{token}`. */
export type ReportPublishedDTO = {
  id: string;
  token: string;
  path: string;
  expiresAt: string;
};

export type ReportPublicationState = "LIVE" | "REVOKED" | "EXPIRED";

export type ReportPublicationDTO = {
  id: string;
  reportId: string;
  title: string;
  asOf: string | null;
  expiresAt: string;
  revokedAt: string | null;
  viewCount: number;
  lastViewedAt: string | null;
  createdAt: string;
  publishedBy: string | null;
  state: ReportPublicationState;
};

/** What a public link shows: the snapshot while it is live, its state otherwise. */
export type ReportPublicDTO = {
  state: ReportPublicationState | "NOT_FOUND";
  title: string | null;
  asOf: string | null;
  publishedAt: string | null;
  expiresAt: string | null;
  result: ReportResult | null;
};
