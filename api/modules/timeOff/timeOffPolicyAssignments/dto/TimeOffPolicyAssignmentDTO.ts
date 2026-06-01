import type { TimeOffPolicyAssignmentStatus } from "./TimeOffPolicyAssignmentStatus";

export interface TimeOffPolicyAssignmentDTO {
  id: string;
  policyId: string;
  userId: string;
  status: TimeOffPolicyAssignmentStatus;
  effectiveFrom: string;
  effectiveTo: string | null;
  endedAt: string | null;
  endedBy: string | null;
  createdAt: string;
  updatedAt: string;
}
