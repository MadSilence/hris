import type { TimeOffPolicyAssignmentStatus } from "@/api/modules/timeOff/timeOffPolicyAssignments/dto/TimeOffPolicyAssignmentStatus";

export interface TimeOffPolicyAssignment {
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