"use client";

import { FC, ReactNode } from "react";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("timeOff");

  const quota = policy.unlimitedQuota
    ? t("policies.overview.unlimited")
    : t("policies.overview.quotaValue", { quota: String(policy.yearlyQuota ?? 0), unit: policy.unit ?? TimeOffPolicyUnit.Days });

  const renewal =
    policy.renewalType === TimeOffPolicyRenewalType.Manual
      ? t("policies.overview.manual")
      : policy.renewalType === TimeOffPolicyRenewalType.Anniversary
        ? t("policies.overview.anniversary")
        : t("policies.overview.yearly", { day: String(policy.renewalFixedDay), month: String(policy.renewalFixedMonth) });

  const carryover =
    policy.carryoverType === TimeOffPolicyCarryoverType.None
      ? t("policies.overview.none")
      : policy.carryoverType === TimeOffPolicyCarryoverType.Unlimited
        ? t("policies.overview.unlimited")
        : t("policies.overview.limitedTo", { limit: String(policy.carryoverLimit ?? 0) });

  const carryoverExpiry =
    policy.carryoverExpiryType === TimeOffPolicyCarryoverExpiryType.AfterPeriod
      ? t("policies.overview.expiryAfter", { count: policy.carryoverExpiryValue ?? 0, unit: policy.carryoverExpiryUnit ?? "" })
      : t("policies.overview.never");

  const negativeBalance = policy.allowNegativeBalance
    ? policy.maxNegativeBalance != null
      ? t("policies.overview.allowedMax", { max: String(policy.maxNegativeBalance) })
      : t("policies.overview.allowed")
    : t("policies.overview.notAllowed");

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Section title={t("policies.overview.basics")}>
        <Row label={t("policies.overview.unit")} value={policy.unit === TimeOffPolicyUnit.Hours ? t("policies.overview.hours") : t("policies.overview.days")} />
        <Row label={t("policies.overview.payType")} value={policy.paid ? t("policies.overview.paid") : t("policies.overview.unpaid")} />
        <Row label={t("policies.overview.visibility")} value={policy.hiddenFromEmployees ? t("policies.overview.private") : t("policies.overview.visible")} />
        <Row label={t("policies.overview.effectiveDate")} value={policy.effectiveDate} />
      </Section>

      <Section title={t("policies.overview.entitlement")}>
        <Row label={t("policies.overview.quota")} value={quota} />
        <Row
          label={t("policies.overview.grantingMode")}
          value={policy.entitlementGrantingMode === TimeOffPolicyEntitlementMode.Accrued ? t("policies.overview.accrued") : t("policies.overview.upfront")}
        />
        <Row label={t("policies.overview.renewal")} value={renewal} />
      </Section>

      <Section title={t("policies.overview.carryoverSection")}>
        <Row label={t("policies.overview.carryover")} value={carryover} />
        <Row label={t("policies.overview.carriedExpiry")} value={carryoverExpiry} />
        <Row label={t("policies.overview.negativeCarryover")} value={policy.allowNegativeCarryover ? t("policies.overview.allowed") : t("policies.overview.notAllowed")} />
        <Row label={t("policies.overview.negativeBalance")} value={negativeBalance} />
      </Section>

      <Section title={t("policies.overview.counting")}>
        <Row
          label={t("policies.overview.countingMode")}
          value={policy.countingMode === TimeOffPolicyCountingMode.WorkingDays ? t("policies.overview.workingDays") : t("policies.overview.calendarDays")}
        />
        <Row
          label={t("policies.overview.publicHolidays")}
          value={policy.includePublicHolidays ? t("policies.overview.consume") : t("policies.overview.excluded")}
        />
      </Section>
    </div>
  );
};
