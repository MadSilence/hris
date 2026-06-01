export interface CreateTimeOffPolicyAssignmentRequest {
  userId: string;
  effectiveFrom: string;
  effectiveTo: string | null;
}
