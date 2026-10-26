/**
 * One change scheduled for a person, as `GET /users/{id}/scheduled-changes` returns it. The backend
 * lists only what the reader may act on, so a reader who may only view the profile gets none.
 */
export type ScheduledChangeKind =
  | "TERMINATION"
  | "INVITATION"
  | "EMPLOYMENT_START"
  | "ASSIGNMENT_START"
  | "ASSIGNMENT_END"
  | "TASK_DUE";

/** What a change does to its field: takes the value, or adds/removes it (one of several, or the only one). */
export type ScheduledChangeOperation = "SET" | "ADD" | "REMOVE";

export type ScheduledChange = {
  id: string;
  kind: ScheduledChangeKind;
  /** The kind, refined by what it touches: `ASSIGNMENT_START.OFFICE`. */
  labelKey: string;
  /** `yyyy-MM-dd`, the day it takes effect. */
  effectiveAt: string;
  scheduledBy: { id: string; name: string } | null;
  scheduledAt: string | null;
  canCancel: boolean;
  canReschedule: boolean;
  /** The date Change Date edits — the last working day, the send date; null when it cannot move. */
  rescheduleDate: string | null;
  /** The profile field it will change; null for a change that is not a field. */
  fieldId: string | null;
  operation: ScheduledChangeOperation | null;
  /** A status travels as its code, with no name. */
  value: { id: string; name: string | null } | null;
  /** What a change that is not a field is about — a task's title. */
  subject: string | null;
};
