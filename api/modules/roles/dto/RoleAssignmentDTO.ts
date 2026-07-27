// Domain bulk-assign API under a role. Do not use the generic /assignments/* endpoints:
// they carry a different gate and are marked internal on the backend.

export const ASSIGNMENT_TARGET_TYPES = ["USER", "DEPARTMENT", "TEAM", "COMPANY"] as const;

export type AssignmentTargetType = (typeof ASSIGNMENT_TARGET_TYPES)[number];

// Shape depends on targetType:
//   USER       → { userIds: string[] }
//   DEPARTMENT → { departmentId: string; includeSub: boolean }
//   TEAM       → { teamId: string; includeSub: boolean }
//   COMPANY    → {} (every active user)
export type AssignmentTargetPayload = Record<string, unknown>;

// assignableType / assignableId / sourceType are filled in by the backend.
export type RoleAssignmentRequest = {
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
  | "INVALID_TARGET";

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

export type RoleAssignmentPreviewDTO = {
  assignableType: string;
  assignableId: string;
  targetType: AssignmentTargetType;
  toCreate: AssignmentPreviewUser[];
  toSkip: AssignmentSkippedUser[];
  summary: AssignmentSummary;
};

export type AssignmentFailedUser = {
  userId: string;
  email: string;
  recordId?: string | null;
  errorDetail?: string | null;
};

export type RoleAssignmentApplyDTO = {
  ruleId: string;
  // domainAssignmentId is always null for roles (user_roles has a composite PK).
  created: (AssignmentPreviewUser & { recordId?: string | null })[];
  skipped: AssignmentSkippedUser[];
  failed: AssignmentFailedUser[];
  summary: AssignmentSummary;
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
