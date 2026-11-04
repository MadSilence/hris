"use client";

import { dateToISO, formatDisplayDate, isoToDate } from "@/lib/date";

import { formatDayAmount } from "@/models/timeOff/formatDayAmount";
import { FC, useMemo, useState } from "react";
import { Calendar03Icon, UserGroupIcon } from "@hugeicons/core-free-icons";
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
import { TimeOffPolicyUnit } from "@/api/modules/timeOff/timeOffPolicies/dto";
import { TimeOffPolicyCountingMode } from "@/api/modules/timeOff/timeOffPolicies/dto/TimeOffPolicyCountingMode";
import type { EmployeeTimeOffBalance, TimeOffPolicy } from "@/models/timeOff";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { FormError } from "@/components/feedback/FormError";
import { TAG_CLASSES, toTagColor } from "@/lib/theme/tags";

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

// The reader's own date format (lib/date), as everywhere else — not a hard-coded "Nov 11, 2026".
const prettyISO = (iso: string) => formatDisplayDate(iso, { style: "medium" });

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
    return [...byAssignment.values()];
  }, [balances]);

  const [assignmentId, setAssignmentId] = useState(selectable[0]?.assignmentId ?? "");
  const [startDate, setStartDate] = useState(initialStartDate ?? "");
  const [endDate, setEndDate] = useState(initialEndDate ?? initialStartDate ?? "");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  /** Set once the request has been filed and the coverage cap wants the person to know. */
  const [coverageWarning, setCoverageWarning] = useState<string[] | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const selected = useMemo(
    () => selectable.find((b) => b.assignmentId === assignmentId),
    [selectable, assignmentId],
  );
  const policy = selected ? policyMap.get(selected.policyId) : undefined;
  const unit = policy?.unit === TimeOffPolicyUnit.Hours ? "h" : "d";
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
  const overlapPeople = useMemo(() => {
    const byUser = new Map<string, { name: string; start: string; end: string }>();
    for (const o of overlaps ?? []) {
      const existing = byUser.get(o.userId);
      // One row per person even when they have several requests in the window.
      byUser.set(o.userId, {
        name: `${o.firstName} ${o.lastName}`.trim(),
        start: existing && existing.start < o.startDate ? existing.start : o.startDate,
        end: existing && existing.end > o.endDate ? existing.end : o.endDate,
      });
    }
    return [...byUser.values()];
  }, [overlaps]);

  const canSubmit = Boolean(assignmentId) && days > 0 && !createMutation.isPending;

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
    if (r.from && r.to) setPickerOpen(false);
  };

  const dateLabel = startDate
    ? endDate && endDate !== startDate
      ? `${prettyISO(startDate)} – ${prettyISO(endDate)}`
      : prettyISO(startDate)
    : "Select dates";

  const handleSubmit = async () => {
    if (!assignmentId) {
      setError("Pick a policy to request against.");
      return;
    }
    if (!startDate || !endDate) {
      setError("Choose your time-off dates.");
      return;
    }
    if (days <= 0) {
      setError("The end date must be on or after the start date.");
      return;
    }
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

      onCloseAction();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit the request.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onCloseAction(); }}>
      <DialogContent hideClose size="lg" aria-describedby={undefined} className="overflow-hidden p-0">
        {/* A plain head: the title says what this is (design fixes of 2026-11-04, fix 10). */}
        <DialogHeader className="px-6 pt-5 text-left">
          <DialogTitle className="text-section-title">
            {forName ? `Request time off for ${forName}` : "Request time off"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid items-start gap-6 px-6 pb-5 md:grid-cols-[minmax(0,1fr)_280px]">
          {/* Form */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Policy</Label>
              <SearchableSelect
                options={selectable.map((b) => {
                  const p = policyMap.get(b.policyId);
                  const left = p?.unlimitedQuota
                    ? "Unlimited"
                    : `${formatDayAmount(b.currentBalance)} ${p?.unit === TimeOffPolicyUnit.Hours ? "h" : "d"} left`;
                  return { value: b.assignmentId, label: p?.name ?? "Time off", hint: left };
                })}
                value={assignmentId || null}
                onChange={(v) => setAssignmentId(v ?? "")}
                placeholder="Select a policy"
                disabled={createMutation.isPending}
                clearable={false}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Dates</Label>
              <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={createMutation.isPending}
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
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="req-reason">
                Note <span className="font-normal text-tertiary">(optional)</span>
              </Label>
              <Textarea
                id="req-reason"
                placeholder="Anything your manager should know"
                value={reason}
                onChange={(e) => setReason(e.currentTarget.value)}
                rows={3}
                disabled={createMutation.isPending}
              />
            </div>

            {days > 0 && overlapPeople.length > 0 && (
              <div className="rounded-control border border-divider bg-subtle/40 p-3">
                <p className="flex items-center gap-1.5 text-hint font-medium text-primary">
                  <Icon icon={UserGroupIcon} size="sm" />
                  {overlapPeople.length === 1
                    ? "1 colleague is already away then"
                    : `${overlapPeople.length} colleagues are already away then`}
                </p>
                <ul className="mt-2 space-y-1">
                  {overlapPeople.slice(0, 5).map((p) => (
                    <li key={p.name} className="flex items-center justify-between gap-3 text-hint">
                      <span className="truncate text-primary">{p.name}</span>
                      <span className="shrink-0 text-tertiary">
                        {p.start === p.end ? prettyISO(p.start) : `${prettyISO(p.start)} – ${prettyISO(p.end)}`}
                      </span>
                    </li>
                  ))}
                </ul>
                {overlapPeople.length > 5 && (
                  <p className="mt-1.5 text-hint text-tertiary">
                    and {overlapPeople.length - 5} more
                  </p>
                )}
              </div>
            )}

            {error && <FormError message={error} />}
          </div>

          {/* Summary */}
          <aside className="flex flex-col gap-3 rounded-popover border border-divider bg-subtle p-4">
            <div>
              <p className="text-label font-normal text-tertiary">Policy</p>
              <p className="mt-1 flex items-center gap-2 truncate text-card-title text-primary">
                {policy && (
                  <span aria-hidden className={cn("size-2 shrink-0 rounded-pill", TAG_CLASSES[toTagColor(policy.leaveTypeColor)].dot)} />
                )}
                {policy?.name ?? "—"}
              </p>
            </div>

            <div className="flex items-center justify-between text-body">
              <span className="text-tertiary">Available</span>
              <span className="font-medium text-primary">
                {selected ? (unlimited ? "No limit" : `${formatDayAmount(selected.currentBalance)} ${unit}`) : "—"}
              </span>
            </div>

            <div className="flex items-center justify-between text-body">
              <span className="text-tertiary">
                Duration{isWorkingDays ? <span className="text-hint"> · working days</span> : null}
              </span>
              <span className="font-medium text-primary">
                {days > 0 ? `${days} ${days === 1 ? "day" : "days"}` : "—"}
              </span>
            </div>

            {!unlimited && selected && days > 0 && (
              <div className="flex items-center justify-between border-t border-divider pt-3 text-body">
                <span className="text-tertiary">Left after</span>
                <span className={cn("font-medium", insufficient ? "text-danger-text" : "text-primary")}>
                  {formatDayAmount(remainingAfter)} {unit}
                </span>
              </div>
            )}

            {insufficient && (
              <p className="text-hint text-status-pending-icon">
                That is more than is left — it may be rejected, depending on the policy.
              </p>
            )}
          </aside>
        </div>

        {coverageWarning && (
          <div className="border-t border-status-pending-border bg-status-pending-bg px-6 py-4">
            <p className="text-body font-medium text-status-pending-text">
              Your request was submitted.
            </p>
            <p className="mt-1 text-hint text-status-pending-text">
              This policy warns when too many people are away at once, and{" "}
              {coverageWarning.length === 1
                ? "one of your days is"
                : `${coverageWarning.length} of your days are`}{" "}
              already at that limit:{" "}
              {coverageWarning.map((d) => formatDisplayDate(d, { style: "medium" })).join(", ")}.
              Nothing is blocked — your approver
              can see the same thing.
            </p>
          </div>
        )}

        <div className="flex justify-end gap-2 border-t border-divider px-6 py-4">
          {coverageWarning ? (
            <Button type="button" onClick={onCloseAction}>Got it</Button>
          ) : (
            <>
          <Button type="button" variant="secondary" onClick={onCloseAction} disabled={createMutation.isPending}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={!canSubmit}>
            {createMutation.isPending
              ? "Requesting…"
              : days > 0 && unit === "d"
                ? `Request ${formatDayAmount(days)} ${days === 1 ? "day" : "days"}`
                : "Request time off"}
          </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RequestTimeOffModal;
