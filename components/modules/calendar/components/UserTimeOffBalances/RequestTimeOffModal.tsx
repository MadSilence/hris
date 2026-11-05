"use client";

import { dateToISO, isoToDate, useDateFormatter, useShortDates } from "@/lib/date";

import { formatDayAmount } from "@/models/timeOff/formatDayAmount";
import { FC, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Calendar03Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import type { DateRange } from "react-day-picker";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/desact/dialog";
import { Button } from "@/components/desact/button";
import { Label } from "@/components/desact/label";
import { Textarea } from "@/components/desact/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/desact/popover";
import { Calendar } from "@/components/desact/calendar";
import { cn } from "@/lib/cn";

import { useCreateTimeOffRequest } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useCreateTimeOffRequest";
import { useTimeOffRequestDuration } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useTimeOffRequestDuration";
import { useTimeOffOverlaps } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useTimeOffOverlaps";
import { useTimeOffApproverPreview } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useTimeOffApproverPreview";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/desact/avatar";
import { TimeOffPolicyUnit } from "@/api/modules/timeOff/timeOffPolicies/dto";
import { TimeOffPolicyCountingMode } from "@/api/modules/timeOff/timeOffPolicies/dto/TimeOffPolicyCountingMode";
import type { EmployeeTimeOffBalance, TimeOffPolicy } from "@/models/timeOff";
import { PolicyMarker } from "@/components/ui/PolicyMarker";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { FormError } from "@/components/feedback/FormError";
import { FieldError } from "@/components/desact/field-error";
import { showSuccess } from "@/lib/errors/errorToast";
import { LeaveTypeCategory } from "@/api/modules/timeOff/leaveTypes/dto";

type Props = {
  isOpen: boolean;
  userId: string;
  balances: EmployeeTimeOffBalance[];
  policyMap: Map<string, TimeOffPolicy>;
  initialStartDate?: string;
  initialEndDate?: string;
  /** Whose leave this is, when it is not the reader's own — the title names them. */
  forName?: string;
  onCloseAction: () => void;
};

// Inclusive calendar-day count, matching the backend duration (ChronoUnit.DAYS + 1).
const inclusiveDays = (start: string, end: string): number => {
  if (!start || !end) return 0;
  const a = new Date(`${start}T00:00:00`).getTime();
  const b = new Date(`${end}T00:00:00`).getTime();
  if (Number.isNaN(a) || Number.isNaN(b) || b < a) return 0;
  return Math.floor((b - a) / 86_400_000) + 1;
};

export const RequestTimeOffModal: FC<Props> = ({
  isOpen,
  userId,
  balances,
  policyMap,
  initialStartDate,
  initialEndDate,
  forName,
  onCloseAction,
}) => {
  const t = useTranslations("calendar");
  const formatDisplayDate = useDateFormatter();
  const shortDates = useShortDates();
  const tCommon = useTranslations("common");
  const createMutation = useCreateTimeOffRequest();

  // Only the periods a request could actually fall into.
  //
  // The picker listed one row per *balance*, so a policy whose previous period is still on file
  // appeared twice — "17 d left" and "-3 d left" — and picking the closed one filed against a period
  // that has ended. A request has to sit inside one balance period, so a period already over can
  // never be the right answer, and offering it only invites a refusal.
  const selectable = useMemo(() => {
    const today = dateToISO(new Date());
    const open = balances.filter((b) => !b.periodEnd || b.periodEnd >= today);
    // One row per assignment: the earliest period that has not ended is the one today falls in.
    const byAssignment = new Map<string, EmployeeTimeOffBalance>();
    for (const b of [...open].sort((a, c) => a.periodStart.localeCompare(c.periodStart))) {
      if (!byAssignment.has(b.assignmentId)) byAssignment.set(b.assignmentId, b);
    }
    // A VACATION policy first — and so picked by default — as it leads the balances (the owner, 2026-11-05); the
    // order the periods happened to start in made the dialog open on Sick Leave (walk of 2026-11-05).
    const isVacation = (b: EmployeeTimeOffBalance) =>
      policyMap.get(b.policyId)?.leaveTypeCategory === LeaveTypeCategory.Vacation ? 0 : 1;
    return [...byAssignment.values()].sort((a, c) => isVacation(a) - isVacation(c));
  }, [balances, policyMap]);

  const [assignmentId, setAssignmentId] = useState(selectable[0]?.assignmentId ?? "");
  const [startDate, setStartDate] = useState(initialStartDate ?? "");
  const [endDate, setEndDate] = useState(initialEndDate ?? initialStartDate ?? "");
  const [reason, setReason] = useState("");
  // A refusal from the server goes under the form; what the reader left out goes under its field (C2).
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ policy?: string; dates?: string }>({});
  /** Set once the request has been filed and the coverage cap wants the person to know. */
  const [coverageWarning, setCoverageWarning] = useState<string[] | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const selected = useMemo(
    () => selectable.find((b) => b.assignmentId === assignmentId),
    [selectable, assignmentId],
  );
  const policy = selected ? policyMap.get(selected.policyId) : undefined;
  const isHours = policy?.unit === TimeOffPolicyUnit.Hours;
  const unit = isHours ? t("units.hoursShort") : t("units.daysShort");
  const unlimited = policy?.unlimitedQuota ?? false;

  // Authoritative counted duration from the backend (working days minus holidays, per policy counting
  // mode). Fall back to a plain inclusive-day estimate while it loads / for an invalid range.
  const { data: durationPreview } = useTimeOffRequestDuration(assignmentId || undefined, startDate, endDate);
  const estimatedDays = inclusiveDays(startDate, endDate);
  const days = durationPreview?.amount ?? estimatedDays;
  const isWorkingDays = durationPreview?.countingMode === TimeOffPolicyCountingMode.WorkingDays;
  const remainingAfter = selected ? selected.currentBalance - days : 0;
  const insufficient = !unlimited && days > 0 && remainingAfter < 0;

  // Who else from the team/department is already out then. Advisory: the policy's coverage rules are
  // what can actually reject the request — this just stops people booking blind.
  const { data: overlaps } = useTimeOffOverlaps(userId, startDate, endDate);
  // The server sends them already ordered — the manager first, then by days shared (C8).
  const overlapPeople = useMemo(() => {
    const byUser = new Map<string, {
      name: string; start: string; end: string; avatarUrl: string | null; manager: boolean; teamName: string | null;
    }>();
    for (const o of overlaps ?? []) {
      const existing = byUser.get(o.userId);
      // One row per person even when they have several requests in the window.
      byUser.set(o.userId, {
        name: `${o.firstName} ${o.lastName}`.trim(),
        start: existing && existing.start < o.startDate ? existing.start : o.startDate,
        end: existing && existing.end > o.endDate ? existing.end : o.endDate,
        avatarUrl: o.avatarUrl,
        manager: Boolean(o.manager),
        teamName: o.teamName ?? null,
      });
    }
    return [...byUser.values()];
  }, [overlaps]);
  const teamSize = overlaps?.[0]?.teamSize ?? 0;
  const teamAway = overlapPeople.filter((p) => p.teamName).length;
  const [allOffOpen, setAllOffOpen] = useState(false);

  // Who decides first (C7): the approver, then the delegates or the fallback role's holders.
  const { data: approvers } = useTimeOffApproverPreview(assignmentId || undefined);
  const firstApprover = approvers?.deciders[0];
  const moreApprovers = Math.max((approvers?.deciders.length ?? 0) - 1, 0);
  // The days of theirs that fall inside the request — what "Also off" shows beside each name.
  const clip = (p: { start: string; end: string }) => ({
    start: p.start < startDate ? startDate : p.start,
    end: p.end > endDate ? endDate : p.end,
  });
  const ALSO_OFF_SHOWN = 3;
  const shortfall = insufficient ? -remainingAfter : 0;
  const isSick = policy?.leaveTypeCategory === LeaveTypeCategory.Sick;

  const range: DateRange | undefined = startDate
    ? { from: isoToDate(startDate), to: endDate ? isoToDate(endDate) : isoToDate(startDate) }
    : undefined;

  const handleRangeSelect = (r?: DateRange) => {
    if (!r?.from) {
      setStartDate("");
      setEndDate("");
      return;
    }
    setStartDate(dateToISO(r.from));
    setEndDate(dateToISO(r.to ?? r.from));
    setFieldErrors((f) => ({ ...f, dates: undefined }));
    if (r.from && r.to) setPickerOpen(false);
  };

  // Both ends in full, as the owner's specification writes it: "Wed, 11 Nov – Fri, 13 Nov".
  const dateLabel = startDate
    ? endDate && endDate !== startDate
      ? `${shortDates.date(startDate, { weekday: true })} – ${shortDates.date(endDate, { weekday: true })}`
      : shortDates.date(startDate, { weekday: true })
    : t("request.selectDates");

  // The button is always pressable (C2): pressing it with a field missing says so under that field.
  const handleSubmit = async () => {
    const missing = {
      policy: assignmentId ? undefined : t("request.errors.pickPolicy"),
      dates: !startDate || !endDate
        ? t("request.errors.chooseDates")
        : days <= 0
          ? t("request.errors.endBeforeStart")
          : undefined,
    };
    setFieldErrors(missing);
    if (missing.policy || missing.dates) return;
    setError(null);
    try {
      const result = await createMutation.mutateAsync({
        assignmentId,
        startDate,
        endDate,
        reason: reason.trim() || null,
      });

      // The request went through, and the coverage cap says these days are already thin. A policy
      // set to WARN means exactly this: let it through, and tell them. Closing the dialog silently
      // is what "computed, logged and discarded" looked like from the outside.
      const warnDays = result.data?.coverageWarningDays ?? [];
      if (warnDays.length > 0) {
        setCoverageWarning(warnDays);
        return;
      }

      showSuccess(firstApprover
        ? t("request.requestedTo", { name: firstApprover.name.split(" ")[0] })
        : t("request.requested"));
      onCloseAction();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("request.errors.failed"));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onCloseAction(); }}>
      {/* The request dialog (the owner's specification, with the designers' values of 2026-11-05): 800 px, white, a plain
          head with its ×, the form beside a 280 px preview card (radius 16), a footer naming who decides. */}
      <DialogContent size="lg" aria-describedby={undefined} className="gap-0 overflow-hidden p-0">
        <DialogHeader className="px-6 pt-5 text-left">
          <DialogTitle className="text-section-title">
            {forName ? t("request.titleFor", { name: forName }) : t("request.title")}
          </DialogTitle>
        </DialogHeader>

        <div className="grid items-start gap-6 px-6 py-5 md:grid-cols-[minmax(0,1fr)_280px]">
          {/* Form — 16 px between fields, labels 14/500 above them, no asterisks. */}
          <div className="space-y-4">
            <div>
              <Label>{t("request.policy")}</Label>
              <SearchableSelect
                options={selectable.map((b) => {
                  const p = policyMap.get(b.policyId);
                  const left = p?.unlimitedQuota
                    ? t("balances.unlimited")
                    : t("request.leftHint", {
                        amount: formatDayAmount(b.currentBalance),
                        unit: p?.unit === TimeOffPolicyUnit.Hours ? t("units.hoursShort") : t("units.daysShort"),
                      });
                  return {
                    value: b.assignmentId,
                    label: p?.name ?? t("balances.fallbackName"),
                    hint: left,
                    icon: <PolicyMarker color={p?.color} />,
                  };
                })}
                value={assignmentId || null}
                onChange={(v) => {
                  setAssignmentId(v ?? "");
                  setFieldErrors((f) => ({ ...f, policy: undefined }));
                }}
                placeholder={t("assign.selectPolicy")}
                disabled={createMutation.isPending}
                clearable={false}
              />
              <FieldError>{fieldErrors.policy}</FieldError>
            </div>

            <div>
              <Label>{t("request.dates")}</Label>
              <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={createMutation.isPending}
                    aria-invalid={Boolean(fieldErrors.dates) || undefined}
                    className={cn(
                      "w-full justify-start font-normal",
                      !startDate && "text-tertiary",
                    )}
                  >
                    <Icon icon={Calendar03Icon} size="sm" />
                    {dateLabel}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={range}
                    onSelect={handleRangeSelect}
                    defaultMonth={range?.from ?? new Date()}
                    numberOfMonths={1}
                  />
                </PopoverContent>
              </Popover>
              <FieldError>{fieldErrors.dates}</FieldError>
            </div>

            {/* Half day goes here, between Dates and Note, when it is built (development_plan/HALF_DAY_PLAN.md). */}

            <div>
              <Label htmlFor="req-reason">
                {t.rich("request.note", {
                  muted: (chunks) => <span className="font-normal text-tertiary">{chunks}</span>,
                })}
              </Label>
              <Textarea
                id="req-reason"
                className="min-h-18"
                placeholder={isSick ? t("request.notePlaceholderSick") : t("request.notePlaceholder")}
                value={reason}
                onChange={(e) => setReason(e.currentTarget.value)}
                rows={2}
                disabled={createMutation.isPending}
              />
            </div>

            {error && <FormError message={error} />}
          </div>

          {/* Preview — updates as the policy and the dates change. */}
          <div>
            <aside className="rounded-card border border-divider bg-subtle px-4 pt-3.5 pb-1.5">
              <p className="flex items-center gap-2 pb-2.5 text-card-title text-primary">
                {policy ? <PolicyMarker color={policy.color} /> : null}
                <span className="truncate">{policy?.name ?? "—"}</span>
              </p>

              <div className="flex h-8 items-center justify-between border-t border-divider text-body">
                <span className="text-tertiary">{t("request.available")}</span>
                <span className="font-medium tabular-nums text-primary">
                  {selected
                    ? unlimited
                      ? t("request.noLimit")
                      : t("request.amountUnit", { amount: formatDayAmount(selected.currentBalance), unit })
                    : "—"}
                </span>
              </div>

              <div className="flex h-8 items-center justify-between border-t border-divider text-body">
                <span className="text-tertiary">{t("request.duration")}</span>
                <span className="font-medium tabular-nums text-primary">
                  {days <= 0
                    ? "—"
                    : isWorkingDays && !isHours
                      ? t("request.durationWorkingDays", { amount: formatDayAmount(days), count: days })
                      : tCommon("time.days", { count: days })}
                </span>
              </div>

              {!unlimited && selected && days > 0 && (
                <div className="flex h-8 items-center justify-between border-t border-divider text-body">
                  <span className="text-tertiary">{t("request.leftAfter")}</span>
                  <span className={cn("font-medium tabular-nums", insufficient ? "text-danger-text" : "text-primary")}>
                    {t("request.amountUnit", { amount: formatDayAmount(remainingAfter), unit })}
                  </span>
                </div>
              )}

              {/* Also off (C8): a block of its own — a hairline right under the balance, then air. */}
              {days > 0 && overlapPeople.length > 0 && (
                <div className="border-t border-divider pt-6 pb-2">
                  <p className="mb-2 text-label font-normal text-tertiary">
                    {teamSize > 0 && teamAway * 2 >= teamSize
                      ? t("request.alsoOffOfTeam", { count: teamAway })
                      : t("request.alsoOff")}
                  </p>
                  {overlapPeople.slice(0, ALSO_OFF_SHOWN).map((p) => (
                    <AlsoOffRow key={p.name} person={p} range={shortDates.range(clip(p).start, clip(p).end)}
                                relation={p.manager ? t("request.yourManager") : p.teamName} />
                  ))}
                  {overlapPeople.length > ALSO_OFF_SHOWN && (
                    <Popover open={allOffOpen} onOpenChange={setAllOffOpen}>
                      <PopoverTrigger asChild>
                        <button type="button" className="flex h-8 items-center text-body text-accent-text hover:underline">
                          {t("request.alsoOffMore", { count: overlapPeople.length - ALSO_OFF_SHOWN })}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent side="left" align="start" className="w-80 p-3">
                        {/* Everyone, the same rows and order; it scrolls past eight. */}
                        <div className="max-h-64 overflow-y-auto">
                          {overlapPeople.map((p) => (
                            <AlsoOffRow key={p.name} person={p} range={shortDates.range(clip(p).start, clip(p).end)}
                                        relation={p.manager ? t("request.yourManager") : p.teamName} />
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              )}
            </aside>
            {shortfall > 0 && (
              <FieldError className="mt-2">
                {t("request.shortfall", { amount: formatDayAmount(shortfall), count: shortfall })}
              </FieldError>
            )}
          </div>
        </div>

        {coverageWarning && (
          <div className="border-t border-status-pending-border bg-status-pending-bg px-6 py-4">
            <p className="text-body font-medium text-status-pending-text">
              {t("request.coverage.submitted")}
            </p>
            <p className="mt-1 text-hint text-status-pending-text">
              {t("request.coverage.warning", {
                count: coverageWarning.length,
                days: coverageWarning.map((d) => formatDisplayDate(d, { style: "medium" })).join(", "),
              })}
            </p>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 border-t border-divider px-6 py-4">
          {/* Who decides (C7): the first and "+N"; no line when nobody resolves. */}
          {firstApprover && !coverageWarning && (
            <p className="mr-auto flex min-w-0 items-center gap-2 text-label font-normal text-secondary">
              <Avatar className="size-[22px]">
                {firstApprover.avatarUrl ? <AvatarImage src={firstApprover.avatarUrl} alt="" /> : null}
                <AvatarFallback name={firstApprover.name} className="text-hint">{firstApprover.name.slice(0, 1)}</AvatarFallback>
              </Avatar>
              <span className="truncate">
                {moreApprovers > 0
                  ? t("request.goesToMore", { name: firstApprover.name, count: moreApprovers })
                  : t("request.goesTo", { name: firstApprover.name })}
              </span>
            </p>
          )}
          {coverageWarning ? (
            <Button type="button" onClick={onCloseAction}>{t("request.gotIt")}</Button>
          ) : (
            <>
              <Button type="button" variant="secondary" onClick={onCloseAction} disabled={createMutation.isPending}>
                {tCommon("actions.cancel")}
              </Button>
              <Button type="button" onClick={handleSubmit} loading={createMutation.isPending}>
                {createMutation.isPending
                  ? t("request.requesting")
                  : days > 0 && !isHours
                    ? t("request.submitDays", { amount: formatDayAmount(days), count: days })
                    : t("request.title")}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

/** A row of "Also off": the person, why they are here (the manager, or the team), and the days they share. */
const AlsoOffRow: FC<{
  person: { name: string; avatarUrl: string | null };
  relation: string | null;
  range: string;
}> = ({ person, relation, range }) => (
  <div className="flex h-8 items-center gap-2 text-body">
    <Avatar className="size-[22px]">
      {person.avatarUrl ? <AvatarImage src={person.avatarUrl} alt="" /> : null}
      <AvatarFallback name={person.name} className="text-hint">{person.name.slice(0, 1)}</AvatarFallback>
    </Avatar>
    <span className="min-w-0 truncate text-primary">{person.name}</span>
    {relation && <span className="shrink-0 truncate text-hint text-tertiary">{relation}</span>}
    <span className="ml-auto shrink-0 text-label font-normal tabular-nums text-tertiary">{range}</span>
  </div>
);

export default RequestTimeOffModal;
