"use client";

import { FC, ReactNode } from "react";

import {
  TimeOffPolicyCarryoverExpiryType,
  TimeOffPolicyCarryoverType,
  TimeOffPolicyCountingMode,
  TimeOffPolicyEntitlementMode,
  TimeOffPolicyRenewalType,
  TimeOffPolicyUnit,
} from "@/api/modules/timeOff/timeOffPolicies/dto";
import type { TimeOffPolicy } from "@/models/timeOff";
import {
} from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/components/wizard";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-card border border-divider p-4">
      <h3 className="mb-2 text-hint font-semibold text-tertiary">{title}</h3>
      <div className="divide-y divide-divider">{children}</div>
    </div>
  );
}

/** A missing value renders as an empty cell — no dash, no "Not set". Rule: ui/FORMS_AND_FIELDS.md 4. */
function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <span className="text-body text-tertiary">{label}</span>
      <span className="text-right text-body font-medium text-primary">{value}</span>
    </div>
  );
}

export const PolicyOverview: FC<{ policy: TimeOffPolicy }> = ({ policy }) => {
  const unitLabel = policy.unit === TimeOffPolicyUnit.Hours ? "hours" : "days";

  const quota = policy.unlimitedQuota
    ? "Unlimited"
    : `${policy.yearlyQuota ?? 0} ${unitLabel}/year`;

  const renewal =
    policy.renewalType === TimeOffPolicyRenewalType.Manual
      ? "Manual"
      : `${policy.renewalFixedDay}/${policy.renewalFixedMonth} yearly`;

  const carryover =
    policy.carryoverType === TimeOffPolicyCarryoverType.None
      ? "None"
      : policy.carryoverType === TimeOffPolicyCarryoverType.Unlimited
        ? "Unlimited"
        : `Limited to ${policy.carryoverLimit ?? 0}`;

  const carryoverExpiry =
    policy.carryoverExpiryType === TimeOffPolicyCarryoverExpiryType.AfterPeriod
      ? `After ${policy.carryoverExpiryValue ?? 0} ${(policy.carryoverExpiryUnit ?? "").toLowerCase()}`
      : "Never";

  const negativeBalance = policy.allowNegativeBalance
    ? policy.maxNegativeBalance != null
      ? `Allowed (max ${policy.maxNegativeBalance})`
      : "Allowed"
    : "Not allowed";

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Section title="Basics">
        <Row label="Unit" value={policy.unit === TimeOffPolicyUnit.Hours ? "Hours" : "Days"} />
        <Row label="Pay type" value={policy.paid ? "Paid" : "Unpaid"} />
        <Row label="Visibility" value={policy.hiddenFromEmployees ? "Private — colleagues see “Time off”" : "Leave type visible to colleagues"} />
        <Row label="Effective date" value={policy.effectiveDate} />
      </Section>

      <Section title="Entitlement & renewal">
        <Row label="Quota" value={quota} />
        <Row
          label="Granting mode"
          value={policy.entitlementGrantingMode === TimeOffPolicyEntitlementMode.Accrued ? "Accrued" : "Upfront"}
        />
        <Row label="Renewal" value={renewal} />
      </Section>

      <Section title="Carryover & balance">
        <Row label="Carryover" value={carryover} />
        <Row label="Carried-over expiry" value={carryoverExpiry} />
        <Row label="Negative carryover" value={policy.allowNegativeCarryover ? "Allowed" : "Not allowed"} />
        <Row label="Negative balance" value={negativeBalance} />
      </Section>

      <Section title="Counting">
        <Row
          label="Counting mode"
          value={policy.countingMode === TimeOffPolicyCountingMode.WorkingDays ? "Working days" : "Calendar days"}
        />
        <Row
          label="Public holidays"
          value={policy.includePublicHolidays ? "Consume balance" : "Excluded"}
        />
      </Section>
    </div>
  );
};
