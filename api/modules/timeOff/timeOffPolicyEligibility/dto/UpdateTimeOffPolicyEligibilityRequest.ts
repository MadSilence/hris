import type { TimeOffEligibilityDelayUnit } from "./TimeOffEligibilityDelayUnit";
import type { TimeOffEligibilityReference } from "./TimeOffEligibilityReference";

export interface UpdateTimeOffPolicyEligibilityRequest {
  eligibilityDelayEnabled: boolean;
  eligibilityDelayValue: number | null;
  eligibilityDelayUnit: TimeOffEligibilityDelayUnit;
  eligibilityReference: TimeOffEligibilityReference;
}
