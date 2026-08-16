"use client";

import { FC, ReactNode } from "react";
import { Check, Plus, Trash2 } from "lucide-react";

import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";
import { Switch } from "@/public/desact/src/components/ui/switch";
import { cn } from "@/public/desact/src/components/ui/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/public/desact/src/components/ui/select";
import {
  TimeOffPolicyCarryoverExpiryType,
  TimeOffPolicyCarryoverExpiryUnit,
  TimeOffPolicyCarryoverType,
  TimeOffPolicyCountingMode,
  TimeOffPolicyEntitlementMode,
  TimeOffPolicyRenewalType,
  TimeOffPolicyUnit,
} from "@/api/modules/timeOff/timeOffPolicies/dto";
import {
  TimeOffCertificateRequirementType,
  TimeOffRequestUnit,
} from "@/api/modules/timeOff/timeOffPolicyRequestRules/dto";
import { TimeOffPolicyApproverType } from "@/api/modules/timeOff/timeOffPolicyApprovalSettings/dto";
import {
  TimeOffEligibilityDelayUnit,
  TimeOffEligibilityReference,
} from "@/api/modules/timeOff/timeOffPolicyEligibility/dto";
import {
  TimeOffCoverageBehavior,
  TimeOffCoverageScope,
} from "@/api/modules/timeOff/timeOffPolicyCoverage/dto";
import { TimeOffAccrualFrequency } from "@/api/modules/timeOff/timeOffPolicyAccrual/dto";
import {
  UserPickerField,
  type PickedUser,
} from "@/components/modules/settings/modules/departments/components/UserPickerField/UserPickerField";
import { useUser } from "@/components/hooks/useUser/useUser";
import {
  PolicyWizardValues,
  WEEKDAY_BITS,
  WizardApprover,
  WizardApproverUser,
  WizardBlackout,
  WizardTenureRule,
  hasWeekday,
  toggleWeekday,
} from "./policyWizardTypes";

export type WizardSetter = <K extends keyof PolicyWizardValues>(
  key: K,
  value: PolicyWizardValues[K],
) => void;

type StepProps = { values: PolicyWizardValues; set: WizardSetter };

// ── Shared helpers ───────────────────────────────────────────────────

function StepIntro({ children }: { children: ReactNode }) {
  return <p className="text-sm leading-relaxed text-muted-foreground">{children}</p>;
}

function Field({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
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
        <p className="text-sm font-medium text-foreground">{label}</p>
        <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
      </div>
      {hint && <p className="mt-0.5 max-w-[85%] text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** Indented group for fields revealed by a toggle — shows they belong together. */
function Reveal({ children }: { children: ReactNode }) {
  return (
    <div className="ml-0.5 space-y-4 border-l-2 border-brown-100 pl-4">{children}</div>
  );
}

// ── Step 1: Basics ───────────────────────────────────────────────────

export const BasicsStep: FC<StepProps> = ({ values, set }) => (
  <div className="space-y-6">
    <StepIntro>Give the policy a name and the essentials. You can fine-tune the rules in the next steps.</StepIntro>

    <Field label="Name" htmlFor="wiz-name">
      <Input
        id="wiz-name"
        value={values.name}
        onChange={(e) => set("name", e.currentTarget.value)}
        placeholder="e.g., Standard Vacation"
      />
    </Field>

    <Field label="Description" htmlFor="wiz-desc" hint="Optional. Shown to admins.">
      <Input
        id="wiz-desc"
        value={values.description}
        onChange={(e) => set("description", e.currentTarget.value)}
        placeholder="Optional"
      />
    </Field>

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field label="Unit" htmlFor="wiz-unit">
        <Select value={values.unit} onValueChange={(v) => set("unit", v as TimeOffPolicyUnit)}>
          <SelectTrigger id="wiz-unit">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TimeOffPolicyUnit.Days}>Days</SelectItem>
            <SelectItem value={TimeOffPolicyUnit.Hours}>Hours</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      <Field label="Effective date" htmlFor="wiz-eff" hint="Optional. When it takes effect.">
        <Input
          id="wiz-eff"
          type="date"
          value={values.effectiveDate}
          onChange={(e) => set("effectiveDate", e.currentTarget.value)}
        />
      </Field>
    </div>

    <div className="space-y-1 pt-1">
      <ToggleField
        label="Paid leave"
        hint="Whether time off under this policy is paid."
        checked={values.paid}
        onCheckedChange={(v) => set("paid", v)}
      />
      <ToggleField
        label="Hidden from employees"
        hint="Hide this policy from employee self-service views."
        checked={values.hiddenFromEmployees}
        onCheckedChange={(v) => set("hiddenFromEmployees", v)}
      />
    </div>
  </div>
);

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

function renewalSummary(v: PolicyWizardValues): string {
  switch (v.renewalType) {
    case TimeOffPolicyRenewalType.Manual:
      return "Manual";
    case TimeOffPolicyRenewalType.Anniversary:
      return "On hire date";
    default:
      return isYearStart(v)
        ? "Year start (1 Jan)"
        : `${v.renewalFixedDay}/${v.renewalFixedMonth} yearly`;
  }
}

export const EntitlementStep: FC<StepProps> = ({ values, set }) => (
  <div className="space-y-6">
    <StepIntro>How much time off employees get each year, and when the balance resets.</StepIntro>

    <ToggleField
      label="Unlimited quota"
      hint="No yearly balance limit (e.g. unlimited sick days)."
      checked={values.unlimitedQuota}
      onCheckedChange={(v) => set("unlimitedQuota", v)}
    />

    {!values.unlimitedQuota && (
      <Reveal>
        <Field
          label="Yearly quota"
          htmlFor="wiz-quota"
          hint={`Amount granted per year, in ${values.unit === TimeOffPolicyUnit.Hours ? "hours" : "days"}.`}
        >
          <Input
            id="wiz-quota"
            type="number"
            min={0}
            value={values.yearlyQuota}
            onChange={(e) => set("yearlyQuota", e.currentTarget.value)}
            placeholder="20"
          />
        </Field>
      </Reveal>
    )}

    <Field label="Granting mode" htmlFor="wiz-grant" hint="Upfront grants the full amount; accrued earns it over time (configure in the Accrual step).">
      <Select
        value={values.entitlementGrantingMode}
        onValueChange={(v) => set("entitlementGrantingMode", v as TimeOffPolicyEntitlementMode)}
      >
        <SelectTrigger id="wiz-grant">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={TimeOffPolicyEntitlementMode.Upfront}>Upfront (full amount)</SelectItem>
          <SelectItem value={TimeOffPolicyEntitlementMode.Accrued}>
            Accrued (earned over time)
          </SelectItem>
        </SelectContent>
      </Select>
    </Field>

    <Field label="Renewal" htmlFor="wiz-renewal" hint="When the balance resets each year.">
      <Select value={renewalSelectValue(values)} onValueChange={(v) => setRenewalMode(set, v)}>
        <SelectTrigger id="wiz-renewal">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={RENEWAL_YEAR_START}>Year start (1 Jan)</SelectItem>
          <SelectItem value={RENEWAL_FIXED_DATE}>Yearly on a custom date</SelectItem>
          <SelectItem value={TimeOffPolicyRenewalType.Anniversary}>
            On the employee&apos;s hire date
          </SelectItem>
          <SelectItem value={TimeOffPolicyRenewalType.Manual}>Manual</SelectItem>
        </SelectContent>
      </Select>
    </Field>

    {renewalSelectValue(values) === RENEWAL_FIXED_DATE && (
      <Reveal>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Renewal day" htmlFor="wiz-rday">
            <Input
              id="wiz-rday"
              type="number"
              min={1}
              max={31}
              value={values.renewalFixedDay}
              onChange={(e) => set("renewalFixedDay", e.currentTarget.value)}
            />
          </Field>
          <Field label="Renewal month" htmlFor="wiz-rmonth">
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
      <p className="text-xs text-muted-foreground">
        The balance renews on each employee&apos;s work anniversary (their hire date).
      </p>
    )}
  </div>
);

// ── Step 3: Carryover & balance ──────────────────────────────────────

export const CarryoverStep: FC<StepProps> = ({ values, set }) => (
  <div className="space-y-6">
    <StepIntro>What happens to unused balance at renewal, and whether balances may go negative.</StepIntro>

    <Field label="Carryover" htmlFor="wiz-co" hint="Unused balance at the end of a period.">
      <Select
        value={values.carryoverType}
        onValueChange={(v) => set("carryoverType", v as TimeOffPolicyCarryoverType)}
      >
        <SelectTrigger id="wiz-co">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={TimeOffPolicyCarryoverType.None}>None (use it or lose it)</SelectItem>
          <SelectItem value={TimeOffPolicyCarryoverType.Unlimited}>Unlimited</SelectItem>
          <SelectItem value={TimeOffPolicyCarryoverType.Limited}>Limited</SelectItem>
        </SelectContent>
      </Select>
    </Field>

    {values.carryoverType !== TimeOffPolicyCarryoverType.None && (
      <Reveal>
        {values.carryoverType === TimeOffPolicyCarryoverType.Limited && (
          <Field label="Carryover limit" htmlFor="wiz-colimit" hint="Maximum amount carried into the next period.">
            <Input
              id="wiz-colimit"
              type="number"
              min={0}
              value={values.carryoverLimit}
              onChange={(e) => set("carryoverLimit", e.currentTarget.value)}
            />
          </Field>
        )}

        <Field label="Carried-over balance expires" htmlFor="wiz-coexp">
          <Select
            value={values.carryoverExpiryType}
            onValueChange={(v) => set("carryoverExpiryType", v as TimeOffPolicyCarryoverExpiryType)}
          >
            <SelectTrigger id="wiz-coexp">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TimeOffPolicyCarryoverExpiryType.Never}>Never</SelectItem>
              <SelectItem value={TimeOffPolicyCarryoverExpiryType.AfterPeriod}>After a period</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        {values.carryoverExpiryType === TimeOffPolicyCarryoverExpiryType.AfterPeriod && (
          <div className="grid grid-cols-2 gap-4">
            <Field label="Expires after" htmlFor="wiz-coexpval">
              <Input
                id="wiz-coexpval"
                type="number"
                min={1}
                value={values.carryoverExpiryValue}
                onChange={(e) => set("carryoverExpiryValue", e.currentTarget.value)}
              />
            </Field>
            <Field label="Unit" htmlFor="wiz-coexpunit">
              <Select
                value={values.carryoverExpiryUnit}
                onValueChange={(v) => set("carryoverExpiryUnit", v as TimeOffPolicyCarryoverExpiryUnit)}
              >
                <SelectTrigger id="wiz-coexpunit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TimeOffPolicyCarryoverExpiryUnit.Days}>Days</SelectItem>
                  <SelectItem value={TimeOffPolicyCarryoverExpiryUnit.Months}>Months</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
        )}
      </Reveal>
    )}

    <div className="border-t border-brown-100 pt-5">
      <ToggleField
        label="Allow negative balance"
        hint="Let employees request more than their current balance."
        checked={values.allowNegativeBalance}
        onCheckedChange={(v) => set("allowNegativeBalance", v)}
      />
      {values.allowNegativeBalance && (
        <Reveal>
          <Field label="Max negative balance" htmlFor="wiz-negbal" hint="How far into the negative is allowed.">
            <Input
              id="wiz-negbal"
              type="number"
              value={values.maxNegativeBalance}
              onChange={(e) => set("maxNegativeBalance", e.currentTarget.value)}
            />
          </Field>
          <ToggleField
            label="Cap negative balance by quota"
            hint="Limit the negative balance to the yearly quota."
            checked={values.negativeBalanceCappedByQuota}
            onCheckedChange={(v) => set("negativeBalanceCappedByQuota", v)}
          />
        </Reveal>
      )}

      <div className="pt-1">
        <ToggleField
          label="Allow negative carryover"
          hint="Let a negative balance carry into the next period."
          checked={values.allowNegativeCarryover}
          onCheckedChange={(v) => set("allowNegativeCarryover", v)}
        />
        {values.allowNegativeCarryover && (
          <Reveal>
            <Field label="Negative carryover limit" htmlFor="wiz-negco">
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

// ── Step 4: Counting ─────────────────────────────────────────────────

export const CountingStep: FC<StepProps> = ({ values, set }) => (
  <div className="space-y-6">
    <StepIntro>How a request&apos;s duration is turned into an amount of balance used.</StepIntro>

    <Field label="Counting mode" htmlFor="wiz-count" hint="Calendar days count every day; working days skip non-working days.">
      <Select
        value={values.countingMode}
        onValueChange={(v) => set("countingMode", v as TimeOffPolicyCountingMode)}
      >
        <SelectTrigger id="wiz-count">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={TimeOffPolicyCountingMode.CalendarDays}>Calendar days</SelectItem>
          <SelectItem value={TimeOffPolicyCountingMode.WorkingDays}>Working days</SelectItem>
        </SelectContent>
      </Select>
    </Field>

    <div className="space-y-2">
      <Label>Working weekdays</Label>
      <p className="text-xs text-muted-foreground">Weekdays that consume balance.</p>
      <div className="flex flex-wrap gap-2 pt-1">
        {WEEKDAY_BITS.map(({ bit, label }) => {
          const active = hasWeekday(values.validWeekdays, bit);
          return (
            <button
              key={bit}
              type="button"
              onClick={() => set("validWeekdays", toggleWeekday(values.validWeekdays, bit))}
              className={
                "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors " +
                (active
                  ? "border-brown-300 bg-brown-100 text-brown-800"
                  : "border-brown-200 text-brown-500 hover:bg-brown-50")
              }
            >
              <span
                aria-hidden
                className={cn(
                  "flex size-4 shrink-0 items-center justify-center rounded-[4px] border",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-brown-300 bg-input-background",
                )}
              >
                {active && <Check className="size-3.5" />}
              </span>
              {label}
            </button>
          );
        })}
      </div>
    </div>

    <ToggleField
      label="Public holidays consume balance"
      hint="If off, public holidays inside a request are not counted."
      checked={values.includePublicHolidays}
      onCheckedChange={(v) => set("includePublicHolidays", v)}
    />
  </div>
);

// ── Step 5: Requests ─────────────────────────────────────────────────

export const RequestsStep: FC<StepProps> = ({ values, set }) => (
  <div className="space-y-6">
    <StepIntro>Rules for how employees may request time off under this policy.</StepIntro>

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field
        label="Minimum request unit"
        htmlFor="wiz-minunit"
        hint="Smallest bookable unit. Hours ⇒ hourly; Half day ⇒ half-days; Full day ⇒ whole days."
      >
        <Select
          value={values.reqMinRequestUnit}
          onValueChange={(v) => set("reqMinRequestUnit", v as TimeOffRequestUnit)}
        >
          <SelectTrigger id="wiz-minunit">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TimeOffRequestUnit.FullDay}>Full day</SelectItem>
            <SelectItem value={TimeOffRequestUnit.HalfDay}>Half day</SelectItem>
            <SelectItem value={TimeOffRequestUnit.Hours}>Hours</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      <Field label="Min duration per request" htmlFor="wiz-mindur" hint="Optional (e.g. minimum a week).">
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
        label="Allow overlapping requests"
        hint="Let an employee have two requests on the same dates."
        checked={values.reqAllowOverlapping}
        onCheckedChange={(v) => set("reqAllowOverlapping", v)}
      />
    </div>

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field label="Max duration per request" htmlFor="wiz-maxdur" hint="Optional.">
        <Input
          id="wiz-maxdur"
          type="number"
          min={0}
          value={values.reqMaxDurationPerRequest}
          onChange={(e) => set("reqMaxDurationPerRequest", e.currentTarget.value)}
        />
      </Field>
      <Field label="Min gap between requests (days)" htmlFor="wiz-mingap" hint="Optional.">
        <Input
          id="wiz-mingap"
          type="number"
          min={0}
          value={values.reqMinGapBetweenRequests}
          onChange={(e) => set("reqMinGapBetweenRequests", e.currentTarget.value)}
        />
      </Field>
      <Field label="Max request days per year" htmlFor="wiz-maxyear" hint="Optional cap across the year.">
        <Input
          id="wiz-maxyear"
          type="number"
          min={0}
          value={values.reqMaxRequestDaysPerYear}
          onChange={(e) => set("reqMaxRequestDaysPerYear", e.currentTarget.value)}
        />
      </Field>
    </div>

    <div className="border-t border-brown-100 pt-5">
      <ToggleField
        label="Allow requests in the past"
        checked={values.reqAllowPastRequests}
        onCheckedChange={(v) => set("reqAllowPastRequests", v)}
      />
      {values.reqAllowPastRequests && (
        <Reveal>
          <Field label="How many days back" htmlFor="wiz-pastlimit">
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
        <ToggleField
          label="Require advance notice"
          checked={values.reqNoticeRequiredEnabled}
          onCheckedChange={(v) => set("reqNoticeRequiredEnabled", v)}
        />
        {values.reqNoticeRequiredEnabled && (
          <Reveal>
            <Field label="Default notice days" htmlFor="wiz-notice">
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

    <div className="border-t border-brown-100 pt-5">
      <Field label="Certificate / attachment" htmlFor="wiz-cert" hint="e.g. a doctor's note for sick leave.">
        <Select
          value={values.reqCertificateRequirementType}
          onValueChange={(v) =>
            set("reqCertificateRequirementType", v as TimeOffCertificateRequirementType)
          }
        >
          <SelectTrigger id="wiz-cert">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TimeOffCertificateRequirementType.None}>Not required</SelectItem>
            <SelectItem value={TimeOffCertificateRequirementType.Always}>Always required</SelectItem>
            <SelectItem value={TimeOffCertificateRequirementType.FromDuration}>
              Required from a duration
            </SelectItem>
          </SelectContent>
        </Select>
      </Field>
      {values.reqCertificateRequirementType === TimeOffCertificateRequirementType.FromDuration && (
        <div className="mt-4">
          <Reveal>
            <Field label="Required from (duration)" htmlFor="wiz-certdur">
              <Input
                id="wiz-certdur"
                type="number"
                min={0}
                value={values.reqCertificateRequiredFromDuration}
                onChange={(e) => set("reqCertificateRequiredFromDuration", e.currentTarget.value)}
              />
            </Field>
          </Reveal>
        </div>
      )}
    </div>
  </div>
);

// ── Step 6: Approvals ────────────────────────────────────────────────

const hasApproverName = (u: WizardApproverUser) =>
  Boolean(u.firstName || u.lastName || u.email);

/** Resolves a prefilled approver (id-only) to a display name via the global user cache, so the
 *  picker shows the person rather than "Unknown" when editing an existing policy. */
const ResolvingApproverField: FC<{
  user: WizardApproverUser;
  onChange: (u: PickedUser | null) => void;
}> = ({ user, onChange }) => {
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
  return <UserPickerField value={value} onChange={onChange} placeholder="Select approver" allowClear={false} />;
};

const ApproverUserField: FC<{
  user: WizardApproverUser | null;
  onChange: (u: PickedUser | null) => void;
}> = ({ user, onChange }) =>
  user && !hasApproverName(user) ? (
    <ResolvingApproverField user={user} onChange={onChange} />
  ) : (
    <UserPickerField value={user} onChange={onChange} placeholder="Select approver" allowClear={false} />
  );

export const ApprovalsStep: FC<StepProps> = ({ values, set }) => {
  const patchApprover = (index: number, patch: Partial<WizardApprover>) =>
    set(
      "apprApprovers",
      values.apprApprovers.map((a, i) => (i === index ? { ...a, ...patch } : a)),
    );
  const addApprover = () =>
    set("apprApprovers", [
      ...values.apprApprovers,
      { type: TimeOffPolicyApproverType.Manager, user: null, required: true },
    ]);
  const removeApprover = (index: number) =>
    set(
      "apprApprovers",
      values.apprApprovers.filter((_, i) => i !== index),
    );

  return (
    <div className="space-y-6">
      <StepIntro>Who signs off on requests. Turn off to auto-approve everything.</StepIntro>

      <ToggleField
        label="Require approval"
        hint="Requests need sign-off before they're approved."
        checked={values.apprRequiresApproval}
        onCheckedChange={(v) => set("apprRequiresApproval", v)}
      />

      {values.apprRequiresApproval && (
        <Reveal>
          <div className="space-y-2">
            <Label>Approval chain</Label>
            <div className="space-y-2">
              {values.apprApprovers.map((approver, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-lg border border-brown-200 px-3 py-2"
                >
                  <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-brown-100 text-xs font-semibold text-brown-700">
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
                        <SelectItem value={TimeOffPolicyApproverType.Manager}>Manager</SelectItem>
                        <SelectItem value={TimeOffPolicyApproverType.SpecificUser}>
                          Specific user
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
                      <span className="text-xs text-muted-foreground">
                        The employee&apos;s manager
                      </span>
                    )}
                  </div>

                  <label className="flex flex-none items-center gap-1.5 text-xs text-muted-foreground">
                    Required
                    <Switch
                      checked={approver.required}
                      onCheckedChange={(v) => patchApprover(index, { required: v })}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => removeApprover(index)}
                    disabled={values.apprApprovers.length <= 1}
                    className="flex-none text-brown-400 hover:text-red-600 disabled:opacity-40"
                    aria-label="Remove step"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" size="sm" className="mt-1 gap-1.5" onClick={addApprover}>
              <Plus className="h-4 w-4" />
              Add approval step
            </Button>
            <p className="text-xs text-muted-foreground">
              Manager steps route to each employee&apos;s manager; specific-user steps always go to the
              chosen person.
            </p>
          </div>

          <div className="space-y-1 border-t border-brown-100 pt-4">
            <ToggleField
              label="All approvals required"
              hint="Every step must approve (vs. any one)."
              checked={values.apprAllApprovalsRequired}
              onCheckedChange={(v) => set("apprAllApprovalsRequired", v)}
            />
            <ToggleField
              label="Strict order"
              hint="Steps approve in sequence. Requires all approvals."
              checked={values.apprApprovalOrderStrict}
              onCheckedChange={(v) => set("apprApprovalOrderStrict", v)}
            />
            <ToggleField
              label="Allow substitute approvers"
              checked={values.apprAllowSubstitutes}
              onCheckedChange={(v) => set("apprAllowSubstitutes", v)}
            />
          </div>
        </Reveal>
      )}
    </div>
  );
};

// ── Step: Eligibility ────────────────────────────────────────────────

export const EligibilityStep: FC<StepProps> = ({ values, set }) => (
  <div className="space-y-6">
    <StepIntro>When a newly-eligible employee can start using this policy.</StepIntro>

    <ToggleField
      label="Require a waiting period"
      hint="Employees can't take this leave until a delay after their reference date."
      checked={values.eligEnabled}
      onCheckedChange={(v) => set("eligEnabled", v)}
    />

    {values.eligEnabled && (
      <Reveal>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Waiting period</Label>
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
                  <SelectItem value={TimeOffEligibilityDelayUnit.Days}>Days</SelectItem>
                  <SelectItem value={TimeOffEligibilityDelayUnit.Months}>Months</SelectItem>
                  <SelectItem value={TimeOffEligibilityDelayUnit.Years}>Years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label>Counted from</Label>
            <Select
              value={values.eligReference}
              onValueChange={(v) => set("eligReference", v as TimeOffEligibilityReference)}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TimeOffEligibilityReference.HireDate}>Hire date</SelectItem>
                <SelectItem value={TimeOffEligibilityReference.ProbationEnd}>
                  Probation end (not enforced yet)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Probation-end isn&apos;t enforced yet (no probation date on employees) — requests against it
          are allowed until that exists.
        </p>
      </Reveal>
    )}
  </div>
);

// ── Step: Accrual ────────────────────────────────────────────────────

export const AccrualStep: FC<StepProps> = ({ values, set }) => {
  const isAccrued =
    values.entitlementGrantingMode === TimeOffPolicyEntitlementMode.Accrued;

  if (!isAccrued) {
    return (
      <div className="space-y-6">
        <StepIntro>How entitlement is earned over time.</StepIntro>
        <p className="rounded-lg border border-brown-200 bg-brown-50 px-4 py-3 text-sm text-muted-foreground">
          This policy grants its entitlement upfront, so there&apos;s nothing to accrue. Switch the
          granting mode to <span className="font-medium text-foreground">Accrued</span> in the
          Entitlement step to configure how it&apos;s earned.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StepIntro>How the yearly entitlement is earned over the year.</StepIntro>

      <Field label="Accrual frequency" htmlFor="wiz-accrual-freq">
        <Select
          value={values.accrualFrequency}
          onValueChange={(v) => set("accrualFrequency", v as TimeOffAccrualFrequency)}
        >
          <SelectTrigger id="wiz-accrual-freq">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TimeOffAccrualFrequency.Weekly}>Weekly</SelectItem>
            <SelectItem value={TimeOffAccrualFrequency.Monthly}>Monthly</SelectItem>
            <SelectItem value={TimeOffAccrualFrequency.Annually}>Annually</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Amount per period" htmlFor="wiz-accrual-amount" hint="Leave blank to spread the yearly quota evenly.">
          <Input
            id="wiz-accrual-amount"
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            placeholder="Auto from quota"
            value={values.accrualAmount}
            onChange={(e) => set("accrualAmount", e.target.value)}
          />
        </Field>

        <Field label="Accrual cap" htmlFor="wiz-accrual-cap" hint="Max earned per year. Blank = the yearly quota.">
          <Input
            id="wiz-accrual-cap"
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            placeholder="Yearly quota"
            value={values.accrualCap}
            onChange={(e) => set("accrualCap", e.target.value)}
          />
        </Field>
      </div>
    </div>
  );
};

// ── Step: Tenure ─────────────────────────────────────────────────────

export const TenureStep: FC<StepProps> = ({ values, set }) => {
  const patchRow = (index: number, patch: Partial<WizardTenureRule>) =>
    set(
      "tenureRules",
      values.tenureRules.map((t, i) => (i === index ? { ...t, ...patch } : t)),
    );
  const addRow = () =>
    set("tenureRules", [...values.tenureRules, { yearsOfService: "", bonusDays: "" }]);
  const removeRow = (index: number) =>
    set("tenureRules", values.tenureRules.filter((_, i) => i !== index));

  return (
    <div className="space-y-6">
      <StepIntro>Extra days once an employee reaches a length-of-service tier (highest tier wins).</StepIntro>

      <div className="space-y-2">
        {values.tenureRules.length === 0 && (
          <p className="rounded-lg border border-dashed border-brown-200 px-4 py-6 text-center text-sm text-muted-foreground">
            No tenure rewards. Everyone gets the base entitlement.
          </p>
        )}

        {values.tenureRules.map((row, index) => (
          <div key={index} className="flex items-end gap-2.5">
            <span className="pb-2 text-sm text-muted-foreground">After</span>
            <div className="space-y-1">
              <Label className="text-xs">Years of service</Label>
              <Input
                type="number"
                min={0}
                inputMode="numeric"
                className="w-28"
                value={row.yearsOfService}
                onChange={(e) => patchRow(index, { yearsOfService: e.target.value })}
              />
            </div>
            <span className="pb-2 text-sm text-muted-foreground">grant</span>
            <div className="space-y-1">
              <Label className="text-xs">Bonus days</Label>
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
              className="pb-2 flex-none text-brown-400 hover:text-red-600"
              aria-label="Remove tenure tier"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={addRow}>
        <Plus className="h-4 w-4" />
        Add tenure tier
      </Button>
    </div>
  );
};

// ── Step: Blackout ───────────────────────────────────────────────────

export const BlackoutStep: FC<StepProps> = ({ values, set }) => {
  const patchRow = (index: number, patch: Partial<WizardBlackout>) =>
    set(
      "blackouts",
      values.blackouts.map((b, i) => (i === index ? { ...b, ...patch } : b)),
    );
  const addRow = () =>
    set("blackouts", [...values.blackouts, { name: "", startDate: "", endDate: "" }]);
  const removeRow = (index: number) =>
    set("blackouts", values.blackouts.filter((_, i) => i !== index));

  return (
    <div className="space-y-6">
      <StepIntro>Periods when requests against this policy are blocked (e.g. a year-end freeze).</StepIntro>

      <div className="space-y-2">
        {values.blackouts.length === 0 && (
          <p className="rounded-lg border border-dashed border-brown-200 px-4 py-6 text-center text-sm text-muted-foreground">
            No blackout periods. Requests are allowed all year.
          </p>
        )}

        {values.blackouts.map((row, index) => (
          <div
            key={index}
            className="flex items-end gap-2 rounded-lg border border-brown-200 px-3 py-2"
          >
            <div className="flex-1 space-y-1">
              <Label className="text-xs">Name (optional)</Label>
              <Input
                placeholder="Year-end freeze"
                value={row.name}
                onChange={(e) => patchRow(index, { name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">From</Label>
              <Input
                type="date"
                value={row.startDate}
                onChange={(e) => patchRow(index, { startDate: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">To</Label>
              <Input
                type="date"
                value={row.endDate}
                onChange={(e) => patchRow(index, { endDate: e.target.value })}
              />
            </div>
            <button
              type="button"
              onClick={() => removeRow(index)}
              className="mb-1.5 flex-none text-brown-400 hover:text-red-600"
              aria-label="Remove blackout period"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={addRow}>
        <Plus className="h-4 w-4" />
        Add blackout period
      </Button>
    </div>
  );
};

// ── Step: Coverage ───────────────────────────────────────────────────

export const CoverageStep: FC<StepProps> = ({ values, set }) => (
  <div className="space-y-6">
    <StepIntro>Cap how many people can be away at the same time.</StepIntro>

    <ToggleField
      label="Limit how many people are away"
      hint="Block or warn when too many people in the scope overlap."
      checked={values.covEnabled}
      onCheckedChange={(v) => set("covEnabled", v)}
    />

    {values.covEnabled && (
      <Reveal>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Max people away</Label>
            <Input
              type="number"
              min={0}
              inputMode="numeric"
              className="w-24"
              value={values.covMaxUsers}
              onChange={(e) => set("covMaxUsers", e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label>Within</Label>
            <Select
              value={values.covScope}
              onValueChange={(v) => set("covScope", v as TimeOffCoverageScope)}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TimeOffCoverageScope.Team}>The same team</SelectItem>
                <SelectItem value={TimeOffCoverageScope.Department}>The same department</SelectItem>
                <SelectItem value={TimeOffCoverageScope.Company}>The whole company</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1">
          <Label>When the limit is reached</Label>
          <Select
            value={values.covBehavior}
            onValueChange={(v) => set("covBehavior", v as TimeOffCoverageBehavior)}
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TimeOffCoverageBehavior.Block}>Block the request</SelectItem>
              <SelectItem value={TimeOffCoverageBehavior.Warn}>Warn only (advisory)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Warn is advisory for now — the request still goes through.
          </p>
        </div>
      </Reveal>
    )}
  </div>
);

// ── Step 7: Editing ──────────────────────────────────────────────────

export const EditingStep: FC<StepProps> = ({ values, set }) => (
  <div className="space-y-6">
    <StepIntro>Who can edit time off requests, and when.</StepIntro>

    <div className="space-y-1">
      <ToggleField
        label="Employees can edit their own requests"
        checked={values.editEmployeeCanEditOwn}
        onCheckedChange={(v) => set("editEmployeeCanEditOwn", v)}
      />
      <ToggleField
        label="Allow editing approved requests"
        checked={values.editAllowEditApproved}
        onCheckedChange={(v) => set("editAllowEditApproved", v)}
      />
      <ToggleField
        label="Allow editing during active leave"
        checked={values.editAllowEditDuringActiveLeave}
        onCheckedChange={(v) => set("editAllowEditDuringActiveLeave", v)}
      />
      <ToggleField
        label="Edits require re-approval"
        hint="An edited request goes back through approval."
        checked={values.editRequiresReapproval}
        onCheckedChange={(v) => set("editRequiresReapproval", v)}
      />
      <ToggleField
        label="Managers can edit their team's requests"
        checked={values.editManagerCanEditTeam}
        onCheckedChange={(v) => set("editManagerCanEditTeam", v)}
      />
      <ToggleField
        label="Admins can edit any request"
        checked={values.editAdminCanEditAny}
        onCheckedChange={(v) => set("editAdminCanEditAny", v)}
      />
      <ToggleField
        label="Allow editing past requests"
        checked={values.editAllowPastEdits}
        onCheckedChange={(v) => set("editAllowPastEdits", v)}
      />
    </div>
  </div>
);

// ── Step 8: Review ───────────────────────────────────────────────────

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

export const ReviewStep: FC<{ values: PolicyWizardValues; leaveTypeName?: string }> = ({
  values,
  leaveTypeName,
}) => {
  const unitLabel = values.unit === TimeOffPolicyUnit.Hours ? "hours" : "days";
  const quota = values.unlimitedQuota ? "Unlimited" : `${values.yearlyQuota || "0"} ${unitLabel}/year`;
  const carryover =
    values.carryoverType === TimeOffPolicyCarryoverType.None
      ? "None"
      : values.carryoverType === TimeOffPolicyCarryoverType.Unlimited
        ? "Unlimited"
        : `Limited to ${values.carryoverLimit || "0"}`;
  const selectedDays = WEEKDAY_BITS.filter((d) => hasWeekday(values.validWeekdays, d.bit))
    .map((d) => d.label)
    .join(", ");

  return (
    <div className="space-y-5">
      <StepIntro>Review the policy before creating it. You can go back to any step to adjust.</StepIntro>

      <div className="rounded-lg border border-brown-200 p-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brown-400">
          {leaveTypeName ? `Leave type: ${leaveTypeName}` : "New policy"}
        </p>
        <p className="text-lg font-semibold text-foreground">{values.name || "Untitled policy"}</p>
        {values.description && (
          <p className="mt-1 text-sm text-muted-foreground">{values.description}</p>
        )}
      </div>

      <div className="divide-y divide-brown-100 rounded-lg border border-brown-200 px-4 py-1.5">
        <Summary label="Unit" value={values.unit === TimeOffPolicyUnit.Hours ? "Hours" : "Days"} />
        <Summary label="Pay type" value={values.paid ? "Paid" : "Unpaid"} />
        <Summary label="Quota" value={quota} />
        <Summary label="Renewal" value={renewalSummary(values)} />
        <Summary label="Carryover" value={carryover} />
        <Summary
          label="Counting"
          value={values.countingMode === TimeOffPolicyCountingMode.WorkingDays ? "Working days" : "Calendar days"}
        />
        <Summary label="Working days" value={selectedDays || "—"} />
        <Summary label="Negative balance" value={values.allowNegativeBalance ? "Allowed" : "Not allowed"} />
        <Summary
          label="Approval"
          value={
            values.apprRequiresApproval
              ? `${values.apprApprovers.length} step${values.apprApprovers.length === 1 ? "" : "s"}`
              : "Auto-approve"
          }
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Request rules, approvals and edit rules can be configured after the policy is created.
      </p>
    </div>
  );
};
