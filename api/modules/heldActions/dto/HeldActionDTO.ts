/**
 * An answer held on the server until the moment it takes effect (DECISIONS.md § "Undo and the Admin role", U-1 – U-6).
 * One kind per direct endpoint a screen answers through with Undo; the direct endpoints stay for callers with no Undo.
 */
export type HeldActionKind =
  | "TIME_OFF_APPROVE"
  | "TIME_OFF_CANCELLATION_CONFIRM"
  | "AUTOMATION_APPROVAL_APPROVE"
  | "TASK_COMPLETE"
  | "HUB_PAGE_UNPUBLISH"
  | "HUB_REMIND";

/**
 * `POST /held-actions`. `targetId` is the id the direct endpoint takes in its path; `payload` is exactly the body it
 * takes, left out when it takes none.
 */
export type HoldActionRequestDTO = {
  kind: HeldActionKind;
  targetId: string;
  payload?: Record<string, unknown>;
};

/** The hold's answer: what to undo, and the moment the server applies it (an ISO-8601 instant). */
export interface HeldActionDTO {
  id: string;
  executeAt: string;
}
