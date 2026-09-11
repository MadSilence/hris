"use client";

import { dateToISO, formatDisplayDate, isoToDate } from "@/lib/date";

import { formatDayAmount } from "@/models/timeOff/formatDayAmount";
import { FC, useMemo, useState } from "react";
import { CalendarDays, CalendarPlus, Users } from "lucide-react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/public/desact/src/components/ui/dialog";
import { Button } from "@/public/desact/src/components/ui/button";
import { Label } from "@/public/desact/src/components/ui/label";
import { Textarea } from "@/public/desact/src/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/public/desact/src/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/public/desact/src/components/ui/popover";
import { Calendar } from "@/public/desact/src/components/ui/calendar";
import { cn } from "@/public/desact/src/components/ui/utils";

import { useCreateTimeOffRequest } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useCreateTimeOffRequest";
import { useTimeOffRequestDuration } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useTimeOffRequestDuration";
import { useTimeOffOverlaps } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useTimeOffOverlaps";
import { TimeOffPolicyUnit } from "@/api/modules/timeOff/timeOffPolicies/dto";
import { TimeOffPolicyCountingMode } from "@/api/modules/timeOff/timeOffPolicies/dto/TimeOffPolicyCountingMode";
import type { EmployeeTimeOffBalance, TimeOffPolicy } from "@/models/timeOff";
import { RequiredLabel } from "@/components/ui/RequiredLabel";

type Props = {
  isOpen: boolean;
  userId: string;
  balances: EmployeeTimeOffBalance[];
  policyMap: Map<string, TimeOffPolicy>;
  initialStartDate?: string;
  initialEndDate?: string;
  onCloseAction: () => void;
};

const prettyISO = (iso: string) => format(isoToDate(iso), "MMM d, yyyy");

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
      <DialogContent hideClose className="max-w-3xl overflow-hidden p-0">
        <DialogHeader className="border-b border-brown-100 bg-brown-50/40 px-6 py-5 text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brown-200 bg-white text-brown-600">
              <CalendarPlus className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg">Request time off</DialogTitle>
              <DialogDescription>Pick a policy and your dates — it goes to your approver.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-6 px-6 py-5 md:grid-cols-[1fr_260px]">
          {/* Form */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <RequiredLabel className="text-xs" required>Policy</RequiredLabel>
              <Select value={assignmentId} onValueChange={setAssignmentId} disabled={createMutation.isPending}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a policy" />
                </SelectTrigger>
                <SelectContent>
                  {selectable.map((b) => {
                    const p = policyMap.get(b.policyId);
                    const left = p?.unlimitedQuota
                      ? "Unlimited"
                      : `${formatDayAmount(b.currentBalance)} ${p?.unit === TimeOffPolicyUnit.Hours ? "h" : "d"} left`;
                    return (
                      <SelectItem key={b.assignmentId} value={b.assignmentId}>
                        {(p?.displayName ?? "Time off")} · {left}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <RequiredLabel className="text-xs" required>Dates</RequiredLabel>
              <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={createMutation.isPending}
                    className={cn(
                      "w-full justify-start font-normal",
                      !startDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarDays className="h-4 w-4" />
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
              <Label htmlFor="req-reason" className="text-xs">
                Reason
              </Label>
              <Textarea
                id="req-reason"
                value={reason}
                onChange={(e) => setReason(e.currentTarget.value)}
                rows={3}
                disabled={createMutation.isPending}
              />
            </div>

            {days > 0 && overlapPeople.length > 0 && (
              <div className="rounded-lg border border-brown-200 bg-brown-50/40 p-3">
                <p className="flex items-center gap-1.5 text-xs font-medium text-brown-900">
                  <Users className="h-3.5 w-3.5" />
                  {overlapPeople.length === 1
                    ? "1 colleague is already away then"
                    : `${overlapPeople.length} colleagues are already away then`}
                </p>
                <ul className="mt-2 space-y-1">
                  {overlapPeople.slice(0, 5).map((p) => (
                    <li key={p.name} className="flex items-center justify-between gap-3 text-xs">
                      <span className="truncate text-brown-900">{p.name}</span>
                      <span className="shrink-0 text-muted-foreground">
                        {p.start === p.end ? prettyISO(p.start) : `${prettyISO(p.start)} – ${prettyISO(p.end)}`}
                      </span>
                    </li>
                  ))}
                </ul>
                {overlapPeople.length > 5 && (
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    and {overlapPeople.length - 5} more
                  </p>
                )}
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          {/* Summary */}
          <aside className="flex flex-col gap-3 rounded-xl border border-brown-200 bg-brown-50/40 p-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-brown-400">Policy</p>
              <p className="mt-0.5 truncate text-sm font-medium text-brown-900">
                {policy?.displayName}
              </p>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Available</span>
              <span className="font-medium text-brown-900">
                {selected ? (unlimited ? "Unlimited" : `${formatDayAmount(selected.currentBalance)} ${unit}`) : ""}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Duration{isWorkingDays ? <span className="text-xs"> · working days</span> : null}
              </span>
              <span className="font-medium text-brown-900">
                {days > 0 ? `${days} ${days === 1 ? "day" : "days"}` : ""}
              </span>
            </div>

            {!unlimited && selected && days > 0 && (
              <div className="flex items-center justify-between border-t border-brown-200 pt-3 text-sm">
                <span className="text-muted-foreground">Balance after</span>
                <span className={cn("font-medium", insufficient ? "text-red-600" : "text-brown-900")}>
                  {formatDayAmount(remainingAfter)} {unit}
                </span>
              </div>
            )}

            {insufficient ? (
              <p className="text-xs text-amber-600">
                Exceeds the available balance — it may be rejected depending on the policy.
              </p>
            ) : (
              <p className="mt-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" />
                Tip: click or drag days on the calendar to preset dates.
              </p>
            )}
          </aside>
        </div>

        {coverageWarning && (
          <div className="border-t border-amber-200 bg-amber-50 px-6 py-4">
            <p className="text-sm font-medium text-amber-900">
              Your request was submitted.
            </p>
            <p className="mt-1 text-xs text-amber-800">
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

        <div className="flex justify-end gap-2 border-t border-brown-100 px-6 py-4">
          {coverageWarning ? (
            <Button onClick={onCloseAction}>Got it</Button>
          ) : (
            <>
          <Button variant="outline" onClick={onCloseAction} disabled={createMutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {createMutation.isPending ? "Submitting…" : "Submit request"}
          </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RequestTimeOffModal;
