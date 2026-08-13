"use client";

import { FC, ReactNode } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";
import { Switch } from "@/public/desact/src/components/ui/switch";
import { Checkbox } from "@/public/desact/src/components/ui/checkbox";
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
import {
  PolicyWizardValues,
  WEEKDAY_BITS,
  hasWeekday,
  toggleWeekday,
} from "./policyWizardTypes";

const NO_MAX = "NONE";

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
    <div className="flex items-start justify-between gap-4 py-1">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      </div>
      <Switch className="mt-0.5" checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
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

    <Field label="Granting mode" htmlFor="wiz-grant" hint="Accrual (earning over time) arrives with the accrual engine.">
      <Select
        value={values.entitlementGrantingMode}
        onValueChange={(v) => set("entitlementGrantingMode", v as TimeOffPolicyEntitlementMode)}
      >
        <SelectTrigger id="wiz-grant">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={TimeOffPolicyEntitlementMode.Upfront}>Upfront (full amount)</SelectItem>
          <SelectItem value={TimeOffPolicyEntitlementMode.Accrued} disabled>
            Accrued (coming soon)
          </SelectItem>
        </SelectContent>
      </Select>
    </Field>

    <Field label="Renewal" htmlFor="wiz-renewal" hint="When the balance resets each year.">
      <Select
        value={values.renewalType}
        onValueChange={(v) => set("renewalType", v as TimeOffPolicyRenewalType)}
      >
        <SelectTrigger id="wiz-renewal">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={TimeOffPolicyRenewalType.YearlyFixedDate}>Yearly on a fixed date</SelectItem>
          <SelectItem value={TimeOffPolicyRenewalType.Manual}>Manual</SelectItem>
        </SelectContent>
      </Select>
    </Field>

    {values.renewalType === TimeOffPolicyRenewalType.YearlyFixedDate && (
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
              <Checkbox checked={active} className="pointer-events-none" />
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
      <Field label="Minimum request unit" htmlFor="wiz-minunit">
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

      <Field label="Maximum request unit" htmlFor="wiz-maxunit" hint="Optional upper bound.">
        <Select
          value={values.reqMaxRequestUnit === "" ? NO_MAX : values.reqMaxRequestUnit}
          onValueChange={(v) => set("reqMaxRequestUnit", v === NO_MAX ? "" : (v as TimeOffRequestUnit))}
        >
          <SelectTrigger id="wiz-maxunit">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_MAX}>No maximum</SelectItem>
            <SelectItem value={TimeOffRequestUnit.FullDay}>Full day</SelectItem>
            <SelectItem value={TimeOffRequestUnit.HalfDay}>Half day</SelectItem>
            <SelectItem value={TimeOffRequestUnit.Hours}>Hours</SelectItem>
          </SelectContent>
        </Select>
      </Field>
    </div>

    <div className="space-y-1">
      <ToggleField
        label="Allow half-day requests"
        checked={values.reqAllowHalfDay}
        onCheckedChange={(v) => set("reqAllowHalfDay", v)}
      />
      <ToggleField
        label="Allow hourly requests"
        checked={values.reqAllowHourly}
        onCheckedChange={(v) => set("reqAllowHourly", v)}
      />
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

export const ApprovalsStep: FC<StepProps> = ({ values, set }) => {
  const setApprover = (index: number, required: boolean) => {
    const next = values.apprApprovers.map((a, i) => (i === index ? { required } : a));
    set("apprApprovers", next);
  };
  const addApprover = () => set("apprApprovers", [...values.apprApprovers, { required: true }]);
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
                  className="flex items-center justify-between gap-3 rounded-lg border border-brown-200 px-3 py-2"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brown-100 text-xs font-semibold text-brown-700">
                      {index + 1}
                    </span>
                    <span className="text-sm text-foreground">Manager</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      Required
                      <Switch checked={approver.required} onCheckedChange={(v) => setApprover(index, v)} />
                    </label>
                    <button
                      type="button"
                      onClick={() => removeApprover(index)}
                      disabled={values.apprApprovers.length <= 1}
                      className="text-brown-400 hover:text-red-600 disabled:opacity-40"
                      aria-label="Remove step"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" size="sm" className="mt-1 gap-1.5" onClick={addApprover}>
              <Plus className="h-4 w-4" />
              Add approval step
            </Button>
            <p className="text-xs text-muted-foreground">
              Specific-user approvers can be added later; the wizard uses the employee&apos;s manager for now.
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
        <Summary
          label="Renewal"
          value={
            values.renewalType === TimeOffPolicyRenewalType.Manual
              ? "Manual"
              : `${values.renewalFixedDay}/${values.renewalFixedMonth} yearly`
          }
        />
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
