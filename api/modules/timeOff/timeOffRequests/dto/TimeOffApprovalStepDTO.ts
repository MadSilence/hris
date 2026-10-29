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
}
