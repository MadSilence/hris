import { Segment } from "@/models/segment/Segment";
import { AssignmentSkipReason } from "@/api/modules/assignments/dto/AssignmentDTO";

export type SegmentPreviewRequest = {
  segment: Segment;
  cursor?: string | null;
  limit?: number;
};

export type SegmentPreviewUser = {
  userId: string;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  willAssign: boolean;
  skipReason?: AssignmentSkipReason | null;
};

export type SegmentPreviewResponse = {
  total: number;
  items: SegmentPreviewUser[];
  nextCursor?: string | null;
};

export type SegmentApplyRequest = {
  segment: Segment;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
};

export type SegmentApplyResponse = {
  jobId: string;
};

export type AssignmentJobStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";

export type AssignmentJobFailed = {
  userId: string;
  email: string;
  recordId?: string | null;
  errorDetail?: string | null;
};

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
