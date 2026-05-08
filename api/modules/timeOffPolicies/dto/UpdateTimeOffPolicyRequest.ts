import { TimeOffPolicyCarryoverExpiryUnit } from "@/api/modules/timeOffPolicies/dto/TimeOffPolicyCarryoverExpiryUnit";
import { TimeOffPolicyCarryoverExpiryType } from "@/api/modules/timeOffPolicies/dto/TimeOffPolicyCarryoverExpiryType";
import { TimeOffPolicyCarryoverType } from "@/api/modules/timeOffPolicies/dto/TimeOffPolicyCarryoverType";
import { TimeOffPolicyRenewalType } from "@/api/modules/timeOffPolicies/dto/TimeOffPolicyRenewalType";
import { TimeOffPolicyUnit } from "@/api/modules/timeOffPolicies/dto/TimeOffPolicyUnit";

export interface UpdateTimeOffPolicyRequest {
  displayName: string;
  description: string | null;

  unit: TimeOffPolicyUnit;

  paid: boolean;
  hiddenFromEmployees: boolean;

  yearlyQuota: number | null;
  unlimitedQuota: boolean;

  renewalType: TimeOffPolicyRenewalType;
  renewalFixedDay: number | null;
  renewalFixedMonth: number | null;

  carryoverType: TimeOffPolicyCarryoverType;
  carryoverLimit: number | null;

  carryoverExpiryType: TimeOffPolicyCarryoverExpiryType;
  carryoverExpiryValue: number | null;
  carryoverExpiryUnit: TimeOffPolicyCarryoverExpiryUnit | null;
}
