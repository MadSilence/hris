"use client";

import { FC, ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Add01Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

import { Button } from "@/components/desact/button";
import { Input } from "@/components/desact/input";
import { Label } from "@/components/desact/label";
import { Switch } from "@/components/desact/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/desact/select";
import {
  TimeOffPolicyCarryoverExpiryType,
  TimeOffPolicyCarryoverExpiryUnit,
  TimeOffPolicyCarryoverType,
  TimeOffPolicyCountingMode,
  TimeOffPolicyEntitlementMode,
  TimeOffPolicyRenewalType,
  TimeOffPolicyUnit,
} from "@/api/modules/timeOff/timeOffPolicies/dto";
import { TimeOffPolicyApproverType } from "@/api/modules/timeOff/timeOffPolicyApprovalSettings/dto";
import {
  TimeOffEligibilityDelayUnit,
  TimeOffEligibilityReference,
} from "@/api/modules/timeOff/timeOffPolicyEligibility/dto";
import {
  TimeOffRestrictionBehavior,
  TimeOffRestrictionRecurrence,
  TimeOffRestrictionScope,
  TimeOffRestrictionType,
} from "@/api/modules/timeOff/timeOffPolicyRestrictions/dto";
import {
  TimeOffAccrualFrequency,
  TimeOffAccrualTiming,
} from "@/api/modules/timeOff/timeOffPolicyAccrual/dto";
import {
  UserPickerField,
  type PickedUser,
} from "@/components/modules/settings/shared/UserPickerField/UserPickerField";
import { useUser } from "@/components/hooks/useUser/useUser";
import { useRoles } from "@/components/modules/settings/modules/roles/hooks/useRoles";
import {
  PolicyWizardValues,
  WizardApprover,
  WizardApproverUser,
  WizardRestriction,
  WizardTenureRule,
} from "./policyWizardTypes";
import { DatePicker } from "@/components/ui/DatePicker";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { FormError } from "@/components/feedback/FormError";
import { InlineAlert } from "@/components/desact/alert";
import { PolicyColorPicker } from "@/components/ui/PolicyColorPicker";
import { PolicyMarker } from "@/components/ui/PolicyMarker";
import type { TagColor } from "@/lib/theme/tags";

export type WizardSetter = <K extends keyof PolicyWizardValues>(
  key: K,
  value: PolicyWizardValues[K],
) => void;

type StepProps = { values: PolicyWizardValues; set: WizardSetter };

type TimeOffT = ReturnType<typeof useTranslations<"timeOff">>;

// ── Shared helpers ───────────────────────────────────────────────────

function StepIntro({ children }: { children: ReactNode }) {
  return <p className="text-body leading-relaxed text-tertiary">{children}</p>;
}

function Field({
  label,
  hint,
  htmlFor,
  error,
  children,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  error?: string | null;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && <FormError message={error} />}
      {hint && <p className="text-hint text-tertiary">{hint}</p>}
    </div>
  );
}

/** Lightweight switch row — no heavy box, just label + hint + switch. */
function ToggleField({
  label,
  hint,
  checked,
  onCheckedChange,
  disabled,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="py-1">
      <div className="flex items-center justify-between gap-4">
        <p className="text-body font-medium text-primary">{label}</p>
        <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
      </div>
      {hint && <p className="mt-0.5 max-w-[85%] text-hint text-tertiary">{hint}</p>}
    </div>
  );
}

/** Indented group for fields revealed by a toggle — shows they belong together. */
function Reveal({ children }: { children: ReactNode }) {
  return (
    <div className="ml-0.5 space-y-4 border-l-2 border-divider pl-4">{children}</div>
  );
}

// ── Step 1: Basics ───────────────────────────────────────────────────

/** `nameError` is a refusal of the name by the server — a name already taken (TOP00004). */
export const BasicsStep: FC<StepProps & { nameError?: string | null; usedBy?: Partial<Record<TagColor, string[]>> }> = ({
  values,
  set,
  nameError,
  usedBy,
}) => {
  const tCommon = useTranslations("common");
  const t = useTranslations("timeOff");
  return (
  <div className="space-y-6">
    <StepIntro>{t("policyWizard.basics.intro")}</StepIntro>

    <Field label={t("policyWizard.basics.name")} htmlFor="wiz-name" error={nameError}>
      <Input
        id="wiz-name"
        aria-invalid={nameError ? true : undefined}
        value={values.name}
        onChange={(e) => set("name", e.currentTarget.value)}
      />
    </Field>

    <Field label={t("policyWizard.basics.description")} htmlFor="wiz-desc" hint={t("policyWizard.basics.descriptionHint")}>
      <Input
        id="wiz-desc"
        value={values.description}
        onChange={(e) => set("description", e.currentTarget.value)}
      />
    </Field>

    <div className="space-y-2">
      <Label id="wiz-color-label">{tCommon("tagColor.policyColor")}</Label>
      <PolicyColorPicker
        aria-labelledby="wiz-color-label"
        value={values.color}
        onChange={(color) => set("color", color)}
        usedBy={usedBy}
      />
    </div>

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field label={t("policyWizard.basics.unit")} htmlFor="wiz-unit">
        <Select value={values.unit} onValueChange={(v) => set("unit", v as TimeOffPolicyUnit)}>
          <SelectTrigger id="wiz-unit">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TimeOffPolicyUnit.Days}>{t("policyWizard.basics.days")}</SelectItem>
            <SelectItem value={TimeOffPolicyUnit.Hours}>{t("policyWizard.basics.hours")}</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      <Field label={t("policyWizard.basics.effectiveDate")} htmlFor="wiz-eff" hint={t("policyWizard.basics.effectiveHint")}>
        <DatePicker
          id="wiz-eff"
          value={values.effectiveDate}
          onChange={(next) => set("effectiveDate", next)}
        />
      </Field>
    </div>

    <div className="space-y-1 pt-1">
      <ToggleField
        label={t("policyWizard.basics.paid")}
        hint={t("policyWizard.basics.paidHint")}
        checked={values.paid}
        onCheckedChange={(v) => set("paid", v)}
      />
      <ToggleField
        label={t("policyWizard.basics.private")}
        hint={t("policyWizard.basics.privateHint")}
        checked={values.hiddenFromEmployees}
        onCheckedChange={(v) => set("hiddenFromEmployees", v)}
      />
    </div>
  </div>
  );
};

// ── Step 2: Entitlement & renewal ────────────────────────────────────

// The renewal Select offers two UI-only presets on top of the backend enum:
// "Year start" and "Custom date" both map to YEARLY_FIXED_DATE (year start = 1 Jan).
const RENEWAL_YEAR_START = "YEAR_START";
const RENEWAL_FIXED_DATE = "FIXED_DATE";

const isYearStart = (v: PolicyWizardValues) =>
  v.renewalFixedDay.trim() === "1" && v.renewalFixedMonth.trim() === "1";

function renewalSelectValue(v: PolicyWizardValues): string {
  if (v.renewalType === TimeOffPolicyRenewalType.Anniversary)
    return TimeOffPolicyRenewalType.Anniversary;
  if (v.renewalType === TimeOffPolicyRenewalType.Manual)
    return TimeOffPolicyRenewalType.Manual;
  return isYearStart(v) ? RENEWAL_YEAR_START : RENEWAL_FIXED_DATE;
}

function setRenewalMode(set: WizardSetter, mode: string) {
  switch (mode) {
    case RENEWAL_YEAR_START:
      set("renewalType", TimeOffPolicyRenewalType.YearlyFixedDate);
      set("renewalFixedDay", "1");
      set("renewalFixedMonth", "1");
      break;
    case RENEWAL_FIXED_DATE:
      set("renewalType", TimeOffPolicyRenewalType.YearlyFixedDate);
      break;
    case TimeOffPolicyRenewalType.Anniversary:
      set("renewalType", TimeOffPolicyRenewalType.Anniversary);
      break;
    case TimeOffPolicyRenewalType.Manual:
      set("renewalType", TimeOffPolicyRenewalType.Manual);
      break;
  }
}

function renewalSummary(v: PolicyWizardValues, t: TimeOffT): string {
  switch (v.renewalType) {
    case TimeOffPolicyRenewalType.Manual:
      // "Manual" implied an action somebody performs. There is none: the balance simply never
      // renews, and an administrator adjusts it when they mean to.
      return t("policyWizard.entitlement.summaryManual");
    case TimeOffPolicyRenewalType.Anniversary:
      return t("policyWizard.entitlement.summaryHire");
    default:
      return isYearStart(v)
        ? t("policyWizard.entitlement.yearStart")
        : t("policyWizard.entitlement.summaryYearly", { day: v.renewalFixedDay, month: v.renewalFixedMonth });
  }
}

export const EntitlementStep: FC<StepProps> = ({ values, set }) => {
  const t = useTranslations("timeOff");
  return (
  <div className="space-y-6">
    <StepIntro>{t("policyWizard.entitlement.intro")}</StepIntro>

    <ToggleField
      label={t("policyWizard.entitlement.unlimited")}
      hint={t("policyWizard.entitlement.unlimitedHint")}
      checked={values.unlimitedQuota}
      onCheckedChange={(v) => set("unlimitedQuota", v)}
    />

    {!values.unlimitedQuota && (
      <Reveal>
        <Field
          label={t("policyWizard.entitlement.quota")}
          htmlFor="wiz-quota"
          hint={t("policyWizard.entitlement.quotaHint", { unit: values.unit })}
        >
          <Input
            id="wiz-quota"
            type="number"
            min={0}
            value={values.yearlyQuota}
            onChange={(e) => set("yearlyQuota", e.currentTarget.value)}
          />
        </Field>
      </Reveal>
    )}

    <Field label={t("policyWizard.entitlement.grantingMode")} htmlFor="wiz-grant" hint={t("policyWizard.entitlement.grantingHint")}>
      <Select
        value={values.entitlementGrantingMode}
        onValueChange={(v) => set("entitlementGrantingMode", v as TimeOffPolicyEntitlementMode)}
      >
        <SelectTrigger id="wiz-grant">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={TimeOffPolicyEntitlementMode.Upfront}>{t("policyWizard.entitlement.upfront")}</SelectItem>
          <SelectItem value={TimeOffPolicyEntitlementMode.Accrued}>
            {t("policyWizard.entitlement.accrued")}
          </SelectItem>
        </SelectContent>
      </Select>
    </Field>

    <Field label={t("policyWizard.entitlement.renewal")} htmlFor="wiz-renewal" hint={t("policyWizard.entitlement.renewalHint")}>
      <Select value={renewalSelectValue(values)} onValueChange={(v) => setRenewalMode(set, v)}>
        <SelectTrigger id="wiz-renewal">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={RENEWAL_YEAR_START}>{t("policyWizard.entitlement.yearStart")}</SelectItem>
          <SelectItem value={RENEWAL_FIXED_DATE}>{t("policyWizard.entitlement.customDate")}</SelectItem>
          <SelectItem value={TimeOffPolicyRenewalType.Anniversary}>
            {t("policyWizard.entitlement.hireDate")}
          </SelectItem>
          <SelectItem value={TimeOffPolicyRenewalType.Manual}>
            {t("policyWizard.entitlement.never")}
          </SelectItem>
        </SelectContent>
      </Select>
    </Field>

    {renewalSelectValue(values) === RENEWAL_FIXED_DATE && (
      <Reveal>
        <div className="grid grid-cols-2 gap-4">
          <Field label={t("policyWizard.entitlement.renewalDay")} htmlFor="wiz-rday">
            <Input
              id="wiz-rday"
              type="number"
              min={1}
              max={31}
              value={values.renewalFixedDay}
              onChange={(e) => set("renewalFixedDay", e.currentTarget.value)}
            />
          </Field>
          <Field label={t("policyWizard.entitlement.renewalMonth")} htmlFor="wiz-rmonth">
            <Input
              id="wiz-rmonth"
              type="number"
              min={1}
              max={12}
              value={values.renewalFixedMonth}
              onChange={(e) => set("renewalFixedMonth", e.currentTarget.value)}
            />
          </Field>
        </div>
      </Reveal>
    )}

    {values.renewalType === TimeOffPolicyRenewalType.Anniversary && (
      <p className="text-hint text-tertiary">
        {t("policyWizard.entitlement.anniversaryHint")}
      </p>
    )}
  </div>
  );
};

// ── Step 3: Carryover & balance ──────────────────────────────────────

export const CarryoverStep: FC<StepProps> = ({ values, set }) => {
  const t = useTranslations("timeOff");
  return (
  <div className="space-y-6">
    <StepIntro>{t("policyWizard.carryover.intro")}</StepIntro>

    <Field label={t("policyWizard.carryover.carryover")} htmlFor="wiz-co" hint={t("policyWizard.carryover.carryoverHint")}>
      <Select
        value={values.carryoverType}
        onValueChange={(v) => set("carryoverType", v as TimeOffPolicyCarryoverType)}
      >
        <SelectTrigger id="wiz-co">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={TimeOffPolicyCarryoverType.None}>{t("policyWizard.carryover.none")}</SelectItem>
          <SelectItem value={TimeOffPolicyCarryoverType.Unlimited}>{t("policyWizard.carryover.unlimited")}</SelectItem>
          <SelectItem value={TimeOffPolicyCarryoverType.Limited}>{t("policyWizard.carryover.limited")}</SelectItem>
        </SelectContent>
      </Select>
    </Field>

    {values.carryoverType !== TimeOffPolicyCarryoverType.None && (
      <Reveal>
        {values.carryoverType === TimeOffPolicyCarryoverType.Limited && (
          <Field label={t("policyWizard.carryover.limit")} htmlFor="wiz-colimit" hint={t("policyWizard.carryover.limitHint")}>
            <Input
              id="wiz-colimit"
              type="number"
              min={0}
              value={values.carryoverLimit}
              onChange={(e) => set("carryoverLimit", e.currentTarget.value)}
            />
          </Field>
        )}

        <Field label={t("policyWizard.carryover.expires")} htmlFor="wiz-coexp">
          <Select
            value={values.carryoverExpiryType}
            onValueChange={(v) => set("carryoverExpiryType", v as TimeOffPolicyCarryoverExpiryType)}
          >
            <SelectTrigger id="wiz-coexp">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TimeOffPolicyCarryoverExpiryType.Never}>{t("policyWizard.carryover.never")}</SelectItem>
              <SelectItem value={TimeOffPolicyCarryoverExpiryType.AfterPeriod}>{t("policyWizard.carryover.afterPeriod")}</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        {values.carryoverExpiryType === TimeOffPolicyCarryoverExpiryType.AfterPeriod && (
          <div className="grid grid-cols-2 gap-4">
            <Field label={t("policyWizard.carryover.expiresAfter")} htmlFor="wiz-coexpval">
              <Input
                id="wiz-coexpval"
                type="number"
                min={1}
                value={values.carryoverExpiryValue}
                onChange={(e) => set("carryoverExpiryValue", e.currentTarget.value)}
              />
            </Field>
            <Field label={t("policyWizard.carryover.unit")} htmlFor="wiz-coexpunit">
              <Select
                value={values.carryoverExpiryUnit}
                onValueChange={(v) => set("carryoverExpiryUnit", v as TimeOffPolicyCarryoverExpiryUnit)}
              >
                <SelectTrigger id="wiz-coexpunit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TimeOffPolicyCarryoverExpiryUnit.Days}>{t("policyWizard.carryover.days")}</SelectItem>
                  <SelectItem value={TimeOffPolicyCarryoverExpiryUnit.Months}>{t("policyWizard.carryover.months")}</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
        )}
      </Reveal>
    )}

    <div className="border-t border-divider pt-5">
      <ToggleField
        label={t("policyWizard.carryover.allowNegative")}
        hint={t("policyWizard.carryover.allowNegativeHint")}
        checked={values.allowNegativeBalance}
        onCheckedChange={(v) => set("allowNegativeBalance", v)}
      />
      {values.allowNegativeBalance && (
        <Reveal>
          <Field label={t("policyWizard.carryover.maxNegative")} htmlFor="wiz-negbal" hint={t("policyWizard.carryover.maxNegativeHint")}>
            <Input
              id="wiz-negbal"
              type="number"
              value={values.maxNegativeBalance}
              onChange={(e) => set("maxNegativeBalance", e.currentTarget.value)}
            />
          </Field>
          <ToggleField
            label={t("policyWizard.carryover.capByQuota")}
            hint={t("policyWizard.carryover.capByQuotaHint")}
            checked={values.negativeBalanceCappedByQuota}
            onCheckedChange={(v) => set("negativeBalanceCappedByQuota", v)}
          />
        </Reveal>
      )}

      <div className="pt-1">
        <ToggleField
          label={t("policyWizard.carryover.allowNegativeCarryover")}
          hint={t("policyWizard.carryover.allowNegativeCarryoverHint")}
          checked={values.allowNegativeCarryover}
          onCheckedChange={(v) => set("allowNegativeCarryover", v)}
        />
        {values.allowNegativeCarryover && (
          <Reveal>
            <Field label={t("policyWizard.carryover.negativeCarryoverLimit")} htmlFor="wiz-negco">
              <Input
                id="wiz-negco"
                type="number"
                value={values.negativeCarryoverLimit}
                onChange={(e) => set("negativeCarryoverLimit", e.currentTarget.value)}
              />
            </Field>
          </Reveal>
        )}
      </div>
    </div>
  </div>
  );
};

// ── Step 4: Counting ─────────────────────────────────────────────────

export const CountingStep: FC<StepProps> = ({ values, set }) => {
  const t = useTranslations("timeOff");
  return (
  <div className="space-y-6">
    <StepIntro>{t("policyWizard.counting.intro")}</StepIntro>

    <Field label={t("policyWizard.counting.mode")} htmlFor="wiz-count" hint={t("policyWizard.counting.modeHint")}>
      <Select
        value={values.countingMode}
        onValueChange={(v) => set("countingMode", v as TimeOffPolicyCountingMode)}
      >
        <SelectTrigger id="wiz-count">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={TimeOffPolicyCountingMode.CalendarDays}>{t("policyWizard.counting.calendarDays")}</SelectItem>
          <SelectItem value={TimeOffPolicyCountingMode.WorkingDays}>{t("policyWizard.counting.workingDays")}</SelectItem>
        </SelectContent>
      </Select>
    </Field>

    {/* The weekday picker is gone on purpose. Which days a person works is a fact about the
        person, not about the policy: it now comes from their own work schedule, falling back to the
        company week. A third per-policy layer meant a company whose week is Sun–Thu got Mon–Fri
        charges from a policy that looked correctly configured. */}

    <ToggleField
      label={t("policyWizard.counting.holidays")}
      hint={t("policyWizard.counting.holidaysHint")}
      checked={values.includePublicHolidays}
      onCheckedChange={(v) => set("includePublicHolidays", v)}
    />
  </div>
  );
};

// ── Step 5: Requests ─────────────────────────────────────────────────

export const RequestsStep: FC<StepProps> = ({ values, set }) => {
  const t = useTranslations("timeOff");
  return (
  <div className="space-y-6">
    <StepIntro>{t("policyWizard.requests.intro")}</StepIntro>

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {/* "Minimum request unit" and "Certificate / attachment" are not offered: both were stored and
          nothing enforced them — every request is whole days, and leave has no attachments. They come
          back with hourly leave and attachments (decided 2026-10-27, NEED_TO_DISCUSS § 17); the stored
          values still round-trip untouched. */}
      <Field label={t("policyWizard.requests.minDuration")} htmlFor="wiz-mindur" hint={t("policyWizard.requests.minDurationHint")}>
        <Input
          id="wiz-mindur"
          type="number"
          min={0}
          value={values.reqMinDurationPerRequest}
          onChange={(e) => set("reqMinDurationPerRequest", e.currentTarget.value)}
        />
      </Field>
    </div>

    <div className="space-y-1">
      <ToggleField
        label={t("policyWizard.requests.overlapping")}
        hint={t("policyWizard.requests.overlappingHint")}
        checked={values.reqAllowOverlapping}
        onCheckedChange={(v) => set("reqAllowOverlapping", v)}
      />
    </div>

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field label={t("policyWizard.requests.maxDuration")} htmlFor="wiz-maxdur">
        <Input
          id="wiz-maxdur"
          type="number"
          min={0}
          value={values.reqMaxDurationPerRequest}
          onChange={(e) => set("reqMaxDurationPerRequest", e.currentTarget.value)}
        />
      </Field>
      <Field label={t("policyWizard.requests.minGap")} htmlFor="wiz-mingap">
        <Input
          id="wiz-mingap"
          type="number"
          min={0}
          value={values.reqMinGapBetweenRequests}
          onChange={(e) => set("reqMinGapBetweenRequests", e.currentTarget.value)}
        />
      </Field>
      <Field label={t("policyWizard.requests.maxPerYear")} htmlFor="wiz-maxyear" hint={t("policyWizard.requests.maxPerYearHint")}>
        <Input
          id="wiz-maxyear"
          type="number"
          min={0}
          value={values.reqMaxRequestDaysPerYear}
          onChange={(e) => set("reqMaxRequestDaysPerYear", e.currentTarget.value)}
        />
      </Field>
    </div>

    <div className="border-t border-divider pt-5">
      <ToggleField
        label={t("policyWizard.requests.allowPast")}
        checked={values.reqAllowPastRequests}
        onCheckedChange={(v) => {
          set("reqAllowPastRequests", v);
          // Turning this on clears the rule it contradicts, rather than leaving a switch that says
          // "on" and does nothing.
          if (v) set("reqNoticeRequiredEnabled", false);
        }}
      />
      {values.reqAllowPastRequests && (
        <Reveal>
          <Field label={t("policyWizard.requests.daysBack")} htmlFor="wiz-pastlimit">
            <Input
              id="wiz-pastlimit"
              type="number"
              min={0}
              value={values.reqPastLimitDays}
              onChange={(e) => set("reqPastLimitDays", e.currentTarget.value)}
            />
          </Field>
        </Reveal>
      )}

      <div className="pt-1">
        {/* The two are mutually exclusive, and the API refuses the combination — a past date always
            falls before today + N, so notice would refuse everything "allow in the past" allows.
            Greyed rather than hidden: a disappearing switch reads as a bug. */}
        <ToggleField
          label={t("policyWizard.requests.notice")}
          hint={
            values.reqAllowPastRequests
              ? t("policyWizard.requests.noticeDisabledHint")
              : undefined
          }
          disabled={values.reqAllowPastRequests}
          checked={values.reqNoticeRequiredEnabled && !values.reqAllowPastRequests}
          onCheckedChange={(v) => set("reqNoticeRequiredEnabled", v)}
        />
        {values.reqNoticeRequiredEnabled && (
          <Reveal>
            <Field label={t("policyWizard.requests.noticeDays")} htmlFor="wiz-notice">
              <Input
                id="wiz-notice"
                type="number"
                min={0}
                value={values.reqDefaultNoticeDays}
                onChange={(e) => set("reqDefaultNoticeDays", e.currentTarget.value)}
              />
            </Field>
          </Reveal>
        )}
      </div>
    </div>

  </div>
  );
};

// ── Step 6: Approvals ────────────────────────────────────────────────

const hasApproverName = (u: WizardApproverUser) =>
  Boolean(u.firstName || u.lastName || u.email);

/** Resolves a prefilled approver (id-only) to a display name via the global user cache, so the
 *  picker shows the person rather than "Unknown" when editing an existing policy. */
const ResolvingApproverField: FC<{
  user: WizardApproverUser;
  onChange: (u: PickedUser | null) => void;
}> = ({ user, onChange }) => {
  const t = useTranslations("timeOff");
  const { data } = useUser(user.id);
  const value: PickedUser = data
    ? {
        id: user.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        avatarUrl: data.avatarUrl,
      }
    : user;
  return <UserPickerField value={value} onChange={onChange} placeholder={t("policyWizard.approvals.selectApprover")} allowClear={false} />;
};

const ApproverUserField: FC<{
  user: WizardApproverUser | null;
  onChange: (u: PickedUser | null) => void;
}> = ({ user, onChange }) => {
  const t = useTranslations("timeOff");
  return user && !hasApproverName(user) ? (
    <ResolvingApproverField user={user} onChange={onChange} />
  ) : (
    <UserPickerField value={user} onChange={onChange} placeholder={t("policyWizard.approvals.selectApprover")} allowClear={false} />
  );
};

const FALLBACK_DEFAULT = "__default__";
const FALLBACK_NONE = "__none__";

/**
 * The policy's fallback: a role, so it survives the next leaver. Any step that resolves to nobody —
 * a named approver who left, a manager step for somebody with no manager, an approver away with
 * nobody standing in — goes to its holders. No fallback is allowed and warned about, the way a chain
 * with nobody in it is.
 *
 * The roles list needs ROLES.ROLE VIEW; without it the field still shows the role already chosen.
 */
export const FallbackRoleField: FC<StepProps> = ({ values, set }) => {
  const t = useTranslations("timeOff");
  const { data: roles } = useRoles();
  const live = (roles ?? []).filter((r) => !r.archived && !r.systemOwner);
  const known = values.apprFallbackRoleId && !live.some((r) => r.id === values.apprFallbackRoleId)
    ? [{ id: values.apprFallbackRoleId, name: values.apprFallbackRoleName ?? t("policyWizard.approvals.chosenRole") }]
    : [];
  const current = values.apprFallbackDefault
    ? FALLBACK_DEFAULT
    : values.apprFallbackRoleId ?? FALLBACK_NONE;
  const none = !values.apprFallbackDefault && !values.apprFallbackRoleId;

  const choose = (v: string) => {
    if (v === FALLBACK_DEFAULT) {
      set("apprFallbackDefault", true);
      set("apprFallbackRoleId", null);
      set("apprFallbackRoleName", null);
      return;
    }
    set("apprFallbackDefault", false);
    if (v === FALLBACK_NONE) {
      set("apprFallbackRoleId", null);
      set("apprFallbackRoleName", null);
      return;
    }
    set("apprFallbackRoleId", v);
    set("apprFallbackRoleName", [...live, ...known].find((r) => r.id === v)?.name ?? null);
  };

  return (
    <div className="space-y-2 border-t border-divider pt-4">
      <Label htmlFor="appr-fallback-role">{t("policyWizard.approvals.fallback")}</Label>
      <SearchableSelect
        id="appr-fallback-role"
        options={[
          ...(values.apprFallbackDefault
            ? [{ value: FALLBACK_DEFAULT, label: t("policyWizard.approvals.fallbackDefault") }]
            : []),
          ...[...known, ...live].map((r) => ({ value: r.id, label: r.name })),
          { value: FALLBACK_NONE, label: t("policyWizard.approvals.noFallback") },
        ]}
        value={current || null}
        onChange={(v) => v && choose(v)}
        clearable={false}
      />
      <p className="text-hint text-tertiary">
        {t("policyWizard.approvals.fallbackHint")}
      </p>
      {none && (
        <InlineAlert tone="pending">
          {t("policyWizard.approvals.noFallbackWarning")}
        </InlineAlert>
      )}
    </div>
  );
};

export const ApprovalsStep: FC<StepProps> = ({ values, set }) => {
  const t = useTranslations("timeOff");
  const patchApprover = (index: number, patch: Partial<WizardApprover>) =>
    set(
      "apprApprovers",
      values.apprApprovers.map((a, i) => (i === index ? { ...a, ...patch } : a)),
    );
  const addApprover = () =>
    set("apprApprovers", [
      ...values.apprApprovers,
      { type: TimeOffPolicyApproverType.Manager, user: null },
    ]);
  const removeApprover = (index: number) =>
    set(
      "apprApprovers",
      values.apprApprovers.filter((_, i) => i !== index),
    );

  return (
    <div className="space-y-6">
      <StepIntro>{t("policyWizard.approvals.intro")}</StepIntro>

      <ToggleField
        label={t("policyWizard.approvals.require")}
        hint={t("policyWizard.approvals.requireHint")}
        checked={values.apprRequiresApproval}
        onCheckedChange={(v) => set("apprRequiresApproval", v)}
      />

      {values.apprRequiresApproval && (
        <Reveal>
          <div className="space-y-2">
            <Label>{t("policyWizard.approvals.chain")}</Label>
            <div className="space-y-2">
              {values.apprApprovers.map((approver, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-control border border-divider px-3 py-2"
                >
                  <span className="flex h-6 w-6 flex-none items-center justify-center rounded-pill bg-mist text-hint font-semibold text-secondary">
                    {index + 1}
                  </span>

                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <Select
                      value={approver.type}
                      onValueChange={(v) =>
                        patchApprover(index, {
                          type: v as TimeOffPolicyApproverType,
                          // clear the picked user when switching back to Manager
                          user: v === TimeOffPolicyApproverType.SpecificUser ? approver.user : null,
                        })
                      }
                    >
                      <SelectTrigger className="h-9 w-[150px] flex-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={TimeOffPolicyApproverType.Manager}>{t("policyWizard.approvals.manager")}</SelectItem>
                        <SelectItem value={TimeOffPolicyApproverType.SpecificUser}>
                          {t("policyWizard.approvals.specificUser")}
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    {approver.type === TimeOffPolicyApproverType.SpecificUser ? (
                      <div className="min-w-0 flex-1">
                        <ApproverUserField
                          user={approver.user}
                          onChange={(u) => patchApprover(index, { user: u })}
                        />
                      </div>
                    ) : (
                      <span className="text-hint text-tertiary">
                        {t("policyWizard.approvals.employeesManager")}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeApprover(index)}
                    disabled={values.apprApprovers.length <= 1}
                    className="flex-none text-tertiary hover:text-danger-text disabled:opacity-40"
                    aria-label={t("policyWizard.approvals.removeStep")}
                  >
                    <Icon icon={Delete02Icon} size="sm" />
                  </button>
                </div>
              ))}
            </div>
            <Button type="button" variant="secondary" size="sm" className="mt-1 gap-1.5" onClick={addApprover}>
              <Icon icon={Add01Icon} size="sm" />
              {t("policyWizard.approvals.addStep")}
            </Button>
            <p className="text-hint text-tertiary">
              {t("policyWizard.approvals.chainHint")}
            </p>
          </div>

          {/* One question with three answers, replacing two switches that described the same
              mechanism twice and could not express "any two of these three" between them. */}
          <div className="space-y-2 border-t border-divider pt-4">
            <Label>{t("policyWizard.approvals.howDecide")}</Label>
            <Select
              value={values.apprMode}
              onValueChange={(v) => set("apprMode", v as PolicyWizardValues["apprMode"])}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SEQUENTIAL">{t("policyWizard.approvals.sequential")}</SelectItem>
                <SelectItem value="ALL">{t("policyWizard.approvals.all")}</SelectItem>
                <SelectItem value="N_OF_M">{t("policyWizard.approvals.nOfM")}</SelectItem>
              </SelectContent>
            </Select>

            {values.apprMode === "N_OF_M" && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-body text-tertiary">{t("policyWizard.approvals.any")}</span>
                {/* The sentence "Any [N] of the 3 listed" reads well on screen and reaches a screen
                    reader as an unnamed spinbutton, so the field carries its own name. */}
                <Input
                  type="number"
                  min={1}
                  max={values.apprApprovers.length}
                  value={values.apprRequiredCount}
                  onChange={(e) => set("apprRequiredCount", e.currentTarget.value)}
                  className="h-9 w-20"
                  aria-label={t("policyWizard.approvals.countAria", { count: values.apprApprovers.length })}
                />
                <span className="text-body text-tertiary">
                  {t("policyWizard.approvals.ofListed", { count: values.apprApprovers.length })}
                </span>
              </div>
            )}
          </div>

          <FallbackRoleField values={values} set={set} />
        </Reveal>
      )}
    </div>
  );
};

// ── Step: Eligibility ────────────────────────────────────────────────

export const EligibilityStep: FC<StepProps> = ({ values, set }) => {
  const t = useTranslations("timeOff");
  return (
  <div className="space-y-6">
    <StepIntro>{t("policyWizard.eligibility.intro")}</StepIntro>

    <ToggleField
      label={t("policyWizard.eligibility.require")}
      hint={t("policyWizard.eligibility.requireHint")}
      checked={values.eligEnabled}
      onCheckedChange={(v) => set("eligEnabled", v)}
    />

    {values.eligEnabled && (
      <Reveal>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>{t("policyWizard.eligibility.waitingPeriod")}</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                inputMode="numeric"
                className="w-24"
                value={values.eligDelayValue}
                onChange={(e) => set("eligDelayValue", e.target.value)}
              />
              <Select
                value={values.eligDelayUnit}
                onValueChange={(v) => set("eligDelayUnit", v as TimeOffEligibilityDelayUnit)}
              >
                <SelectTrigger className="h-9 w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TimeOffEligibilityDelayUnit.Days}>{t("policyWizard.eligibility.days")}</SelectItem>
                  <SelectItem value={TimeOffEligibilityDelayUnit.Months}>{t("policyWizard.eligibility.months")}</SelectItem>
                  <SelectItem value={TimeOffEligibilityDelayUnit.Years}>{t("policyWizard.eligibility.years")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label>{t("policyWizard.eligibility.countedFrom")}</Label>
            <Select
              value={values.eligReference}
              onValueChange={(v) => set("eligReference", v as TimeOffEligibilityReference)}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TimeOffEligibilityReference.HireDate}>{t("policyWizard.eligibility.hireDate")}</SelectItem>
                <SelectItem value={TimeOffEligibilityReference.ProbationEnd}>
                  {t("policyWizard.eligibility.probationEnd")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <p className="text-hint text-tertiary">
          {t("policyWizard.eligibility.probationHint")}
        </p>
      </Reveal>
    )}
  </div>
  );
};

// ── Step: Accrual ────────────────────────────────────────────────────

export const AccrualStep: FC<StepProps> = ({ values, set }) => {
  const t = useTranslations("timeOff");
  const strong = (chunks: ReactNode) => <span className="font-medium text-primary">{chunks}</span>;
  const isAccrued =
    values.entitlementGrantingMode === TimeOffPolicyEntitlementMode.Accrued;

  if (!isAccrued) {
    return (
      <div className="space-y-6">
        <StepIntro>{t("policyWizard.accrual.intro")}</StepIntro>
        <p className="rounded-card border border-divider bg-subtle px-4 py-3 text-body text-tertiary">
          {t.rich("policyWizard.accrual.upfrontNotice", { b: strong })}
        </p>
      </div>
    );
  }

  // Unlimited plus Accrued is a contradiction the engine resolves by ignoring the accrual entirely:
  // there is no quota to earn a share of. Saying so beats offering a cadence and a cap that decide
  // nothing — which is what this step used to do.
  if (values.unlimitedQuota) {
    return (
      <div className="space-y-6">
        <StepIntro>{t("policyWizard.accrual.intro")}</StepIntro>
        <p className="rounded-card border border-divider bg-subtle px-4 py-3 text-body text-tertiary">
          {t.rich("policyWizard.accrual.unlimitedNotice", { b: strong })}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StepIntro>{t("policyWizard.accrual.introAccrued")}</StepIntro>

      <Field label={t("policyWizard.accrual.frequency")} htmlFor="wiz-accrual-freq">
        <Select
          value={values.accrualFrequency}
          onValueChange={(v) => set("accrualFrequency", v as TimeOffAccrualFrequency)}
        >
          <SelectTrigger id="wiz-accrual-freq">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TimeOffAccrualFrequency.Weekly}>{t("policyWizard.accrual.weekly")}</SelectItem>
            <SelectItem value={TimeOffAccrualFrequency.Monthly}>{t("policyWizard.accrual.monthly")}</SelectItem>
            <SelectItem value={TimeOffAccrualFrequency.Annually}>{t("policyWizard.accrual.annually")}</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label={t("policyWizard.accrual.amount")} htmlFor="wiz-accrual-amount" hint={t("policyWizard.accrual.amountHint")}>
          <Input
            id="wiz-accrual-amount"
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            value={values.accrualAmount}
            onChange={(e) => set("accrualAmount", e.target.value)}
          />
        </Field>

        <Field label={t("policyWizard.accrual.cap")} htmlFor="wiz-accrual-cap" hint={t("policyWizard.accrual.capHint")}>
          <Input
            id="wiz-accrual-cap"
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            value={values.accrualCap}
            onChange={(e) => set("accrualCap", e.target.value)}
          />
        </Field>
      </div>

      <Field
        label={t("policyWizard.accrual.timing")}
        htmlFor="wiz-accrual-timing"
        hint={t("policyWizard.accrual.timingHint")}
      >
        <Select
          value={values.accrualTiming}
          onValueChange={(v) => set("accrualTiming", v as TimeOffAccrualTiming)}
        >
          <SelectTrigger id="wiz-accrual-timing">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TimeOffAccrualTiming.StartOfPeriod}>
              {t("policyWizard.accrual.start")}
            </SelectItem>
            <SelectItem value={TimeOffAccrualTiming.EndOfPeriod}>
              {t("policyWizard.accrual.end")}
            </SelectItem>
          </SelectContent>
        </Select>
      </Field>

      <ToggleField
        label={t("policyWizard.accrual.duringWaiting")}
        hint={t("policyWizard.accrual.duringWaitingHint")}
        checked={values.accrueDuringWaiting}
        onCheckedChange={(v) => set("accrueDuringWaiting", v)}
      />
    </div>
  );
};

// ── Step: Tenure ─────────────────────────────────────────────────────

export const TenureStep: FC<StepProps> = ({ values, set }) => {
  const t = useTranslations("timeOff");
  const patchRow = (index: number, patch: Partial<WizardTenureRule>) =>
    set(
      "tenureRules",
      values.tenureRules.map((tier, i) => (i === index ? { ...tier, ...patch } : tier)),
    );
  const addRow = () =>
    set("tenureRules", [...values.tenureRules, { yearsOfService: "", bonusDays: "" }]);
  const removeRow = (index: number) =>
    set("tenureRules", values.tenureRules.filter((_, i) => i !== index));

  return (
    <div className="space-y-6">
      <StepIntro>{t("policyWizard.tenure.intro")}</StepIntro>

      <div className="space-y-2">
        {values.tenureRules.length === 0 && (
          <p className="rounded-card border border-dashed border-divider px-4 py-6 text-center text-body text-tertiary">
            {t("policyWizard.tenure.empty")}
          </p>
        )}

        {values.tenureRules.map((row, index) => (
          <div key={index} className="flex items-end gap-2.5">
            <span className="pb-2 text-body text-tertiary">{t("policyWizard.tenure.after")}</span>
            <div className="space-y-1">
              <Label className="text-hint">{t("policyWizard.tenure.years")}</Label>
              <Input
                type="number"
                min={0}
                inputMode="numeric"
                className="w-28"
                value={row.yearsOfService}
                onChange={(e) => patchRow(index, { yearsOfService: e.target.value })}
              />
            </div>
            <span className="pb-2 text-body text-tertiary">{t("policyWizard.tenure.grant")}</span>
            <div className="space-y-1">
              <Label className="text-hint">{t("policyWizard.tenure.bonus")}</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                inputMode="decimal"
                className="w-28"
                value={row.bonusDays}
                onChange={(e) => patchRow(index, { bonusDays: e.target.value })}
              />
            </div>
            <button
              type="button"
              onClick={() => removeRow(index)}
              className="pb-2 flex-none text-tertiary hover:text-danger-text"
              aria-label={t("policyWizard.tenure.remove")}
            >
              <Icon icon={Delete02Icon} size="sm" />
            </button>
          </div>
        ))}
      </div>

      <Button type="button" variant="secondary" size="sm" className="gap-1.5" onClick={addRow}>
        <Icon icon={Add01Icon} size="sm" />
        {t("policyWizard.tenure.add")}
      </Button>
    </div>
  );
};

// ── Step: Restrictions ───────────────────────────────────────────────

const RESTRICTION_LABEL = {
  [TimeOffRestrictionType.Blackout]: "policyWizard.restrictions.blackout",
  [TimeOffRestrictionType.CoverageCap]: "policyWizard.restrictions.coverageCap",
} as const satisfies Record<TimeOffRestrictionType, string>;

/**
 * Blackouts and coverage caps, in one step.
 *
 * They were two steps for two rules that share everything except their payload — a scope, a moment
 * of evaluation and a block-or-warn outcome. Splitting them is why only one of them had a scope (so
 * a company shutdown had to be retyped on every policy) and only one of them could warn.
 */
export const RestrictionsStep: FC<StepProps> = ({ values, set }) => {
  const t = useTranslations("timeOff");
  const patchRow = (index: number, patch: Partial<WizardRestriction>) =>
    set(
      "restrictions",
      values.restrictions.map((r, i) => (i === index ? { ...r, ...patch } : r)),
    );
  const addRow = (type: TimeOffRestrictionType) =>
    set("restrictions", [
      ...values.restrictions,
      {
        type,
        scope: TimeOffRestrictionScope.Company,
        behavior: TimeOffRestrictionBehavior.Block,
        name: "",
        startDate: "",
        endDate: "",
        recurrence: TimeOffRestrictionRecurrence.None,
        maxUsersAway: "",
      },
    ]);
  const removeRow = (index: number) =>
    set("restrictions", values.restrictions.filter((_, i) => i !== index));

  return (
    <div className="space-y-6">
      <StepIntro>
        {t("policyWizard.restrictions.intro")}
      </StepIntro>

      <div className="space-y-2">
        {values.restrictions.length === 0 && (
          <p className="rounded-card border border-dashed border-divider px-4 py-6 text-center text-body text-tertiary">
            {t("policyWizard.restrictions.empty")}
          </p>
        )}

        {values.restrictions.map((row, index) => {
          const blackout = row.type === TimeOffRestrictionType.Blackout;
          return (
            <div key={index} className="space-y-2 rounded-control border border-divider px-3 py-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-body font-medium text-primary">
                  {t(RESTRICTION_LABEL[row.type])}
                </span>
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  className="flex-none text-tertiary hover:text-danger-text"
                  aria-label={t("policyWizard.restrictions.remove")}
                >
                  <Icon icon={Delete02Icon} size="sm" />
                </button>
              </div>

              <div className="flex flex-wrap items-end gap-2">
                <div className="flex-1 space-y-1">
                  <Label className="text-hint">{t("policyWizard.restrictions.name")}</Label>
                  <Input
                    placeholder={blackout ? t("policyWizard.restrictions.blackoutPlaceholder") : t("policyWizard.restrictions.coveragePlaceholder")}
                    value={row.name}
                    onChange={(e) => patchRow(index, { name: e.target.value })}
                  />
                </div>

                {blackout ? (
                  <>
                    <div className="space-y-1">
                      <Label className="text-hint">{t("policyWizard.restrictions.from")}</Label>
                      <DatePicker
                        value={row.startDate}
                        ariaLabel={t("policyWizard.restrictions.blackoutStart")}
                        className="w-40"
                        onChange={(next) => patchRow(index, { startDate: next })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-hint">{t("policyWizard.restrictions.to")}</Label>
                      <DatePicker
                        value={row.endDate}
                        ariaLabel={t("policyWizard.restrictions.blackoutEnd")}
                        className="w-40"
                        onChange={(next) => patchRow(index, { endDate: next })}
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-1">
                    <Label className="text-hint">{t("policyWizard.restrictions.maxAway")}</Label>
                    <Input
                      type="number"
                      min={0}
                      inputMode="numeric"
                      className="w-28"
                      value={row.maxUsersAway}
                      onChange={(e) => patchRow(index, { maxUsersAway: e.target.value })}
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-end gap-2">
                <div className="space-y-1">
                  <Label className="text-hint">{t("policyWizard.restrictions.appliesTo")}</Label>
                  <Select
                    value={row.scope}
                    onValueChange={(v) => patchRow(index, { scope: v as TimeOffRestrictionScope })}
                  >
                    <SelectTrigger className="h-9 w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={TimeOffRestrictionScope.Team}>{t("policyWizard.restrictions.team")}</SelectItem>
                      <SelectItem value={TimeOffRestrictionScope.Department}>
                        {t("policyWizard.restrictions.department")}
                      </SelectItem>
                      <SelectItem value={TimeOffRestrictionScope.Company}>
                        {t("policyWizard.restrictions.company")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-hint">{t("policyWizard.restrictions.whenApplies")}</Label>
                  <Select
                    value={row.behavior}
                    onValueChange={(v) =>
                      patchRow(index, { behavior: v as TimeOffRestrictionBehavior })
                    }
                  >
                    <SelectTrigger className="h-9 w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={TimeOffRestrictionBehavior.Block}>
                        {t("policyWizard.restrictions.block")}
                      </SelectItem>
                      <SelectItem value={TimeOffRestrictionBehavior.Warn}>
                        {t("policyWizard.restrictions.warn")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {blackout && (
                  <div className="space-y-1">
                    <Label className="text-hint">{t("policyWizard.restrictions.repeats")}</Label>
                    <Select
                      value={row.recurrence}
                      onValueChange={(v) =>
                        patchRow(index, { recurrence: v as TimeOffRestrictionRecurrence })
                      }
                    >
                      <SelectTrigger className="h-9 w-44">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={TimeOffRestrictionRecurrence.None}>
                          {t("policyWizard.restrictions.once")}
                        </SelectItem>
                        <SelectItem value={TimeOffRestrictionRecurrence.Yearly}>
                          {t("policyWizard.restrictions.yearly")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="gap-1.5"
          onClick={() => addRow(TimeOffRestrictionType.Blackout)}
        >
          <Icon icon={Add01Icon} size="sm" />
          {t("policyWizard.restrictions.addBlackout")}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="gap-1.5"
          onClick={() => addRow(TimeOffRestrictionType.CoverageCap)}
        >
          <Icon icon={Add01Icon} size="sm" />
          {t("policyWizard.restrictions.addCoverage")}
        </Button>
      </div>
    </div>
  );
};

// ── Step 7: Editing ──────────────────────────────────────────────────

export const EditingStep: FC<StepProps> = ({ values, set }) => {
  const t = useTranslations("timeOff");
  return (
  <div className="space-y-6">
    <StepIntro>{t("policyWizard.editing.intro")}</StepIntro>

    <div className="space-y-1">
      <ToggleField
        label={t("policyWizard.editing.own")}
        checked={values.editEmployeeCanEditOwn}
        onCheckedChange={(v) => set("editEmployeeCanEditOwn", v)}
      />
      <ToggleField
        label={t("policyWizard.editing.approved")}
        checked={values.editAllowEditApproved}
        onCheckedChange={(v) => set("editAllowEditApproved", v)}
      />
      <ToggleField
        label={t("policyWizard.editing.duringLeave")}
        checked={values.editAllowEditDuringActiveLeave}
        onCheckedChange={(v) => set("editAllowEditDuringActiveLeave", v)}
      />
      <ToggleField
        label={t("policyWizard.editing.reapproval")}
        hint={t("policyWizard.editing.reapprovalHint")}
        checked={values.editRequiresReapproval}
        onCheckedChange={(v) => set("editRequiresReapproval", v)}
      />
      <ToggleField
        label={t("policyWizard.editing.managers")}
        checked={values.editManagerCanEditTeam}
        onCheckedChange={(v) => set("editManagerCanEditTeam", v)}
      />
      <ToggleField
        label={t("policyWizard.editing.admins")}
        checked={values.editAdminCanEditAny}
        onCheckedChange={(v) => set("editAdminCanEditAny", v)}
      />
      <ToggleField
        label={t("policyWizard.editing.past")}
        checked={values.editAllowPastEdits}
        onCheckedChange={(v) => set("editAllowPastEdits", v)}
      />
    </div>
  </div>
  );
};

// ── Step 8: Review ───────────────────────────────────────────────────

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <span className="text-body text-tertiary">{label}</span>
      <span className="text-body font-medium text-primary">{value}</span>
    </div>
  );
}

function approvalSummary(v: PolicyWizardValues, t: TimeOffT): string {
  if (!v.apprRequiresApproval) return t("policyWizard.review.autoApprove");

  const count = v.apprApprovers.length;
  switch (v.apprMode) {
    case "SEQUENTIAL":
      return t("policyWizard.review.sequential", { count });
    case "N_OF_M":
      return t("policyWizard.review.nOfM", { required: v.apprRequiredCount || "1", count });
    default:
      return t("policyWizard.review.all", { count });
  }
}

export const ReviewStep: FC<{
  values: PolicyWizardValues;
  leaveTypeName?: string;
  /** The wizard edits an existing policy as often as it creates one, and the copy has to say which. */
  mode?: "create" | "edit";
}> = ({ values, leaveTypeName, mode = "create" }) => {
  const t = useTranslations("timeOff");
  const quota = values.unlimitedQuota
    ? t("policies.overview.unlimited")
    : t("policies.overview.quotaValue", { quota: values.yearlyQuota || "0", unit: values.unit });
  const carryover =
    values.carryoverType === TimeOffPolicyCarryoverType.None
      ? t("policies.overview.none")
      : values.carryoverType === TimeOffPolicyCarryoverType.Unlimited
        ? t("policies.overview.unlimited")
        : t("policies.overview.limitedTo", { limit: values.carryoverLimit || "0" });

  return (
    <div className="space-y-5">
      <StepIntro>
        {mode === "edit"
          ? t("policyWizard.review.introEdit")
          : t("policyWizard.review.introCreate")}
      </StepIntro>

      <div className="rounded-card border border-divider p-4">
        <p className="mb-1 text-hint font-semibold text-tertiary">
          {leaveTypeName ? t("policyWizard.review.leaveType", { name: leaveTypeName }) : t("policyWizard.review.newPolicy")}
        </p>
        <p className="flex items-center gap-2 text-section-title text-primary">
          <PolicyMarker color={values.color} />
          {values.name || t("policyWizard.review.untitled")}
        </p>
        {values.description && (
          <p className="mt-1 text-body text-tertiary">{values.description}</p>
        )}
      </div>

      <div className="divide-y divide-divider rounded-card border border-divider px-4 py-1.5">
        <Summary label={t("policyWizard.review.unit")} value={values.unit === TimeOffPolicyUnit.Hours ? t("policies.overview.hours") : t("policies.overview.days")} />
        <Summary label={t("policyWizard.review.payType")} value={values.paid ? t("policies.overview.paid") : t("policies.overview.unpaid")} />
        <Summary label={t("policyWizard.review.quota")} value={quota} />
        <Summary label={t("policyWizard.review.renewal")} value={renewalSummary(values, t)} />
        <Summary label={t("policyWizard.review.carryover")} value={carryover} />
        <Summary
          label={t("policyWizard.review.counting")}
          value={values.countingMode === TimeOffPolicyCountingMode.WorkingDays ? t("policies.overview.workingDays") : t("policies.overview.calendarDays")}
        />
        <Summary label={t("policyWizard.review.negativeBalance")} value={values.allowNegativeBalance ? t("policies.overview.allowed") : t("policies.overview.notAllowed")} />
        {/* Says how the chain decides, not just how long it is. "Auto-approve" is now the truth
            rather than a wizard default: with approvalRequired off the request is approved on
            submission instead of waiting in PENDING for an administrator. */}
        <Summary label={t("policyWizard.review.approval")} value={approvalSummary(values, t)} />
      </div>

      <p className="text-hint text-tertiary">
        {mode === "edit"
          ? t("policyWizard.review.footerEdit")
          : t("policyWizard.review.footerCreate")}
      </p>
    </div>
  );
};
