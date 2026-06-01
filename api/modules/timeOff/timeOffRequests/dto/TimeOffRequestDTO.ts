import type { TimeOffRequestStatus } from "./TimeOffRequestStatus";

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
}
