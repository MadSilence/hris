import type {
  TimeOffPolicyCarryoverExpiryType,
  TimeOffPolicyCarryoverExpiryUnit,
  TimeOffPolicyCarryoverType,
  TimeOffPolicyCountingMode,
  TimeOffPolicyEntitlementMode,
  TimeOffPolicyRenewalType,
  TimeOffPolicyStatus,
  TimeOffPolicyUnit,
} from "@/api/modules/timeOff/timeOffPolicies/dto";

export interface TimeOffPolicy {
  id: string;
  companyId: string;
  leaveTypeId: string;

  name: string;
  displayName: string;
  description: string | null;

  status: TimeOffPolicyStatus;
  unit: TimeOffPolicyUnit;

  paid: boolean;
  hiddenFromEmployees: boolean;

  effectiveDate: string | null;

  countingMode: TimeOffPolicyCountingMode;
  validWeekdays: number;
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
}