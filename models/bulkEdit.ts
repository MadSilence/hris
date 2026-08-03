import type { FilterDTO } from "@/models/user/fields";

export type BulkOperation = "SET" | "CLEAR" | "ADD" | "REMOVE";

export type BulkEditSegment = { filters: FilterDTO[]; excludeUserIds?: string[] };

export type BulkEditRequest = {
  userIds?: string[];
  segment?: BulkEditSegment;
  field: string;
  operation: BulkOperation;
  value?: unknown;
};

export type BulkEditResult = {
  mode: "sync" | "async";
  updated?: number;
  skipped?: number;
  failed?: number;
  jobId?: string;
};
