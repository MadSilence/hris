"use client";

import { dateToISO, isoToDate, useDateFormatter } from "@/lib/date";
import { formatDayAmount } from "@/models/timeOff/formatDayAmount";
import { useShortDates } from "@/lib/date";
import { FC, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/desact/dialog";
import { Button } from "@/components/desact/button";
import { Label } from "@/components/desact/label";
import { Textarea } from "@/components/desact/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/desact/avatar";
import { FieldError } from "@/components/desact/field-error";
import { Skeleton } from "@/components/desact/skeleton";
import { FormError } from "@/components/feedback/FormError";
import { InlineAlert } from "@/components/desact/alert";
import { InformationCircleIcon } from "@hugeicons/core-free-icons";
import { PolicyMarker } from "@/components/ui/PolicyMarker";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { showSuccess } from "@/lib/errors/errorToast";
import { useCompanyData } from "@/components/providers/CompanyDataProvider/CompanyDataProvider";

import { useEditTimeOffRequest } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useEditTimeOffRequest";
import { useCreateTimeOffRequest } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useCreateTimeOffRequest";
import { useTimeOffRequestDuration } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useTimeOffRequestDuration";
import { useTimeOffApproverPreview } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useTimeOffApproverPreview";
import { TimeOffPolicyCountingMode } from "@/api/modules/timeOff/timeOffPolicies/dto";
import { LeaveTypeCategory } from "@/api/modules/timeOff/leaveTypes/dto";
import type { EmployeeTimeOffBalance, TimeOffPolicy, TimeOffRequest } from "@/models/timeOff";
import { useUserPublicHolidays } from "@/components/modules/calendar/hooks/useUserPublicHolidays";
import { expandSpanToDays, nonWorkingDayTest } from "@/components/modules/calendar/lib/dateRange";
import { LeaveBalanceRow } from "@/components/modules/timeOff/LeaveBalanceRow";
import { LeaveMonthGrid } from "@/components/modules/timeOff/LeaveMonthGrid";
import { balanceUnit, lengthOf, unitOf } from "@/components/modules/timeOff/lib/leaveWords";

type Props = {
  isOpen: boolean;
  userId: string;
  balances: EmployeeTimeOffBalance[];
  policyMap: Map<string, TimeOffPolicy>;
  initialStartDate?: string;
  initialEndDate?: string;
  /** Whose leave this is, when it is not the reader's own — the title names them. */
  forName?: string;
  /** "Edit dates" on one's own waiting request (AQ16a): the window filled in with it, saved as an edit. */
  editing?: TimeOffRequest;
  onCloseAction: () => void;
};

/**
 * **The request window** (profile-time-off Q13–Q17, approved by the owner 2026-11-20; it replaced the 800 dialog of
 * 2026-11-04): 520 wide, radius 24. The policy; a month to pick the days on — the first click the start, the second
 * the end; the balance row ("−3 working days" · "15 / days left after", red when short and still sendable, "No
 * limit", or "Pick the days on the calendar" before anything is picked); the note; who it goes to; Cancel and
 * **Request 3 days**, never disabled — pressing it with nothing picked says so under the month.
 *
 * The count is the server's alone (W9): until it answers, the row's figures shimmer and the button says "Request time
 * off" — no calendar-day guess that then changes under the reader. Opened on one's own waiting request (`editing`,
 * W13) it is titled "Edit dates" and its button reads "Save".
 *
 * Not in it, as drawn: no "now" figure, no repeated dates, no "also off". Splitting a request across years and
 * counting in weeks wait on AQ-14; the coverage warning after sending stays as it was.
 */
export const RequestTimeOffModal: FC<Props> = ({
  isOpen,
  userId,
  balances,
  policyMap,
  initialStartDate,
  initialEndDate,
  forName,
  editing,
  onCloseAction,
}) => {
  const t = useTranslations("leave");
  const tCalendar = useTranslations("calendar");
  const tCommon = useTranslations("common");
  const formatDisplayDate = useDateFormatter();
  const createMutation = useCreateTimeOffRequest();
  const editMutation = useEditTimeOffRequest();
  const sending = createMutation.isPending || editMutation.isPending;
  const shortDates = useShortDates();
  const { company } = useCompanyData();
  const isNonWorking = useMemo(() => nonWorkingDayTest(company?.workingDays), [company?.workingDays]);
  const { data: holidayRows } = useUserPublicHolidays({ userId });
  const holidays = useMemo(
    () => new Set((holidayRows ?? []).flatMap((h) => expandSpanToDays(h.holidayDate, h.endDate))),
    [holidayRows],
  );

  // Only the periods a request could fall into — one row per assignment, the earliest period not yet over; a
  // VACATION policy first, and so picked by default (the owner, 2026-11-05).
  const selectable = useMemo(() => {
    const today = dateToISO(new Date());
    const open = balances.filter((b) => !b.periodEnd || b.periodEnd >= today);
    const byAssignment = new Map<string, EmployeeTimeOffBalance>();
    for (const b of [...open].sort((a, c) => a.periodStart.localeCompare(c.periodStart))) {
      if (!byAssignment.has(b.assignmentId)) byAssignment.set(b.assignmentId, b);
    }
    const isVacation = (b: EmployeeTimeOffBalance) =>
      policyMap.get(b.policyId)?.leaveTypeCategory === LeaveTypeCategory.Vacation ? 0 : 1;
    return [...byAssignment.values()].sort((a, c) => isVacation(a) - isVacation(c));
  }, [balances, policyMap]);

  const [assignmentId, setAssignmentId] = useState(editing?.assignmentId ?? selectable[0]?.assignmentId ?? "");
  const [startDate, setStartDate] = useState(editing?.startDate ?? initialStartDate ?? "");
  const [endDate, setEndDate] = useState(editing?.endDate ?? initialEndDate ?? initialStartDate ?? "");
  /** The first day is picked and the second is awaited — the band follows the pointer (DATE-RANGE). */
  const [awaitingEnd, setAwaitingEnd] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [cursor, setCursor] = useState(() => {
    const first = editing?.startDate ?? initialStartDate;
    const d = first ? isoToDate(first) : new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [reason, setReason] = useState(editing?.reason ?? "");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ policy?: string; dates?: string }>({});
  /** Set once the request has been filed and the coverage cap wants the person to know. */
  const [coverageWarning, setCoverageWarning] = useState<string[] | null>(null);

  const selected = useMemo(
    () =>
      editing
        ? balances.find((b) => b.id === editing.balanceId) ?? selectable.find((b) => b.assignmentId === assignmentId)
        : selectable.find((b) => b.assignmentId === assignmentId),
    [balances, editing, selectable, assignmentId],
  );
  const policy = selected ? policyMap.get(selected.policyId) : undefined;
  const unlimited = policy?.unlimitedQuota ?? false;

  // One click is a request for that day; the second click makes it a span.
  const pickedEnd = awaitingEnd ? startDate : endDate;
  const picked = Boolean(startDate && pickedEnd);
  const { data: durationPreview, isError: countFailed } = useTimeOffRequestDuration(
    assignmentId || undefined,
    startDate,
    pickedEnd,
  );
  // The server's count, or nothing yet (W9): no client estimate stands in for it.
  const counting = picked && Boolean(selected) && !durationPreview && !countFailed;
  const days = picked ? (durationPreview?.amount ?? 0) : 0;
  const unit = unitOf(policy, durationPreview ? durationPreview.countingMode === TimeOffPolicyCountingMode.WorkingDays : undefined);
  // What a request is checked against: the balance minus what waits for approval (U7). Edited, the request's own
  // reserve comes back first — it is replaced, not added to.
  const available = selected
    ? (selected.availableBalance ?? selected.currentBalance) + (editing?.status === "PENDING" ? editing.requestedAmount : 0)
    : 0;
  const after = available - days;
  // A half-day holiday among the picked days costs half a day (U5, Q13h) — the server says which they are.
  const halfDays = picked ? (durationPreview?.halfDayHolidays ?? []) : [];
  const short = !unlimited && days > 0 && after < 0;

  const { data: approvers } = useTimeOffApproverPreview(assignmentId || undefined);
  const firstApprover = approvers?.deciders[0];
  const moreApprovers = Math.max((approvers?.deciders.length ?? 0) - 1, 0);

  const pickDay = (iso: string) => {
    setFieldErrors((f) => ({ ...f, dates: undefined }));
    // A refusal was about the days it was sent with; left up, "No balance covers these dates" stood under days it
    // had never been asked about (the walk of 2026-11-23).
    setError(null);
    if (!awaitingEnd || !startDate || iso < startDate) {
      setStartDate(iso);
      setEndDate(iso);
      setAwaitingEnd(true);
      return;
    }
    setEndDate(iso);
    setAwaitingEnd(false);
    setHovered(null);
  };

  const shownRange = startDate
    ? awaitingEnd
      ? { start: startDate, end: hovered && hovered > startDate ? hovered : startDate }
      : { start: startDate, end: endDate || startDate }
    : null;

  const step = (by: -1 | 1) =>
    setCursor((c) => {
      const d = new Date(c.year, c.month + by, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  // Never disabled (C2): pressing it with something missing says so under that field.
  const handleSubmit = async () => {
    const missing = {
      policy: assignmentId ? undefined : t("request.pickPolicy"),
      dates: !startDate ? t("request.pickDays") : undefined,
    };
    setFieldErrors(missing);
    if (missing.policy || missing.dates) return;
    setAwaitingEnd(false);
    setError(null);
    if (editing) {
      try {
        await editMutation.mutateAsync({
          requestId: editing.id,
          userId,
          startDate,
          endDate: pickedEnd,
          reason: reason.trim() || null,
        });
        showSuccess(t("request.datesChanged"));
        onCloseAction();
      } catch (e) {
        setError(e instanceof Error ? e.message : t("request.failed"));
      }
      return;
    }
    try {
      const result = await createMutation.mutateAsync({
        assignmentId,
        startDate,
        endDate: pickedEnd,
        reason: reason.trim() || null,
      });
      // A policy set to WARN lets the request through and tells the person the days are thin.
      const warnDays = result.data?.coverageWarningDays ?? [];
      if (warnDays.length > 0) {
        setCoverageWarning(warnDays);
        return;
      }
      showSuccess(firstApprover
        ? t("request.sentTo", { name: firstApprover.name.split(" ")[0] })
        : t("request.sent"));
      onCloseAction();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("request.failed"));
    }
  };

  const balanceRow = (() => {
    const bUnit = balanceUnit(unit);
    if (counting) {
      // Laid out like the figures it stands for: the change on the left, the number and its unit on the right.
      return (
        <div className="flex min-h-17 items-center gap-3 rounded-tint bg-subtle px-4 py-3">
          <Skeleton className="h-5 w-36" />
          <span className="flex-1" />
          {unlimited ? (
            <Skeleton className="h-7 w-20" />
          ) : (
            <span className="flex flex-col items-end gap-1">
              <Skeleton className="h-7 w-10" />
              <Skeleton className="h-3.5 w-24" />
            </span>
          )}
        </div>
      );
    }
    if (selected && picked && countFailed) {
      return (
        <LeaveBalanceRow
          change={<span className="font-normal text-secondary">{t("request.countFailed")}</span>}
          noLimit={unlimited ? t("noLimit") : undefined}
          value={formatDayAmount(available)}
          unit={t("left", { unit: bUnit, count: available })}
        />
      );
    }
    if (!selected || !picked || days <= 0) {
      return (
        <LeaveBalanceRow
          change={<span className="font-normal text-secondary">{t("request.pickDays")}</span>}
          noLimit={unlimited ? t("noLimit") : undefined}
          value={selected ? formatDayAmount(available) : undefined}
          unit={selected ? t("left", { unit: bUnit, count: available }) : undefined}
        />
      );
    }
    return (
      <LeaveBalanceRow
        change={lengthOf(t, days, unit, "−")}
        noLimit={unlimited ? t("noLimit") : undefined}
        short={short}
        value={formatDayAmount(after)}
        unit={short ? t("unitWord", { unit: bUnit, count: Math.abs(after) }) : t("leftAfter", { unit: bUnit, count: after })}
      />
    );
  })();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onCloseAction(); }}>
      <DialogContent
        aria-describedby={undefined}
        className="max-h-[calc(100vh-2rem)] gap-0 overflow-y-auto rounded-leave-dialog p-8 sm:max-w-[520px]"
      >
        <DialogHeader>
          <DialogTitle className="font-heading text-section-title">
            {editing
              ? t("request.editTitle")
              : forName
                ? t("request.titleFor", { name: forName })
                : t("request.title")}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-5">
          {editing ? (
            <p className="flex h-9 items-center gap-2 text-body font-medium text-primary">
              <PolicyMarker color={policy?.color} />
              <span className="truncate">{policy?.name ?? tCalendar("balances.fallbackName")}</span>
            </p>
          ) : (
          <SearchableSelect
            options={selectable.map((b) => {
              const p = policyMap.get(b.policyId);
              return {
                value: b.assignmentId,
                label: p?.name ?? tCalendar("balances.fallbackName"),
                icon: <PolicyMarker color={p?.color} />,
              };
            })}
            value={assignmentId || null}
            onChange={(v) => {
              setAssignmentId(v ?? "");
              setFieldErrors((f) => ({ ...f, policy: undefined }));
              setError(null);
            }}
            placeholder={t("request.selectPolicy")}
            disabled={sending}
            clearable={false}
          />
          )}
          <FieldError>{fieldErrors.policy}</FieldError>
        </div>

        <div className="mt-4">
          <LeaveMonthGrid
            year={cursor.year}
            month={cursor.month}
            range={shownRange}
            preview={awaitingEnd && Boolean(hovered && startDate && hovered > startDate)}
            holidays={holidays}
            isNonWorking={isNonWorking}
            onStep={step}
            onDayClick={sending ? undefined : pickDay}
            onDayHover={awaitingEnd ? setHovered : undefined}
          />
          <FieldError>{fieldErrors.dates}</FieldError>
        </div>

        <div className="mt-3">{balanceRow}</div>
        {halfDays.length > 0 ? (
          <InlineAlert tone="pending" icon={InformationCircleIcon} className="mt-2">
            {t("request.halfDayHoliday", {
              count: halfDays.length,
              dates: halfDays.map((d) => shortDates.date(d, { hideYear: true })).join(", "),
            })}
          </InlineAlert>
        ) : null}

        <div className="mt-4">
          <Label htmlFor="req-reason" className="mb-1.5 gap-1.5 text-label font-medium text-secondary">
            {t("request.note")}
            {" "}<span className="font-normal text-tertiary">{t("request.optional")}</span>
          </Label>
          <Textarea
            id="req-reason"
            className="min-h-14"
            placeholder={t("request.notePlaceholder")}
            value={reason}
            onChange={(e) => setReason(e.currentTarget.value)}
            rows={2}
            disabled={sending}
          />
        </div>

        {error ? <FormError message={error} className="mt-4" /> : null}

        {coverageWarning && (
          <div className="mt-4 rounded-tint bg-status-pending-bg px-4 py-3">
            <p className="text-body font-medium text-status-pending-text">{tCalendar("request.coverage.submitted")}</p>
            <p className="mt-1 text-hint text-status-pending-text">
              {tCalendar("request.coverage.warning", {
                count: coverageWarning.length,
                days: coverageWarning.map((d) => formatDisplayDate(d, { style: "medium" })).join(", "),
              })}
            </p>
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-2">
          {/* Who decides (C7): the first, and "+N"; no line when nobody resolves. */}
          {firstApprover && !coverageWarning && (
            <p className="mr-auto flex min-w-0 items-center gap-2 text-label font-normal text-secondary">
              <Avatar className="size-5">
                {firstApprover.avatarUrl ? <AvatarImage src={firstApprover.avatarUrl} alt="" /> : null}
                <AvatarFallback name={firstApprover.name}>{firstApprover.name.slice(0, 1)}</AvatarFallback>
              </Avatar>
              <span className="truncate">
                {t.rich(moreApprovers > 0 ? "request.goesToMore" : "request.goesTo", {
                  name: firstApprover.name,
                  count: moreApprovers,
                  b: (chunks) => <span className="font-medium text-primary">{chunks}</span>,
                })}
              </span>
            </p>
          )}
          {coverageWarning ? (
            <Button type="button" onClick={onCloseAction}>{tCalendar("request.gotIt")}</Button>
          ) : (
            <>
              <Button type="button" variant="ghost" onClick={onCloseAction} disabled={sending}>
                {tCommon("actions.cancel")}
              </Button>
              <Button type="button" onClick={handleSubmit} loading={sending}>
                {editing
                  ? sending
                    ? tCommon("actions.saving")
                    : tCommon("actions.save")
                  : sending
                  ? t("request.sending")
                  : days > 0
                    ? t("request.submit", { unit: balanceUnit(unit), count: days, amount: formatDayAmount(days) })
                    : t("request.title")}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RequestTimeOffModal;
