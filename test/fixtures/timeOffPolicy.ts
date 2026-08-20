import {
  CreateTimeOffPolicyRequest,
  TimeOffPolicyCarryoverExpiryType,
  TimeOffPolicyCarryoverType,
  TimeOffPolicyCountingMode,
  TimeOffPolicyDTO,
  TimeOffPolicyEntitlementMode,
  TimeOffPolicyRenewalType,
  TimeOffPolicyStatus,
  TimeOffPolicyUnit,
  UpdateTimeOffPolicyRequest,
} from "@/api/modules/timeOff/timeOffPolicies/dto";

/**
 * Complete, valid time-off policy shapes for tests.
 *
 * These types carry ~25 required fields and grow with the feature. Inline literals in each test drift
 * out of date the moment a field is added, which is exactly what happened before this file existed —
 * eight suites stopped typechecking at once. Build from these and override only what the test is
 * actually about, so the next field lands in one place.
 */

export const timeOffPolicyCreateRequest = (
  overrides: Partial<CreateTimeOffPolicyRequest> = {},
): CreateTimeOffPolicyRequest => ({
  leaveTypeId: "leave-type-id",

  name: "vacation",
  displayName: "Vacation",
  description: null,

  status: TimeOffPolicyStatus.Draft,
  unit: TimeOffPolicyUnit.Days,

  paid: true,
  hiddenFromEmployees: false,

  effectiveDate: null,

  countingMode: TimeOffPolicyCountingMode.WorkingDays,
  validWeekdays: 62,
  includePublicHolidays: false,

  entitlementGrantingMode: TimeOffPolicyEntitlementMode.Upfront,
  allowRequestsInAdvanceOfAccrual: false,

  yearlyQuota: 20,
  unlimitedQuota: false,

  renewalType: TimeOffPolicyRenewalType.YearlyFixedDate,
  renewalFixedDay: 1,
  renewalFixedMonth: 1,

  carryoverType: TimeOffPolicyCarryoverType.None,
  carryoverLimit: null,

  carryoverExpiryType: TimeOffPolicyCarryoverExpiryType.Never,
  carryoverExpiryValue: null,
  carryoverExpiryUnit: null,

  allowNegativeCarryover: false,
  negativeCarryoverLimit: null,

  allowNegativeBalance: false,
  maxNegativeBalance: null,
  negativeBalanceCappedByQuota: false,

  ...overrides,
});

export const timeOffPolicyUpdateRequest = (
  overrides: Partial<UpdateTimeOffPolicyRequest> = {},
): UpdateTimeOffPolicyRequest => {
  const { leaveTypeId, name, status, ...shared } = timeOffPolicyCreateRequest();

  // Referenced so the destructure reads as deliberate rather than as a mistake.
  void leaveTypeId;
  void name;
  void status;

  return { ...shared, ...overrides };
};

export const timeOffPolicyDto = (
  overrides: Partial<TimeOffPolicyDTO> = {},
): TimeOffPolicyDTO => ({
  ...timeOffPolicyCreateRequest(),

  id: "policy-id",
  companyId: "company-id",

  status: TimeOffPolicyStatus.Active,

  archivedAt: null,
  archivedBy: null,

  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  createdBy: null,
  updatedBy: null,

  version: 0,

  ...overrides,
});
