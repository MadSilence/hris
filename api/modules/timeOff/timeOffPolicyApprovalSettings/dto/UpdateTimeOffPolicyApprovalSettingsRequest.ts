import type { UpdateTimeOffPolicyApproverRequest } from "./UpdateTimeOffPolicyApproverRequest";

export interface UpdateTimeOffPolicyApprovalSettingsRequest {
  allApprovalsRequired: boolean;
  approvalOrderStrict: boolean;
  allowSubstituteApprovers: boolean;
  approvers: UpdateTimeOffPolicyApproverRequest[];
}
