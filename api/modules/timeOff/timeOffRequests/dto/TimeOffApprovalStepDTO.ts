/** How somebody came to sign a step: as its approver, as their delegate, or as the policy's fallback. */
export type TimeOffApprovalVia = "DIRECT" | "DELEGATE" | "FALLBACK" | "OVERRIDE";

/** Why a step was put to whom it was put to. */
export type TimeOffStepAskedReason = "RESOLVED" | "FALLBACK" | "REASSIGNED";

/**
 * One step of a request's chain, as the decision page tells it: "Asked: Anna · Answered by Maria on
 * behalf of Anna". Mirrors `TimeOffApprovalStepDTO` on the backend; never sent to the requester.
 */
export interface TimeOffApprovalStepDTO {
  approvalOrder: number;
  approverType: "MANAGER" | "SPECIFIC_USER";
  askedUserId: string | null;
  askedUserName: string | null;
  askedRoleName: string | null;
  askedReason: TimeOffStepAskedReason;
  reassignedToUserId: string | null;
  reassignedToName: string | null;
  signed: boolean;
  decidedBy: string | null;
  decidedByName: string | null;
  via: TimeOffApprovalVia | null;
  onBehalfOfUserId: string | null;
  onBehalfOfName: string | null;
  decidedAt: string | null;
  /** Where the step stands, for the step list (AQ-04): signed, waiting now, its turn not come, declined, never needed. */
  state?: TimeOffApprovalStepState;
  /** The job title of the person the step names (C5) — null without one, or when the reader may not see Job. */
  approverJobTitle?: string | null;
}

export type TimeOffApprovalStepState = "DONE" | "NOW" | "NOT_YET" | "DECLINED" | "SKIPPED";

/**
 * Where a request's approval stands (AQ-04). The requester gets the count and, once approved, every approver's name —
 * never who has not decided; an approver gets the steps themselves, and `ordered` says how to draw them.
 */
export interface TimeOffChainDTO {
  /** The policy's mode; null when the request needed no approval. */
  mode: string | null;
  /** Numbered and decided in turn; otherwise any `required` of `total`. */
  ordered: boolean;
  total: number;
  required: number;
  approved: number;
  /** Once approved, the full name of everyone who signed it, in the order they signed. */
  approvedByNames: string[];
}
