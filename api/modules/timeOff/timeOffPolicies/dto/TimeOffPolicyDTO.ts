import type { LeaveTypeCategory } from "@/api/modules/timeOff/leaveTypes/dto";
import { TimeOffPolicyStatus } from "@/api/modules/timeOff/timeOffPolicies/dto/TimeOffPolicyStatus";
import { TimeOffPolicyUnit } from "@/api/modules/timeOff/timeOffPolicies/dto/TimeOffPolicyUnit";
import { TimeOffPolicyCountingMode } from "@/api/modules/timeOff/timeOffPolicies/dto/TimeOffPolicyCountingMode";
import { TimeOffPolicyEntitlementMode } from "@/api/modules/timeOff/timeOffPolicies/dto/TimeOffPolicyEntitlementMode";
import { TimeOffPolicyRenewalType } from "@/api/modules/timeOff/timeOffPolicies/dto/TimeOffPolicyRenewalType";
import { TimeOffPolicyCarryoverType } from "@/api/modules/timeOff/timeOffPolicies/dto/TimeOffPolicyCarryoverType";
import { TimeOffPolicyCarryoverExpiryType } from "@/api/modules/timeOff/timeOffPolicies/dto/TimeOffPolicyCarryoverExpiryType";
import { TimeOffPolicyCarryoverExpiryUnit } from "@/api/modules/timeOff/timeOffPolicies/dto/TimeOffPolicyCarryoverExpiryUnit";

export interface TimeOffPolicyDTO {
  id: string;
  companyId: string;
  leaveTypeId: string;

  name: string;
  description: string | null;

  status: TimeOffPolicyStatus;
  unit: TimeOffPolicyUnit;

  paid: boolean;
  hiddenFromEmployees: boolean;

  effectiveDate: string | null;

  countingMode: TimeOffPolicyCountingMode;
  includePublicHolidays: boolean;

  entitlementGrantingMode: TimeOffPolicyEntitlementMode;
  allowRequestsInAdvanceOfAccrual: boolean;

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

  allowNegativeCarryover: boolean;
  negativeCarryoverLimit: number | null;

  allowNegativeBalance: boolean;
  maxNegativeBalance: number | null;
  negativeBalanceCappedByQuota: boolean;

  archivedAt: string | null;
  archivedBy: string | null;

  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;

  version: number;

  /** The policy's colour — a tag colour but gray: its bar on the calendars and its marker beside the name. */
  color: string;
  /** The category of the policy's leave type — a VACATION policy leads a person's balances. Only the list carries it. */
  leaveTypeCategory?: LeaveTypeCategory | null;
}
