import type { UpdateTimeOffPolicyRequest } from "./UpdateTimeOffPolicyRequest";
import type { UpdateTimeOffPolicyRequestRulesRequest } from "@/api/modules/timeOff/timeOffPolicyRequestRules/dto";
import type { UpdateTimeOffPolicyEditRulesRequest } from "@/api/modules/timeOff/timeOffPolicyEditRules/dto";
import type { UpdateTimeOffPolicyEligibilityRequest } from "@/api/modules/timeOff/timeOffPolicyEligibility/dto";
import type { UpdateTimeOffPolicyAccrualRequest } from "@/api/modules/timeOff/timeOffPolicyAccrual/dto";
import type { UpdateTimeOffPolicyRestrictionsRequest } from "@/api/modules/timeOff/timeOffPolicyRestrictions/dto";
import type { UpdateTimeOffPolicyTenureRulesRequest } from "@/api/modules/timeOff/timeOffPolicyTenureRules/dto";
import type { UpdateTimeOffPolicyApprovalSettingsRequest } from "@/api/modules/timeOff/timeOffPolicyApprovalSettings/dto";

/**
 * A whole policy, saved in one call and one transaction.
 *
 * Saving through ten calls in a row meant a refusal partway left the policy half-written — the quota
 * changed, the approval chain not — with nothing on screen to say which half had landed.
 *
 * Every section is optional: omitting one leaves it as it is.
 */
export interface SaveTimeOffPolicyRequest {
  /** A new slug, when the policy is being renamed. */
  name: string | null;
  policy: UpdateTimeOffPolicyRequest;
  requestRules?: UpdateTimeOffPolicyRequestRulesRequest;
  editRules?: UpdateTimeOffPolicyEditRulesRequest;
  eligibility?: UpdateTimeOffPolicyEligibilityRequest;
  accrual?: UpdateTimeOffPolicyAccrualRequest;
  /** Blackouts and coverage caps together. */
  restrictions?: UpdateTimeOffPolicyRestrictionsRequest;
  tenureRules?: UpdateTimeOffPolicyTenureRulesRequest;
  approval?: UpdateTimeOffPolicyApprovalSettingsRequest;
  /** The policy's version the editor was opened with; a stale one is refused with E00409. */
  version?: number;
}
