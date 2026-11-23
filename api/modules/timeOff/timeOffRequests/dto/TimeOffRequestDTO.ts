import type { TimeOffRequestStatus } from "./TimeOffRequestStatus";
import type { TimeOffPolicyCountingMode } from "@/api/modules/timeOff/timeOffPolicies/dto/TimeOffPolicyCountingMode";

export interface TimeOffRequestDTO {
  id: string;
  userId: string;
  policyId: string;
  assignmentId: string;
  balanceId: string;
  status: TimeOffRequestStatus;
  startDate: string;
  endDate: string;
  requestedAmount: number;
  reason: string | null;
  cancelledAt: string | null;
  cancelledBy: string | null;
  cancellationReason: string | null;
  approvedAt: string | null;
  approvedBy: string | null;
  rejectedAt: string | null;
  rejectedBy: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  /** Approved or rejected by an administrator over the chain (Approve Anyway / Reject Anyway). */
  decidedAnyway?: boolean;
  /** "Awaiting me" only: the approver this request reaches the reader for, as their delegate ("for Anna"). */
  awaitingOnBehalfOfUserId?: string | null;
  awaitingOnBehalfOfName?: string | null;
  /** The policy's counting method — WORKING_DAYS reads "5 working days", CALENDAR_DAYS "5 days" (B5). */
  countingMode?: TimeOffPolicyCountingMode | null;
}
