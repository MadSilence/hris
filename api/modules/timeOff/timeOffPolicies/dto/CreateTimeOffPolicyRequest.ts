import { TimeOffPolicyStatus } from "@/api/modules/timeOff/timeOffPolicies/dto/TimeOffPolicyStatus";
import { TimeOffPolicyUnit } from "@/api/modules/timeOff/timeOffPolicies/dto/TimeOffPolicyUnit";
import { TimeOffPolicyRenewalType } from "@/api/modules/timeOff/timeOffPolicies/dto/TimeOffPolicyRenewalType";
import { TimeOffPolicyCarryoverType } from "@/api/modules/timeOff/timeOffPolicies/dto/TimeOffPolicyCarryoverType";
import { TimeOffPolicyCarryoverExpiryType } from "@/api/modules/timeOff/timeOffPolicies/dto/TimeOffPolicyCarryoverExpiryType";
import { TimeOffPolicyCarryoverExpiryUnit } from "@/api/modules/timeOff/timeOffPolicies/dto/TimeOffPolicyCarryoverExpiryUnit";

export interface CreateTimeOffPolicyRequest {
  name: string;
  displayName: string;
  description: string | null;

  status: TimeOffPolicyStatus;
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