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
import {
  TimeOffEligibilityDelayUnit,
  TimeOffEligibilityReference,
  type TimeOffPolicyEligibilityDTO,
  type UpdateTimeOffPolicyEligibilityRequest,
} from "@/api/modules/timeOff/timeOffPolicyEligibility/dto";
import {
  TimeOffRestrictionBehavior,
  TimeOffRestrictionRecurrence,
  TimeOffRestrictionScope,
  TimeOffRestrictionType,
  type TimeOffPolicyRestrictionDTO,
  type UpdateTimeOffPolicyRestrictionsRequest,
} from "@/api/modules/timeOff/timeOffPolicyRestrictions/dto";
import {
  TimeOffAccrualFrequency,
  TimeOffAccrualTiming,
  type TimeOffPolicyAccrualDTO,
  type UpdateTimeOffPolicyAccrualRequest,
} from "@/api/modules/timeOff/timeOffPolicyAccrual/dto";
import type {
  TimeOffPolicyTenureRuleDTO,
  UpdateTimeOffPolicyTenureRulesRequest,
} from "@/api/modules/timeOff/timeOffPolicyTenureRules/dto";
import type { TimeOffPolicy, TimeOffPolicyApprovalSettings } from "@/models/timeOff";

// Weekday bitmask: Mon=1, Tue=2, Wed=4, Thu=8, Fri=16, Sat=32, Sun=64
/** Minimal user shape carried by a specific-user approval step. Structurally compatible with
 *  UserPickerField's PickedUser; on edit-prefill only `id` is known (name resolved in the UI). */
export type WizardApproverUser = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
};

export type WizardApprover = {
  type: TimeOffPolicyApproverType;
  user: WizardApproverUser | null;
};

/**
 * One row of the Restrictions step: a blackout or a coverage cap.
 *
 * Two different rules, one editor — they share a scope, a block-or-warn outcome and the moment they
 * are evaluated, and keeping them in two steps meant the scope existed on one of them and the
 * warning on the other.
 */
export type WizardRestriction = {
  type: TimeOffRestrictionType;
  scope: TimeOffRestrictionScope;
  behavior: TimeOffRestrictionBehavior;
  name: string;
  /** BLACKOUT */
  startDate: string;
  endDate: string;
  recurrence: TimeOffRestrictionRecurrence;
  /** COVERAGE_CAP */
  maxUsersAway: string;
};

export type WizardTenureRule = {
  yearsOfService: string;
  bonusDays: string;
};

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
  includePublicHolidays: boolean;

  // Requests (request-rules)
  reqMinRequestUnit: TimeOffRequestUnit;
  reqMinDurationPerRequest: string;
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
  /**
   * How a set of approvers decides. Replaced `allApprovalsRequired` + `approvalOrderStrict`, which
   * described one mechanism in two overlapping switches and could not express "any two of these
   * three" at all.
   */
  apprMode: "SEQUENTIAL" | "ALL" | "N_OF_M";
  /** Only for N_OF_M: how many of the listed approvers have to sign. */
  apprRequiredCount: string;
  apprApprovers: WizardApprover[];

  // Eligibility (eligibility)
  eligEnabled: boolean;
  eligDelayValue: string;
  eligDelayUnit: TimeOffEligibilityDelayUnit;
  eligReference: TimeOffEligibilityReference;


  // Accrual (accrual) — applies only when entitlementGrantingMode === ACCRUED
  accrualFrequency: TimeOffAccrualFrequency;
  accrualAmount: string;
  accrualCap: string;
  /** When a period's days land: as it opens, or once it has been lived through. */
  accrualTiming: TimeOffAccrualTiming;
  /** Whether days accumulate during a waiting period the person cannot yet take leave in. */
  accrueDuringWaiting: boolean;

  // Restrictions: blackouts and coverage caps together
  restrictions: WizardRestriction[];

  // Tenure rewards (tenure-rules)
  tenureRules: WizardTenureRule[];

  // Editing (edit-rules)
  editEmployeeCanEditOwn: boolean;
  editAllowEditApproved: boolean;
  editAllowEditDuringActiveLeave: boolean;
  editRequiresReapproval: boolean;
  editManagerCanEditTeam: boolean;
  editAdminCanEditAny: boolean;
  editAllowPastEdits: boolean;

  /**
   * The policy's version the wizard was filled from (edit only; absent when creating). Sent back
   * with the save so a colleague's save in between is refused with E00409 instead of overwritten.
   * It travels with the values rather than being read off the live query at save time: a refetch
   * while the wizard is open would otherwise hand the save a version the form was never filled from.
   */
  version?: number;
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
  includePublicHolidays: false,

  reqMinRequestUnit: TimeOffRequestUnit.FullDay,
  reqMinDurationPerRequest: "",
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
  apprMode: "ALL",
  apprRequiredCount: "1",
  apprApprovers: [{ type: TimeOffPolicyApproverType.Manager, user: null }],

  eligEnabled: false,
  eligDelayValue: "",
  eligDelayUnit: TimeOffEligibilityDelayUnit.Months,
  eligReference: TimeOffEligibilityReference.HireDate,


  accrualFrequency: TimeOffAccrualFrequency.Monthly,
  accrualAmount: "",
  accrualCap: "",
  accrualTiming: TimeOffAccrualTiming.EndOfPeriod,
  accrueDuringWaiting: true,

  restrictions: [],

  tenureRules: [],

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



export type WizardStepId =
  | "basics"
  | "entitlement"
  | "accrual"
  | "carryover"
  | "counting"
  | "requests"
  | "approvals"
  | "eligibility"
  | "restrictions"
  | "tenure"
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
        if (
          v.apprApprovers.some(
            (a) => a.type === TimeOffPolicyApproverType.SpecificUser && !a.user,
          )
        ) {
          return "Pick a person for each specific-user approval step.";
        }
        if (v.apprMode === "N_OF_M") {
          // The same rule the API enforces: "any 3 of these 2" is a policy nothing can ever approve,
          // which is the dead end the empty chain already had.
          const n = toNumber(v.apprRequiredCount);
          if (n === null || n < 1) return "Enter how many approvals are needed.";
          if (n > v.apprApprovers.length) {
            return `Only ${v.apprApprovers.length} approver${v.apprApprovers.length === 1 ? " is" : "s are"} listed, so ${n} approvals can never be collected.`;
          }
        }
      }
      return null;
    }
    case "eligibility": {
      if (v.eligEnabled) {
        const n = toNumber(v.eligDelayValue);
        if (n === null || n < 0) {
          return "Please enter a non-negative waiting-period value.";
        }
      }
      return null;
    }

    case "accrual": {
      if (v.entitlementGrantingMode === TimeOffPolicyEntitlementMode.Accrued) {
        const amount = toNumber(v.accrualAmount);
        if (amount !== null && amount < 0) {
          return "Accrual amount must be non-negative.";
        }
        const cap = toNumber(v.accrualCap);
        if (cap !== null && cap < 0) {
          return "Accrual cap must be non-negative.";
        }
      }
      return null;
    }
    case "restrictions": {
      for (const r of v.restrictions) {
        if (r.type === TimeOffRestrictionType.Blackout) {
          if (!r.startDate || !r.endDate) {
            return "Each blackout needs a start and an end date.";
          }
          if (r.endDate < r.startDate && r.recurrence !== TimeOffRestrictionRecurrence.Yearly) {
            return "A blackout's end date must be on or after its start date.";
          }
        } else {
          const n = toNumber(r.maxUsersAway);
          if (n === null || n < 0) {
            return "Each coverage cap needs a non-negative number of people.";
          }
        }
      }
      return null;
    }
    case "tenure": {
      const seenYears = new Set<number>();
      for (const t of v.tenureRules) {
        const years = toNumber(t.yearsOfService);
        const bonus = toNumber(t.bonusDays);
        if (years === null || years < 0 || bonus === null || bonus < 0) {
          return "Each tenure tier needs non-negative years and bonus days.";
        }
        if (seenYears.has(years)) {
          return "Tenure tiers must have distinct years of service.";
        }
        seenYears.add(years);
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
  const usesFixedDate = v.renewalType === TimeOffPolicyRenewalType.YearlyFixedDate;

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
    includePublicHolidays: v.includePublicHolidays,

    entitlementGrantingMode: v.entitlementGrantingMode,
    allowRequestsInAdvanceOfAccrual: false,

    yearlyQuota: v.unlimitedQuota ? null : toNumber(v.yearlyQuota),
    unlimitedQuota: v.unlimitedQuota,

    renewalType: v.renewalType,
    renewalFixedDay: usesFixedDate ? toNumber(v.renewalFixedDay) : null,
    renewalFixedMonth: usesFixedDate ? toNumber(v.renewalFixedMonth) : null,

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
    minDurationPerRequest: toNumber(v.reqMinDurationPerRequest),
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
): UpdateTimeOffPolicyApprovalSettingsRequest {
  // "Approval off" is now a value the policy carries rather than the absence of a settings row.
  // Returning null used to mean the call was skipped: no row was written, requests still went to
  // PENDING, and reopening the wizard showed the toggle back on.
  return {
    approvalRequired: v.apprRequiresApproval,
    approvalMode: v.apprMode,
    requiredApprovalsCount:
      v.apprMode === "N_OF_M" ? toNumber(v.apprRequiredCount) ?? 1 : null,
    // Substitutes need a delegation model that does not exist, so the setting is carried unchanged
    // rather than offered: the wizard no longer shows a switch for it. See DECISIONS.md
  // "A setting that is offered must work — and the corollary".
    allowSubstituteApprovers: false,
    approvers: v.apprApprovers.map((a, i) => ({
      approverType: a.type,
      approverUserId:
        a.type === TimeOffPolicyApproverType.SpecificUser ? a.user?.id ?? null : null,
      approvalOrder: i + 1,
    })),
  };
}

export function buildEligibilityRequest(
  v: PolicyWizardValues,
): UpdateTimeOffPolicyEligibilityRequest {
  return {
    eligibilityDelayEnabled: v.eligEnabled,
    eligibilityDelayValue: v.eligEnabled ? toNumber(v.eligDelayValue) : null,
    eligibilityDelayUnit: v.eligDelayUnit,
    eligibilityReference: v.eligReference,
  };
}

export function buildTenureRulesRequest(
  v: PolicyWizardValues,
): UpdateTimeOffPolicyTenureRulesRequest {
  return {
    tenureRules: v.tenureRules
      .filter((t) => toNumber(t.yearsOfService) !== null && toNumber(t.bonusDays) !== null)
      .map((t) => ({
        yearsOfService: toNumber(t.yearsOfService) as number,
        bonusDays: toNumber(t.bonusDays) as number,
      })),
  };
}

export function buildRestrictionsRequest(
  v: PolicyWizardValues,
): UpdateTimeOffPolicyRestrictionsRequest {
  return {
    restrictions: v.restrictions.map((r) => {
      const blackout = r.type === TimeOffRestrictionType.Blackout;
      return {
        restrictionType: r.type,
        scope: r.scope,
        behavior: r.behavior,
        name: r.name.trim() || null,
        // Each type carries its own payload and not the other's — the API refuses a mixture, and
        // sending the other half is how the two used to drift apart.
        startDate: blackout ? r.startDate : null,
        endDate: blackout ? r.endDate : null,
        recurrence: blackout ? r.recurrence : TimeOffRestrictionRecurrence.None,
        maxUsersAway: blackout ? null : toNumber(r.maxUsersAway),
      };
    }),
  };
}

export function buildAccrualRequest(
  v: PolicyWizardValues,
): UpdateTimeOffPolicyAccrualRequest {
  return {
    accrualFrequency: v.accrualFrequency,
    accrualAmount: toNumber(v.accrualAmount),
    accrualCap: toNumber(v.accrualCap),
    accrualTiming: v.accrualTiming,
    accrueDuringWaitingPeriod: v.accrueDuringWaiting,
  };
}

export function buildUpdatePolicyRequest(v: PolicyWizardValues): UpdateTimeOffPolicyRequest {
  const isLimited = v.carryoverType === TimeOffPolicyCarryoverType.Limited;
  const isAfterPeriod =
    v.carryoverType !== TimeOffPolicyCarryoverType.None &&
    v.carryoverExpiryType === TimeOffPolicyCarryoverExpiryType.AfterPeriod;
  const usesFixedDate = v.renewalType === TimeOffPolicyRenewalType.YearlyFixedDate;

  return {
    displayName: v.name.trim(),
    description: v.description.trim() || null,

    unit: v.unit,

    paid: v.paid,
    hiddenFromEmployees: v.hiddenFromEmployees,

    effectiveDate: v.effectiveDate || null,

    countingMode: v.countingMode,
    includePublicHolidays: v.includePublicHolidays,

    entitlementGrantingMode: v.entitlementGrantingMode,
    allowRequestsInAdvanceOfAccrual: false,

    yearlyQuota: v.unlimitedQuota ? null : toNumber(v.yearlyQuota),
    unlimitedQuota: v.unlimitedQuota,

    renewalType: v.renewalType,
    renewalFixedDay: usesFixedDate ? toNumber(v.renewalFixedDay) : null,
    renewalFixedMonth: usesFixedDate ? toNumber(v.renewalFixedMonth) : null,

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
  eligibility?: TimeOffPolicyEligibilityDTO,
  accrual?: TimeOffPolicyAccrualDTO,
  restrictions?: TimeOffPolicyRestrictionDTO[],
  tenureRules?: TimeOffPolicyTenureRuleDTO[],
): PolicyWizardValues {
  const d = defaultPolicyWizardValues;
  const hasApprovers = (approval?.approvers.length ?? 0) > 0;
  // "Requires approval" is the policy's own answer, not a guess from whether anyone is listed.
  // Reading it off the approver list is what made the toggle come back on when the wizard was
  // reopened: turning it off wrote nothing, so the next read saw the old chain and inferred "yes".
  // `configured` distinguishes "nobody has set this up" from "set up, and the answer is no".
  const requiresApproval = approval?.configured
    ? approval.approvalRequired
    : hasApprovers;

  return {
    ...d,

    version: policy.version,

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
    includePublicHolidays: policy.includePublicHolidays,

    // Requests
    reqMinRequestUnit: requestRules?.minRequestUnit ?? d.reqMinRequestUnit,
    reqMinDurationPerRequest: numToStr(requestRules?.minDurationPerRequest),
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
    apprRequiresApproval: requiresApproval,
    apprMode: approval?.approvalMode ?? d.apprMode,
    apprRequiredCount:
      approval?.requiredApprovalsCount != null
        ? numToStr(approval.requiredApprovalsCount)
        : d.apprRequiredCount,
    apprApprovers: hasApprovers
      ? approval!.approvers.map((a) => ({
          type: a.approverType,
          user: a.approverUserId ? { id: a.approverUserId } : null,
        }))
      : d.apprApprovers,

    // Eligibility
    eligEnabled: eligibility?.eligibilityDelayEnabled ?? d.eligEnabled,
    eligDelayValue: numToStr(eligibility?.eligibilityDelayValue),
    eligDelayUnit: eligibility?.eligibilityDelayUnit ?? d.eligDelayUnit,
    eligReference: eligibility?.eligibilityReference ?? d.eligReference,

    // Coverage

    // Accrual
    accrualFrequency: accrual?.accrualFrequency ?? d.accrualFrequency,
    accrualAmount: numToStr(accrual?.accrualAmount),
    accrualCap: numToStr(accrual?.accrualCap),
    accrualTiming: accrual?.accrualTiming ?? d.accrualTiming,
    accrueDuringWaiting: accrual?.accrueDuringWaitingPeriod ?? d.accrueDuringWaiting,

    // Restrictions: blackouts and coverage caps, one list
    restrictions: (restrictions ?? []).map((r) => ({
      type: r.restrictionType,
      scope: r.scope,
      behavior: r.behavior,
      name: r.name ?? "",
      startDate: r.startDate ?? "",
      endDate: r.endDate ?? "",
      recurrence: r.recurrence,
      maxUsersAway: numToStr(r.maxUsersAway),
    })),

    // Tenure rewards
    tenureRules: (tenureRules ?? []).map((t) => ({
      yearsOfService: numToStr(t.yearsOfService),
      bonusDays: numToStr(t.bonusDays),
    })),

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
