import type { TimeOffPolicyApproverDTO } from "./TimeOffPolicyApproverDTO";

export interface TimeOffPolicyApprovalSettingsDTO {
  policyId: string;
  allApprovalsRequired: boolean;
  approvalOrderStrict: boolean;
  allowSubstituteApprovers: boolean;
  approvers: TimeOffPolicyApproverDTO[];
}
