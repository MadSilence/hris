import type { TimeOffPolicyApprover } from "./TimeOffPolicyApprover";

export interface TimeOffPolicyApprovalSettings {
  policyId: string;
  /** `false` when nobody has configured approval for this policy yet. */
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
  /**
   * Whose holders decide a step that resolves to nobody — a leaver, an empty manager step, an approver
   * away with nobody standing in. Null: no fallback, which the settings warn about.
   */
  fallbackRoleId: string | null;
  fallbackRoleName: string | null;
  approvers: TimeOffPolicyApprover[];
}
