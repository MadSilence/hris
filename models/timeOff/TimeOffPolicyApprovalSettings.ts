import type { TimeOffPolicyApprover } from "./TimeOffPolicyApprover";

export interface TimeOffPolicyApprovalSettings {
  policyId: string;
  allApprovalsRequired: boolean;
  approvalOrderStrict: boolean;
  allowSubstituteApprovers: boolean;
  approvers: TimeOffPolicyApprover[];
}
