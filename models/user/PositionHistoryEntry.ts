/**
 * Why a person's position changed. Mirrors the backend's `UserJobChangeReason`.
 */
export type PositionChangeReason =
  | "ASSIGNED"
  | "UNASSIGNED"
  | "BULK"
  | "JOB_ARCHIVED"
  | "JOB_DELETED"
  | "FAMILY_ARCHIVED"
  | "FAMILY_DELETED";

/**
 * One step of a person's position timeline: from `changedAt` on, they held `jobName` — or no
 * position, when it is null.
 *
 * The names are what the position was called when the row was written, not a lookup in today's
 * catalogue: the job may have been renamed or deleted since. `changedAt` is a calendar date, and
 * until dated changes exist it is the day the change was recorded.
 */
export type PositionHistoryEntry = {
  id: string;
  changedAt: string;
  jobName: string | null;
  previousJobName: string | null;
  reason: PositionChangeReason;
};
