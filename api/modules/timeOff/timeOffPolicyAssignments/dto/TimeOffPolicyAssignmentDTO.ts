import type { TimeOffPolicyAssignmentStatus } from "./TimeOffPolicyAssignmentStatus";

export interface TimeOffPolicyAssignmentDTO {
  id: string;
  policyId: string;
  userId: string;
  /**
   * Who the assignment is about, resolved by the backend for the whole list at once. Identity and
   * avatar only — an email answers to a grant, and this endpoint is not where one is handed out.
   */
  person?: { id: string; name: string; avatarUrl?: string | null } | null;
  status: TimeOffPolicyAssignmentStatus;
  effectiveFrom: string;
  effectiveTo: string | null;
  endedAt: string | null;
  endedBy: string | null;
  createdAt: string;
  updatedAt: string;
}
