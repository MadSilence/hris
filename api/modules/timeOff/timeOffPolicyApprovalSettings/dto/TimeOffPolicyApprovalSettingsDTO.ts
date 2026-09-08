import type { TimeOffPolicyApproverDTO } from "./TimeOffPolicyApproverDTO";

export interface TimeOffPolicyApprovalSettingsDTO {
  policyId: string;
  /**
   * Whether a settings row exists at all. `false` means nobody has configured approval for this
   * policy — which is a different thing from "configured, and the approver list is empty", and the
   * two used to arrive as the same empty array.
   */
  configured: boolean;
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
  approvers: TimeOffPolicyApproverDTO[];
}
