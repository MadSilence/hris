import type { FilterDTO } from "@/models/user/fields";

export type BulkOperation = "SET" | "CLEAR" | "ADD" | "REMOVE";

export type BulkEditSegment = {
  filters: FilterDTO[];
  excludeUserIds?: string[];
  /** Same meaning as on a Segment: off means active people only. */
  includeInactive?: boolean;
};

export type BulkEditRequest = {
  userIds?: string[];
  segment?: BulkEditSegment;
  field: string;
  operation: BulkOperation;
  value?: unknown;
  /** Sent on the retry, after the user has seen who falls outside their access and chosen to go on. */
  confirmPartial?: boolean;
};

/** Someone the actor's access does not reach, named so the dialog can list them. */
export type BulkEditBlockedTarget = {
  userId: string;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
};

export type BulkEditResult = {
  /** `out_of_scope` means nothing was written yet — the caller has to decide. */
  mode: "sync" | "async" | "out_of_scope";
  updated?: number;
  skipped?: number;
  failed?: number;
  jobId?: string;
  allowedCount?: number;
  blocked?: BulkEditBlockedTarget[];
};
