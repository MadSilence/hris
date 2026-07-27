import { Segment } from "@/models/segment/Segment";
import { AssignmentSkipReason } from "@/api/modules/roles/dto/RoleAssignmentDTO";

// POST /roles/{roleId}/assignments/segment/preview
export type RoleSegmentPreviewRequest = {
  segment: Segment;
  cursor?: string | null;
  limit?: number;
};

export type SegmentPreviewUser = {
  userId: string;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  // willAssign=false means the user matched but would be skipped (skipReason explains why).
  willAssign: boolean;
  skipReason?: AssignmentSkipReason | null;
};

export type RoleSegmentPreviewResponse = {
  total: number;
  items: SegmentPreviewUser[];
  nextCursor?: string | null;
};

// POST /roles/{roleId}/assignments/segment/apply → 202 { jobId }
// Async: only adds users, snapshot taken at submit, no recompute. Dates are ISO (yyyy-mm-dd).
export type RoleSegmentApplyRequest = {
  segment: Segment;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
};

export type SegmentApplyResponse = {
  jobId: string;
};

// Terminal states are COMPLETED / FAILED; poll while PENDING / RUNNING. No CANCELLED (no cancel in MVP).
export type AssignmentJobStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";

export type AssignmentJobFailed = {
  userId: string;
  email: string;
  recordId?: string | null;
  errorDetail?: string | null;
};

// GET /roles/{roleId}/assignments/jobs/{jobId}
export type AssignmentJobStatusDTO = {
  jobId: string;
  status: AssignmentJobStatus;
  summary: { total: number; created: number; skipped: number; failed: number };
  failed: AssignmentJobFailed[];
  errorDetail?: string | null;
  startedAt?: string | null;
  finishedAt?: string | null;
};

export const isTerminalJobStatus = (s: AssignmentJobStatus): boolean =>
  s === "COMPLETED" || s === "FAILED";
