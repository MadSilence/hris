/**
 * The demo company (= the trial), its 14 days and going live — DEMO_PLAN.md. The shapes Java's `CompanyState` and
 * `GoLiveDTOs` answer with.
 */

export type SubscriptionStatus = "TRIALING" | "ACTIVE" | "READ_ONLY" | "COMPED";

export type GoLiveStatusCode = "REQUESTED" | "ACTIVATED" | "RUNNING" | "DONE" | "FAILED";

/** The company's state for the app shell (`GET /company/state`). The same answer for everybody in the company. */
export type CompanyState = {
  status: SubscriptionStatus;
  writable: boolean;
  /** Still holds sample data — a demo (R5.1). */
  isDemo: boolean;
  trialEndsAt: string | null;
  trialDaysLeft: number | null;
  readOnlySince: string | null;
  goLive: GoLiveStatusCode | null;
};

export type GoLiveKind =
  | "OFFICE"
  | "LEGAL_ENTITY"
  | "ORG_UNIT"
  | "JOB_FAMILY"
  | "JOB_LEVEL_GROUP"
  | "JOB_LEVEL"
  | "JOB"
  | "CALENDAR"
  | "ROLE"
  | "POLICY"
  | "PROCESS_TEMPLATE"
  | "AUTOMATION";

export const GO_LIVE_KINDS: GoLiveKind[] = [
  "OFFICE",
  "LEGAL_ENTITY",
  "ORG_UNIT",
  "JOB_FAMILY",
  "JOB_LEVEL_GROUP",
  "JOB_LEVEL",
  "JOB",
  "CALENDAR",
  "ROLE",
  "POLICY",
  "PROCESS_TEMPLATE",
  "AUTOMATION",
];

/** One piece of the example's set-up on the Keep/Delete list (R5.3). */
export type GoLiveItem = {
  kind: GoLiveKind;
  id: string;
  name: string;
  /** DEPARTMENT or TEAM for an org unit. */
  detail: string | null;
  /** The suggested choice. */
  keep: boolean;
  reason: "EDITED" | "IN_USE" | "SAMPLE";
};

export type GoLiveCountKey =
  | "samplePeople"
  | "timeOffRequests"
  | "processes"
  | "documents"
  | "attendanceEntries"
  | "automationRuns"
  | "reviewCycles"
  | "journalLines";

export type GoLivePreview = {
  isDemo: boolean;
  items: GoLiveItem[];
  counts: Partial<Record<GoLiveCountKey, number>>;
};

export type GoLiveStatus = {
  status: GoLiveStatusCode;
  step: string | null;
  requestedAt: string | null;
  requestedByName: string | null;
  activatedAt: string | null;
  activatedBy: string | null;
  finishedAt: string | null;
  counts: Partial<Record<string, number>> | null;
  errorDetail: string | null;
};

/** The key the backend reads a kept row by: `KIND:id`. */
export const keepKey = (item: Pick<GoLiveItem, "kind" | "id">): string => `${item.kind}:${item.id}`;
