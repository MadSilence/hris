import type {
  CreateTimeOffPolicyRequest,
  UpdateTimeOffPolicyRequest,
} from "@/api/modules/timeOff/timeOffPolicies/dto";
import {
  TimeOffPolicyCarryoverExpiryType,
  TimeOffPolicyCarryoverExpiryUnit,
  TimeOffPolicyCarryoverType,
  TimeOffPolicyCountingMode,
  TimeOffPolicyEntitlementMode,
  TimeOffPolicyRenewalType,
  TimeOffPolicyStatus,
  TimeOffPolicyUnit,
} from "@/api/modules/timeOff/timeOffPolicies/dto";
import {
  TimeOffCertificateRequirementType,
  TimeOffRequestUnit,
  type TimeOffPolicyRequestRulesDTO,
  type UpdateTimeOffPolicyRequestRulesRequest,
} from "@/api/modules/timeOff/timeOffPolicyRequestRules/dto";
import type {
  TimeOffPolicyEditRulesDTO,
  UpdateTimeOffPolicyEditRulesRequest,
} from "@/api/modules/timeOff/timeOffPolicyEditRules/dto";
import {
  TimeOffPolicyApproverType,
  type UpdateTimeOffPolicyApprovalSettingsRequest,
} from "@/api/modules/timeOff/timeOffPolicyApprovalSettings/dto";
import type { TimeOffPolicy, TimeOffPolicyApprovalSettings } from "@/models/timeOff";

// Weekday bitmask: Mon=1, Tue=2, Wed=4, Thu=8, Fri=16, Sat=32, Sun=64
export const WEEKDAY_BITS: { bit: number; label: string }[] = [
  { bit: 1, label: "Mon" },
  { bit: 2, label: "Tue" },
  { bit: 4, label: "Wed" },
  { bit: 8, label: "Thu" },
  { bit: 16, label: "Fri" },
  { bit: 32, label: "Sat" },
  { bit: 64, label: "Sun" },
];

export type WizardApprover = { required: boolean };

export type PolicyWizardValues = {
  // Basics
  name: string;
  description: string;
  unit: TimeOffPolicyUnit;
  paid: boolean;
  hiddenFromEmployees: boolean;
  effectiveDate: string;

  // Entitlement & renewal
  unlimitedQuota: boolean;
  yearlyQuota: string;
  entitlementGrantingMode: TimeOffPolicyEntitlementMode;
  renewalType: TimeOffPolicyRenewalType;
  renewalFixedDay: string;
  renewalFixedMonth: string;

  // Carryover & balance
  carryoverType: TimeOffPolicyCarryoverType;
  carryoverLimit: string;
  carryoverExpiryType: TimeOffPolicyCarryoverExpiryType;
  carryoverExpiryValue: string;
  carryoverExpiryUnit: TimeOffPolicyCarryoverExpiryUnit;
  allowNegativeCarryover: boolean;
  negativeCarryoverLimit: string;
  allowNegativeBalance: boolean;
  maxNegativeBalance: string;
  negativeBalanceCappedByQuota: boolean;

  // Counting
  countingMode: TimeOffPolicyCountingMode;
  validWeekdays: number;
  includePublicHolidays: boolean;

  // Requests (request-rules)
  reqMinRequestUnit: TimeOffRequestUnit;
  reqMaxRequestUnit: TimeOffRequestUnit | "";
  reqAllowHalfDay: boolean;
  reqAllowHourly: boolean;
  reqMaxDurationPerRequest: string;
  reqMinGapBetweenRequests: string;
  reqAllowOverlapping: boolean;
  reqMaxRequestDaysPerYear: string;
  reqAllowPastRequests: boolean;
  reqPastLimitDays: string;
  reqNoticeRequiredEnabled: boolean;
  reqDefaultNoticeDays: string;
  reqCertificateRequirementType: TimeOffCertificateRequirementType;
  reqCertificateRequiredFromDuration: string;

  // Approvals (approval-settings)
  apprRequiresApproval: boolean;
  apprAllApprovalsRequired: boolean;
  apprApprovalOrderStrict: boolean;
  apprAllowSubstitutes: boolean;
  apprApprovers: WizardApprover[];

  // Editing (edit-rules)
  editEmployeeCanEditOwn: boolean;
  editAllowEditApproved: boolean;
  editAllowEditDuringActiveLeave: boolean;
  editRequiresReapproval: boolean;
  editManagerCanEditTeam: boolean;
  editAdminCanEditAny: boolean;
  editAllowPastEdits: boolean;
};

export const defaultPolicyWizardValues: PolicyWizardValues = {
  name: "",
  description: "",
  unit: TimeOffPolicyUnit.Days,
  paid: true,
  hiddenFromEmployees: false,
  effectiveDate: "",

  unlimitedQuota: false,
  yearlyQuota: "20",
  entitlementGrantingMode: TimeOffPolicyEntitlementMode.Upfront,
  renewalType: TimeOffPolicyRenewalType.YearlyFixedDate,
  renewalFixedDay: "1",
  renewalFixedMonth: "1",

  carryoverType: TimeOffPolicyCarryoverType.None,
  carryoverLimit: "",
  carryoverExpiryType: TimeOffPolicyCarryoverExpiryType.Never,
  carryoverExpiryValue: "",
  carryoverExpiryUnit: TimeOffPolicyCarryoverExpiryUnit.Months,
  allowNegativeCarryover: false,
  negativeCarryoverLimit: "",
  allowNegativeBalance: false,
  maxNegativeBalance: "",
  negativeBalanceCappedByQuota: false,

  countingMode: TimeOffPolicyCountingMode.CalendarDays,
  validWeekdays: 31,
  includePublicHolidays: false,

  reqMinRequestUnit: TimeOffRequestUnit.FullDay,
  reqMaxRequestUnit: "",
  reqAllowHalfDay: false,
  reqAllowHourly: false,
  reqMaxDurationPerRequest: "",
  reqMinGapBetweenRequests: "",
  reqAllowOverlapping: false,
  reqMaxRequestDaysPerYear: "",
  reqAllowPastRequests: false,
  reqPastLimitDays: "",
  reqNoticeRequiredEnabled: false,
  reqDefaultNoticeDays: "",
  reqCertificateRequirementType: TimeOffCertificateRequirementType.None,
  reqCertificateRequiredFromDuration: "",

  apprRequiresApproval: false,
  apprAllApprovalsRequired: true,
  apprApprovalOrderStrict: false,
  apprAllowSubstitutes: false,
  apprApprovers: [{ required: true }],

  editEmployeeCanEditOwn: true,
  editAllowEditApproved: false,
  editAllowEditDuringActiveLeave: false,
  editRequiresReapproval: true,
  editManagerCanEditTeam: true,
  editAdminCanEditAny: true,
  editAllowPastEdits: false,
};

const toNumber = (s: string): number | null => {
  const t = s.trim();
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
};

export const hasWeekday = (mask: number, bit: number) => (mask & bit) !== 0;

export const toggleWeekday = (mask: number, bit: number) =>
  hasWeekday(mask, bit) ? mask & ~bit : mask | bit;

export type WizardStepId =
  | "basics"
  | "entitlement"
  | "carryover"
  | "counting"
  | "requests"
  | "approvals"
  | "editing"
  | "review";

/** Returns the first validation error for a step, or null if valid. */
export function validatePolicyStep(
  stepId: WizardStepId,
  v: PolicyWizardValues,
): string | null {
  switch (stepId) {
    case "basics": {
      if (v.name.trim().length < 2) return "Please enter a policy name (at least 2 characters).";
      return null;
    }
    case "entitlement": {
      if (!v.unlimitedQuota) {
        const q = toNumber(v.yearlyQuota);
        if (q === null || q < 0) return "Please enter a valid yearly quota (0 or more).";
      }
      if (v.renewalType === TimeOffPolicyRenewalType.YearlyFixedDate) {
        const d = toNumber(v.renewalFixedDay);
        const m = toNumber(v.renewalFixedMonth);
        if (d === null || d < 1 || d > 31) return "Renewal day must be between 1 and 31.";
        if (m === null || m < 1 || m > 12) return "Renewal month must be between 1 and 12.";
      }
      return null;
    }
    case "carryover": {
      if (v.carryoverType === TimeOffPolicyCarryoverType.Limited) {
        const l = toNumber(v.carryoverLimit);
        if (l === null || l < 0) return "Please enter a carryover limit (0 or more).";
      }
      if (
        v.carryoverType !== TimeOffPolicyCarryoverType.None &&
        v.carryoverExpiryType === TimeOffPolicyCarryoverExpiryType.AfterPeriod
      ) {
        const val = toNumber(v.carryoverExpiryValue);
        if (val === null || val <= 0) return "Carryover expiry period must be greater than 0.";
      }
      return null;
    }
    case "requests": {
      if (
        v.reqCertificateRequirementType === TimeOffCertificateRequirementType.FromDuration &&
        toNumber(v.reqCertificateRequiredFromDuration) === null
      ) {
        return "Please enter the duration from which a certificate is required.";
      }
      if (v.reqNoticeRequiredEnabled && toNumber(v.reqDefaultNoticeDays) === null) {
        return "Please enter the default notice days.";
      }
      if (v.reqAllowPastRequests && toNumber(v.reqPastLimitDays) === null) {
        return "Please enter how many days back past requests are allowed.";
      }
      return null;
    }
    case "approvals": {
      if (v.apprRequiresApproval) {
        if (v.apprApprovers.length < 1) return "Add at least one approval step.";
        if (v.apprApprovalOrderStrict && !v.apprAllApprovalsRequired) {
          return "Strict order requires all approvals to be required.";
        }
      }
      return null;
    }
    default:
      return null;
  }
}

export function buildCreatePolicyRequest(
  v: PolicyWizardValues,
  leaveTypeId: string,
  activate: boolean,
): CreateTimeOffPolicyRequest {
  const isLimited = v.carryoverType === TimeOffPolicyCarryoverType.Limited;
  const isAfterPeriod =
    v.carryoverType !== TimeOffPolicyCarryoverType.None &&
    v.carryoverExpiryType === TimeOffPolicyCarryoverExpiryType.AfterPeriod;
  const isManual = v.renewalType === TimeOffPolicyRenewalType.Manual;

  return {
    leaveTypeId,

    name: v.name.trim().toLowerCase().replace(/\s+/g, "-"),
    displayName: v.name.trim(),
    description: v.description.trim() || null,

    status: activate ? TimeOffPolicyStatus.Active : TimeOffPolicyStatus.Draft,
    unit: v.unit,

    paid: v.paid,
    hiddenFromEmployees: v.hiddenFromEmployees,

    effectiveDate: v.effectiveDate || null,

    countingMode: v.countingMode,
    validWeekdays: v.validWeekdays,
    includePublicHolidays: v.includePublicHolidays,

    entitlementGrantingMode: v.entitlementGrantingMode,
    allowRequestsInAdvanceOfAccrual: false,

    yearlyQuota: v.unlimitedQuota ? null : toNumber(v.yearlyQuota),
    unlimitedQuota: v.unlimitedQuota,

    renewalType: v.renewalType,
    renewalFixedDay: isManual ? null : toNumber(v.renewalFixedDay),
    renewalFixedMonth: isManual ? null : toNumber(v.renewalFixedMonth),

    carryoverType: v.carryoverType,
    carryoverLimit: isLimited ? toNumber(v.carryoverLimit) : null,

    carryoverExpiryType: isAfterPeriod
      ? TimeOffPolicyCarryoverExpiryType.AfterPeriod
      : TimeOffPolicyCarryoverExpiryType.Never,
    carryoverExpiryValue: isAfterPeriod ? toNumber(v.carryoverExpiryValue) : null,
    carryoverExpiryUnit: isAfterPeriod ? v.carryoverExpiryUnit : null,

    allowNegativeCarryover: v.allowNegativeCarryover,
    negativeCarryoverLimit: v.allowNegativeCarryover ? toNumber(v.negativeCarryoverLimit) : null,

    allowNegativeBalance: v.allowNegativeBalance,
    maxNegativeBalance: v.allowNegativeBalance ? toNumber(v.maxNegativeBalance) : null,
    negativeBalanceCappedByQuota: v.negativeBalanceCappedByQuota,
  };
}

export function buildRequestRulesRequest(
  v: PolicyWizardValues,
): UpdateTimeOffPolicyRequestRulesRequest {
  const isFromDuration =
    v.reqCertificateRequirementType === TimeOffCertificateRequirementType.FromDuration;
  return {
    minRequestUnit: v.reqMinRequestUnit,
    maxRequestUnit: v.reqMaxRequestUnit === "" ? null : v.reqMaxRequestUnit,
    allowHalfDay: v.reqAllowHalfDay,
    allowHourlyRequests: v.reqAllowHourly,
    maxDurationPerRequest: toNumber(v.reqMaxDurationPerRequest),
    minGapBetweenRequests: toNumber(v.reqMinGapBetweenRequests),
    allowOverlappingRequests: v.reqAllowOverlapping,
    maximumRequestDaysPerYear: toNumber(v.reqMaxRequestDaysPerYear),
    allowPastRequests: v.reqAllowPastRequests,
    pastLimitDays: v.reqAllowPastRequests ? toNumber(v.reqPastLimitDays) : null,
    noticeRequiredEnabled: v.reqNoticeRequiredEnabled,
    defaultNoticeDays: v.reqNoticeRequiredEnabled ? toNumber(v.reqDefaultNoticeDays) : null,
    certificateRequirementType: v.reqCertificateRequirementType,
    certificateRequiredFromDuration: isFromDuration
      ? toNumber(v.reqCertificateRequiredFromDuration)
      : null,
  };
}

export function buildEditRulesRequest(
  v: PolicyWizardValues,
): UpdateTimeOffPolicyEditRulesRequest {
  return {
    employeeCanEditOwnRequests: v.editEmployeeCanEditOwn,
    allowEditApprovedRequests: v.editAllowEditApproved,
    allowEditDuringActiveLeave: v.editAllowEditDuringActiveLeave,
    editRequiresReapproval: v.editRequiresReapproval,
    managerCanEditTeamRequests: v.editManagerCanEditTeam,
    adminCanEditAnyRequest: v.editAdminCanEditAny,
    allowPastEdits: v.editAllowPastEdits,
  };
}

export function buildApprovalRequest(
  v: PolicyWizardValues,
): UpdateTimeOffPolicyApprovalSettingsRequest | null {
  if (!v.apprRequiresApproval) return null;
  return {
    allApprovalsRequired: v.apprAllApprovalsRequired,
    approvalOrderStrict: v.apprApprovalOrderStrict,
    allowSubstituteApprovers: v.apprAllowSubstitutes,
    approvers: v.apprApprovers.map((a, i) => ({
      approverType: TimeOffPolicyApproverType.Manager,
      approverUserId: null,
      approvalOrder: i + 1,
      required: a.required,
    })),
  };
}

export function buildUpdatePolicyRequest(v: PolicyWizardValues): UpdateTimeOffPolicyRequest {
  const isLimited = v.carryoverType === TimeOffPolicyCarryoverType.Limited;
  const isAfterPeriod =
    v.carryoverType !== TimeOffPolicyCarryoverType.None &&
    v.carryoverExpiryType === TimeOffPolicyCarryoverExpiryType.AfterPeriod;
  const isManual = v.renewalType === TimeOffPolicyRenewalType.Manual;

  return {
    displayName: v.name.trim(),
    description: v.description.trim() || null,

    unit: v.unit,

    paid: v.paid,
    hiddenFromEmployees: v.hiddenFromEmployees,

    effectiveDate: v.effectiveDate || null,

    countingMode: v.countingMode,
    validWeekdays: v.validWeekdays,
    includePublicHolidays: v.includePublicHolidays,

    entitlementGrantingMode: v.entitlementGrantingMode,
    allowRequestsInAdvanceOfAccrual: false,

    yearlyQuota: v.unlimitedQuota ? null : toNumber(v.yearlyQuota),
    unlimitedQuota: v.unlimitedQuota,

    renewalType: v.renewalType,
    renewalFixedDay: isManual ? null : toNumber(v.renewalFixedDay),
    renewalFixedMonth: isManual ? null : toNumber(v.renewalFixedMonth),

    carryoverType: v.carryoverType,
    carryoverLimit: isLimited ? toNumber(v.carryoverLimit) : null,

    carryoverExpiryType: isAfterPeriod
      ? TimeOffPolicyCarryoverExpiryType.AfterPeriod
      : TimeOffPolicyCarryoverExpiryType.Never,
    carryoverExpiryValue: isAfterPeriod ? toNumber(v.carryoverExpiryValue) : null,
    carryoverExpiryUnit: isAfterPeriod ? v.carryoverExpiryUnit : null,

    allowNegativeCarryover: v.allowNegativeCarryover,
    negativeCarryoverLimit: v.allowNegativeCarryover ? toNumber(v.negativeCarryoverLimit) : null,

    allowNegativeBalance: v.allowNegativeBalance,
    maxNegativeBalance: v.allowNegativeBalance ? toNumber(v.maxNegativeBalance) : null,
    negativeBalanceCappedByQuota: v.negativeBalanceCappedByQuota,
  };
}

const numToStr = (n: number | null | undefined): string =>
  n === null || n === undefined ? "" : String(n);

/** Prefill wizard values from an existing policy + its sub-resources (for the Edit flow). */
export function policyToWizardValues(
  policy: TimeOffPolicy,
  requestRules?: TimeOffPolicyRequestRulesDTO,
  editRules?: TimeOffPolicyEditRulesDTO,
  approval?: TimeOffPolicyApprovalSettings,
): PolicyWizardValues {
  const d = defaultPolicyWizardValues;
  const hasApprovers = (approval?.approvers.length ?? 0) > 0;

  return {
    ...d,

    // Basics
    name: policy.displayName,
    description: policy.description ?? "",
    unit: policy.unit,
    paid: policy.paid,
    hiddenFromEmployees: policy.hiddenFromEmployees,
    effectiveDate: policy.effectiveDate ?? "",

    // Entitlement & renewal
    unlimitedQuota: policy.unlimitedQuota,
    yearlyQuota: policy.unlimitedQuota ? d.yearlyQuota : numToStr(policy.yearlyQuota),
    entitlementGrantingMode: policy.entitlementGrantingMode,
    renewalType: policy.renewalType,
    renewalFixedDay: policy.renewalFixedDay != null ? numToStr(policy.renewalFixedDay) : d.renewalFixedDay,
    renewalFixedMonth:
      policy.renewalFixedMonth != null ? numToStr(policy.renewalFixedMonth) : d.renewalFixedMonth,

    // Carryover & balance
    carryoverType: policy.carryoverType,
    carryoverLimit: numToStr(policy.carryoverLimit),
    carryoverExpiryType: policy.carryoverExpiryType,
    carryoverExpiryValue: numToStr(policy.carryoverExpiryValue),
    carryoverExpiryUnit: policy.carryoverExpiryUnit ?? d.carryoverExpiryUnit,
    allowNegativeCarryover: policy.allowNegativeCarryover,
    negativeCarryoverLimit: numToStr(policy.negativeCarryoverLimit),
    allowNegativeBalance: policy.allowNegativeBalance,
    maxNegativeBalance: numToStr(policy.maxNegativeBalance),
    negativeBalanceCappedByQuota: policy.negativeBalanceCappedByQuota,

    // Counting
    countingMode: policy.countingMode,
    validWeekdays: policy.validWeekdays,
    includePublicHolidays: policy.includePublicHolidays,

    // Requests
    reqMinRequestUnit: requestRules?.minRequestUnit ?? d.reqMinRequestUnit,
    reqMaxRequestUnit: requestRules?.maxRequestUnit ?? "",
    reqAllowHalfDay: requestRules?.allowHalfDay ?? d.reqAllowHalfDay,
    reqAllowHourly: requestRules?.allowHourlyRequests ?? d.reqAllowHourly,
    reqMaxDurationPerRequest: numToStr(requestRules?.maxDurationPerRequest),
    reqMinGapBetweenRequests: numToStr(requestRules?.minGapBetweenRequests),
    reqAllowOverlapping: requestRules?.allowOverlappingRequests ?? d.reqAllowOverlapping,
    reqMaxRequestDaysPerYear: numToStr(requestRules?.maximumRequestDaysPerYear),
    reqAllowPastRequests: requestRules?.allowPastRequests ?? d.reqAllowPastRequests,
    reqPastLimitDays: numToStr(requestRules?.pastLimitDays),
    reqNoticeRequiredEnabled: requestRules?.noticeRequiredEnabled ?? d.reqNoticeRequiredEnabled,
    reqDefaultNoticeDays: numToStr(requestRules?.defaultNoticeDays),
    reqCertificateRequirementType:
      requestRules?.certificateRequirementType ?? d.reqCertificateRequirementType,
    reqCertificateRequiredFromDuration: numToStr(requestRules?.certificateRequiredFromDuration),

    // Approvals
    apprRequiresApproval: hasApprovers,
    apprAllApprovalsRequired: approval?.allApprovalsRequired ?? d.apprAllApprovalsRequired,
    apprApprovalOrderStrict: approval?.approvalOrderStrict ?? d.apprApprovalOrderStrict,
    apprAllowSubstitutes: approval?.allowSubstituteApprovers ?? d.apprAllowSubstitutes,
    apprApprovers: hasApprovers
      ? approval!.approvers.map((a) => ({ required: a.required }))
      : d.apprApprovers,

    // Editing
    editEmployeeCanEditOwn: editRules?.employeeCanEditOwnRequests ?? d.editEmployeeCanEditOwn,
    editAllowEditApproved: editRules?.allowEditApprovedRequests ?? d.editAllowEditApproved,
    editAllowEditDuringActiveLeave:
      editRules?.allowEditDuringActiveLeave ?? d.editAllowEditDuringActiveLeave,
    editRequiresReapproval: editRules?.editRequiresReapproval ?? d.editRequiresReapproval,
    editManagerCanEditTeam: editRules?.managerCanEditTeamRequests ?? d.editManagerCanEditTeam,
    editAdminCanEditAny: editRules?.adminCanEditAnyRequest ?? d.editAdminCanEditAny,
    editAllowPastEdits: editRules?.allowPastEdits ?? d.editAllowPastEdits,
  };
}
