// Generic assignment DTOs, shared by every assignable domain (roles, teams, departments,
// offices, legal entities, jobs, calendars, time-off policies). The backend exposes an identical
// `/<base>/{id}/assignments/*` API per domain, so these shapes are domain-agnostic.
// Do not use the internal `/assignments/*` endpoints — they carry a different gate.

export const ASSIGNMENT_TARGET_TYPES = ["USER", "DEPARTMENT", "TEAM", "COMPANY"] as const;

export type AssignmentTargetType = (typeof ASSIGNMENT_TARGET_TYPES)[number];

// Shape depends on targetType:
//   USER       → { userIds: string[] }
//   DEPARTMENT → { departmentId: string; includeSub: boolean }
//   TEAM       → { teamId: string; includeSub: boolean }
//   COMPANY    → {} (every active user)
export type AssignmentTargetPayload = Record<string, unknown>;

// assignableType / assignableId / sourceType are filled in by the backend from the path.
export type AssignmentRequest = {
  targetType: AssignmentTargetType;
  targetPayload: AssignmentTargetPayload;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
};

export type AssignmentSkipReason =
  | "DUPLICATE"
  | "USER_ARCHIVED"
  | "USER_NOT_FOUND"
  | "DOMAIN_ERROR"
  | "INVALID_TARGET"
  /** A live rule left a value set by hand alone (AUTOMATIONS_DESIGN.md § 7). */
  | "HAND_OVERRIDE"
  /** Another live rule already sets this single-valued field for the person. */
  | "RULE_CONFLICT";

/** Whose decision an assignment record is: a person's, or a live rule's. */
export type AssignmentOrigin = "HAND" | "RULE";

export type AssignmentSummary = {
  total: number;
  created: number;
  skipped: number;
  failed: number;
};

export type AssignmentPreviewUser = {
  userId: string;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  status?: string | null;
};

export type AssignmentSkippedUser = AssignmentPreviewUser & {
  reason: AssignmentSkipReason;
};

export type AssignmentPreviewDTO = {
  assignableType: string;
  assignableId: string;
  targetType: AssignmentTargetType;
  toCreate: AssignmentPreviewUser[];
  toSkip: AssignmentSkippedUser[];
  summary: AssignmentSummary;
  /** The skips counted by reason — "N will be assigned, M skipped, and why". */
  skippedByReason?: Partial<Record<AssignmentSkipReason, number>>;
};

export type AssignmentFailedUser = {
  userId: string;
  email: string;
  recordId?: string | null;
  errorDetail?: string | null;
};

export type AssignmentApplyDTO = {
  ruleId: string;
  created: (AssignmentPreviewUser & { recordId?: string | null; scheduledFor?: string | null })[];
  skipped: AssignmentSkippedUser[];
  failed: AssignmentFailedUser[];
  summary: AssignmentSummary;
};

// One person × one target, as the engine recorded it. A hand apply records origin HAND; a live rule
// records RULE and its automation rule.
export type AssignmentRecordDTO = {
  id: string;
  ruleId?: string | null;
  assignableType: string;
  assignableId: string;
  userId: string;
  status: "CREATED" | "SCHEDULED" | "SKIPPED" | "FAILED" | "REMOVED";
  skipReason?: AssignmentSkipReason | null;
  errorDetail?: string | null;
  createdAt: string;
  origin?: AssignmentOrigin | null;
  automationRuleId?: string | null;
};

// Rules are an append-only journal of applied operations — they cannot be edited.
// NOTE: targetPayload and sourceSnapshot arrive as raw JSON strings, not objects.
export type AssignmentRuleDTO = {
  id: string;
  companyId: string;
  assignableType: string;
  assignableId: string;
  sourceType: string;
  targetType: AssignmentTargetType;
  targetPayload: string;
  sourceSnapshot?: string | null;
  status: string;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  appliedAt?: string | null;
  appliedBy?: string | null;
  createdAt: string;
  createdBy?: string | null;
};

// Spring Page<T>, not the cursor pagination used elsewhere.
export type SpringPage<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};
