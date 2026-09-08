import type { UpdateTimeOffPolicyApproverRequest } from "./UpdateTimeOffPolicyApproverRequest";

export interface UpdateTimeOffPolicyApprovalSettingsRequest {
  /** Does this policy ask for approval at all? */
  approvalRequired: boolean;
  /**
   * How a set of approvers decides. Replaced allApprovalsRequired + approvalOrderStrict, which
   * described one mechanism twice and could not express "any two of these three".
   */
  approvalMode: "SEQUENTIAL" | "ALL" | "N_OF_M";
  /** Only for N_OF_M. */
  requiredApprovalsCount: number | null;
  allowSubstituteApprovers: boolean;
  approvers: UpdateTimeOffPolicyApproverRequest[];
}
