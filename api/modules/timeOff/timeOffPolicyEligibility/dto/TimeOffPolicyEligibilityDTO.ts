import type { TimeOffEligibilityDelayUnit } from "./TimeOffEligibilityDelayUnit";
import type { TimeOffEligibilityReference } from "./TimeOffEligibilityReference";

export interface TimeOffPolicyEligibilityDTO {
  policyId: string;
  eligibilityDelayEnabled: boolean;
  eligibilityDelayValue: number | null;
  eligibilityDelayUnit: TimeOffEligibilityDelayUnit;
  eligibilityReference: TimeOffEligibilityReference;
}
