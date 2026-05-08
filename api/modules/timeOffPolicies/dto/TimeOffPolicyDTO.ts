import { TimeOffPolicyStatus } from "@/api/modules/timeOffPolicies/dto/TimeOffPolicyStatus";
import { TimeOffPolicyUnit } from "@/api/modules/timeOffPolicies/dto/TimeOffPolicyUnit";
import { TimeOffPolicyRenewalType } from "@/api/modules/timeOffPolicies/dto/TimeOffPolicyRenewalType";
import { TimeOffPolicyCarryoverType } from "@/api/modules/timeOffPolicies/dto/TimeOffPolicyCarryoverType";
import { TimeOffPolicyCarryoverExpiryType } from "@/api/modules/timeOffPolicies/dto/TimeOffPolicyCarryoverExpiryType";
import { TimeOffPolicyCarryoverExpiryUnit } from "@/api/modules/timeOffPolicies/dto/TimeOffPolicyCarryoverExpiryUnit";

export interface TimeOffPolicyDTO {
  id: string;
  companyId: string;

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

  archivedAt: string | null;
  archivedBy: string | null;

  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;

  version: number;
}
