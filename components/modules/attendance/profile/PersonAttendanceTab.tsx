"use client";

import { FC, useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { Delete02Icon, InformationCircleIcon, MagicWand01Icon, PencilEdit02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

import { Button } from "@/components/desact/button";
import { Card } from "@/components/desact/card";
import { Label } from "@/components/desact/label";
import { Textarea } from "@/components/desact/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/desact/table";
import { TimePicker } from "@/components/ui/TimePicker";
import { RowAction, RowActionDestructive, RowActionsMenu } from "@/components/ui/RowActionsMenu";
import { ConfirmActionModal } from "@/components/ui/ConfirmActionModal";
import { ErrorState } from "@/components/feedback/ErrorState";
import { FormError } from "@/components/feedback/FormError";
import { UserCalendarContainer } from "@/components/modules/calendar/components/UserCalendarContainer/UserCalendarContainer";
import { expandSpanToDays } from "@/components/modules/calendar/lib/dateRange";
import { TimeOffRequestStatus } from "@/api/modules/timeOff/timeOffRequests/dto";
import { dateToISO, useDateFormatter } from "@/lib/date";
import { messageForError } from "@/lib/errors/errorMessages";
import { showSuccess } from "@/lib/errors/errorToast";
import { formatMinutes, type AttendanceEntry, type AttendanceLogDay } from "@/models/attendance";
import {
  AttendanceActionError,
  useAmendAttendance,
  useAttendanceCapabilities,
  useAttendanceLog,
  useLogAttendance,
  useRemoveAttendance,
} from "@/components/modules/attendance/hooks";
import { monthOf, monthPeriod, spanMinutes } from "@/components/modules/attendance/lib";

type Props = { userId: string };
type Draft = { from: string; to: string; description: string };

const EMPTY: Draft = { from: "", to: "", description: "" };
type AttendanceTranslator = ReturnType<typeof useTranslations<"attendance">>;
const noSubscribe = () => () => {};

/**
 * What the form says before a span is logged beyond a day's norm (the owner, 2026-09-28): a weekend,
 * a holiday, a day of leave or a day outside employment has no norm, so every minute on it is
 * overtime; on any other day, what goes above the norm is. Nothing is refused — the person is told.
 */
export const beyondNormNotice = (
  days: AttendanceLogDay[],
  minutes: number | null,
  t: AttendanceTranslator,
): string | null => {
  if (days.length === 0) return null;
  const withoutNorm = days.filter((day) => day.normMinutes === 0);
  const over = minutes === null
    ? []
    : days.filter((day) => day.normMinutes > 0 && day.loggedMinutes + minutes > day.normMinutes);

  const parts: string[] = [];
  if (withoutNorm.length === 1 && days.length === 1) {
    const day = withoutNorm[0];
    parts.push(
      day.holiday ? t("log.notice.holiday", { name: day.holiday })
        : day.onLeave ? t("log.notice.leave")
          : !day.employed ? t("log.notice.outsideEmployment") : t("log.notice.notWorkingDay"),
    );
  } else if (withoutNorm.length > 0) {
    parts.push(t("log.notice.daysWithoutNorm", { count: withoutNorm.length }));
  }
  if (over.length === 1 && days.length === 1) {
    const day = over[0];
    parts.push(t("log.notice.beyondNorm", {
      norm: formatMinutes(day.normMinutes),
      overtime: formatMinutes(day.loggedMinutes + minutes! - day.normMinutes),
    }));
  } else if (over.length > 0) {
    parts.push(t("log.notice.daysBeyondNorm", { count: over.length }));
  }
  return parts.length ? parts.join(" ") : null;
};

/**
 * Hours as the calendar marks them — a day's under its number, and the month's total beneath. Inside the
 * picked range the chip turns white, so it still reads on the band.
 */
const HoursBadge: FC<{ minutes: number; onBand?: boolean }> = ({ minutes, onBand = false }) => (
  <span className={`rounded-tag px-2 py-1 text-hint font-medium tabular-nums text-secondary ${onBand ? "bg-card" : "bg-mist/70"}`}>
    {formatMinutes(minutes)}
  </span>
);

/**
 * The person's Attendance tab (technical_documentation/ATTENDANCE.md § 8): their month on the left, the form on
 * the right, the picked days' entries underneath.
 *
 * **Only the person logs their own time** (the owner, 2026-09-28) — on their own profile, or somebody
 * impersonating them. On anybody else's profile the tab reads and nothing more; the server refuses a
 * write regardless (`canLog` is its answer, not a guess).
 *
 * A span is `From`–`To` on one day, several a day, none overlapping. Dragging across the calendar
 * writes the same span to each picked day, weekends and leave included — the form says when that goes
 * beyond a day's norm rather than skipping the day.
 */
/** A duration as a button or a total says it: "3 h", "1 h 30 m", "45 m". */
export const formatDuration = (minutes: number, t: AttendanceTranslator): string => {
  const whole = Math.max(0, Math.round(minutes));
  const h = Math.floor(whole / 60);
  const m = whole % 60;
  if (h === 0) return t("log.duration.minutes", { m });
  return m === 0 ? t("log.duration.hours", { h }) : t("log.duration.hoursMinutes", { h, m });
};

export const PersonAttendanceTab: FC<Props> = ({ userId }) => {
  const formatDisplayDate = useDateFormatter();
  const t = useTranslations("attendance");
  const tCommon = useTranslations("common");
  const todayISO = useMemo(() => dateToISO(new Date()), []);
  const [month, setMonth] = useState(monthOf(todayISO));
  const [range, setRange] = useState<{ start: string; end: string }>({ start: todayISO, end: todayISO });
  const [draft, setDraft] = useState<Draft>(EMPTY);
  /** The last span logged — offered on the next picked day as placeholders, confirmed by Quick Fill. */
  const [lastFilled, setLastFilled] = useState<Draft | null>(null);
  const [editing, setEditing] = useState<AttendanceEntry | null>(null);
  const [removing, setRemoving] = useState<AttendanceEntry | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const period = useMemo(() => monthPeriod(month, todayISO), [month, todayISO]);
  const log = useAttendanceLog(userId, period);
  const capabilities = useAttendanceCapabilities(userId);
  const logSpan = useLogAttendance();
  const amend = useAmendAttendance();
  const remove = useRemoveAttendance();

  const canLog = Boolean(capabilities.data?.canLog);
  const busy = logSpan.isPending || amend.isPending;
  const onMonthChange = useCallback((next: string) => setMonth(next), []);

  const byDate = useMemo(
    () => new Map((log.data?.days ?? []).map((day) => [day.date, day])),
    [log.data],
  );
  const pickedDates = useMemo(() => expandSpanToDays(range.start, range.end), [range]);
  const pickedDays = pickedDates.map((iso) => byDate.get(iso)).filter((d): d is AttendanceLogDay => Boolean(d));
  const pickedEntries = pickedDays.flatMap((day) => day.entries);
  const single = pickedDates.length === 1;

  // The span's date is drawn in the browser only: `formatDisplayDate` follows the reader's own format
  // there and the defaults on the server, so a server-rendered date failed to hydrate.
  const inBrowser = useSyncExternalStore(noSubscribe, () => true, () => false);

  const minutes = spanMinutes(draft.from, draft.to);
  // What the button promises: the span on every picked day (one day when amending).
  const totalMinutes = minutes === null ? null : minutes * (editing ? 1 : pickedDates.length);
  const suggestion = !editing && draft.from === "" && draft.to === "" && draft.description === "" ? lastFilled : null;
  // Amending replaces the span's own minutes, so it must not be counted twice against the day.
  const noticeDays = editing
    ? pickedDays.map((day) => ({ ...day, loggedMinutes: day.loggedMinutes - editing.minutes }))
    : pickedDays;
  const notice = canLog ? beyondNormNotice(noticeDays, minutes, t) : null;

  const pick = (start: string, end: string) => {
    setRange({ start, end });
    setEditing(null);
    setDraft(EMPTY);
    setFormError(null);
  };

  const refusal = (caught: unknown) =>
    caught instanceof AttendanceActionError ? caught.result.errorMessage ?? messageForError(caught) : messageForError(caught);

  const submit = async () => {
    if (minutes === null) {
      setFormError(t("log.invalidSpan"));
      return;
    }
    setFormError(null);
    try {
      if (editing) {
        await amend.mutateAsync({
          userId,
          entryId: editing.id,
          body: { startTime: draft.from, endTime: draft.to, description: draft.description },
        });
        showSuccess(t("log.updated"));
      } else {
        await logSpan.mutateAsync({
          userId,
          body: { dates: pickedDates, startTime: draft.from, endTime: draft.to, description: draft.description },
        });
        showSuccess(single ? t("log.logged") : t("log.loggedOnDays", { count: pickedDates.length }));
        setLastFilled(draft);
      }
      setEditing(null);
      setDraft(EMPTY);
    } catch (caught) {
      setFormError(refusal(caught));
    }
  };

  const startEditing = (entry: AttendanceEntry) => {
    setRange({ start: entry.workDate, end: entry.workDate });
    setEditing(entry);
    setDraft({ from: entry.startTime, to: entry.endTime, description: entry.description ?? "" });
    setFormError(null);
  };

  const rangeLabel = !inBrowser ? null : single
    ? formatDisplayDate(range.start, { style: "medium" })
    : `${formatDisplayDate(range.start, { style: "medium" })} – ${formatDisplayDate(range.end, { style: "medium" })}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-6 xl:flex-row">
        <div className={canLog ? "min-w-0 xl:flex-1" : "min-w-0 flex-1"}>
          <UserCalendarContainer
            userId={userId}
            variant="compact"
            // Approved only: pending leave has not taken the day yet.
            timeOffStatuses={[TimeOffRequestStatus.Approved]}
            selectedRange={range}
            onSelectRange={pick}
            onMonthChange={onMonthChange}
            toolbar="split"
            renderDay={(day) => {
              const logged = byDate.get(day.iso)?.loggedMinutes ?? 0;
              const onBand = day.iso >= range.start && day.iso <= range.end;
              return logged > 0 ? <div className="flex justify-center pt-2"><HoursBadge minutes={logged} onBand={onBand}/></div> : null;
            }}
            footer={() => (
              <div className="flex items-center justify-end gap-2 text-body text-tertiary">
                <span>{t("log.total")}</span>
                <HoursBadge minutes={log.data?.totals.loggedMinutes ?? 0}/>
              </div>
            )}
          />
        </div>

        {canLog && (
          <Card className="min-h-0 gap-4 border-divider p-6 xl:w-80 xl:shrink-0">
            <div className="space-y-1">
              <h3 className="text-card-title text-primary">{editing ? t("log.editTitle") : t("log.logTitle")}</h3>
              <p className="flex min-h-5 items-center gap-2 text-body text-secondary">
                {rangeLabel}
                {!single && (
                  <span className="rounded-pill bg-mist px-2 text-hint font-semibold text-secondary">
                    {tCommon("time.days", { count: pickedDates.length })}
                  </span>
                )}
              </p>
              {!editing && <p className="text-hint text-tertiary">{t("log.pickHint")}</p>}
            </div>

            <form
              noValidate
              className="flex flex-col gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                void submit();
              }}
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="attendance-from">{t("person.from")}</Label>
                  <TimePicker
                    id="attendance-from"
                    value={draft.from}
                    placeholder={suggestion?.from}
                    onChange={(from) => setDraft((d) => ({ ...d, from }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="attendance-to">{t("person.to")}</Label>
                  <TimePicker
                    id="attendance-to"
                    value={draft.to}
                    placeholder={suggestion?.to}
                    onChange={(to) => setDraft((d) => ({ ...d, to }))}
                  />
                </div>
              </div>

              {minutes !== null && (
                <p className="text-hint tabular-nums text-tertiary">
                  {single || editing
                    ? t("log.inTotal", { duration: formatDuration(minutes, t) })
                    : t("log.perDay", { perDay: formatDuration(minutes, t), total: formatDuration(totalMinutes ?? 0, t) })}
                </p>
              )}

              <div className="space-y-2">
                <Label htmlFor="attendance-description">
                  {t("log.note")} <span className="font-normal text-tertiary">{t("log.optional")}</span>
                </Label>
                <Textarea
                  id="attendance-description"
                  rows={3}
                  value={draft.description}
                  placeholder={suggestion?.description || t("log.notePlaceholder")}
                  onChange={(event) => setDraft((d) => ({ ...d, description: event.target.value }))}
                />
              </div>

              {suggestion && (
                <Button type="button" variant="secondary" size="sm" className="w-full" onClick={() => setDraft(suggestion)}>
                  <Icon icon={MagicWand01Icon} size="sm" />
                  {t("log.quickFill")}
                </Button>
              )}

              {notice && (
                <p className="flex items-start gap-2 rounded-control bg-status-pending-bg px-3 py-2 text-body text-status-pending-text" role="status">
                  <Icon icon={InformationCircleIcon} size="sm" className="mt-0.5 shrink-0" />
                  <span>{notice}</span>
                </p>
              )}

              <FormError message={formError}/>

              <div className="flex gap-2">
                {editing && (
                  <Button type="button" variant="secondary" className="flex-1" onClick={() => { setEditing(null); setDraft(EMPTY); setFormError(null); }}>
                    {tCommon("actions.cancel")}
                  </Button>
                )}
                <Button type="submit" className="flex-1" disabled={busy || minutes === null}>
                  {editing ? tCommon("actions.saveChanges") : totalMinutes !== null ? t("log.logDuration", { duration: formatDuration(totalMinutes, t) }) : t("log.logTitle")}
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>

      {log.error ? (
        <ErrorState error={log.error} compact onRetry={() => void log.refetch()}/>
      ) : (
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              {!single && <TableHead className="w-36">{tCommon("fields.date")}</TableHead>}
              <TableHead className="w-24">{t("person.from")}</TableHead>
              <TableHead className="w-24">{t("person.to")}</TableHead>
              <TableHead className="w-24">{t("person.hours")}</TableHead>
              <TableHead>{t("log.note")}</TableHead>
              {canLog && <TableHead className="w-12"/>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pickedEntries.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="py-6 text-center text-body text-tertiary">
                  {single ? t("log.emptyDay") : t("log.emptyDays")}
                </TableCell>
              </TableRow>
            ) : pickedEntries.map((entry) => (
              <TableRow key={entry.id} className={editing?.id === entry.id ? "bg-accent-subtle" : undefined}>
                {!single && (
                  <TableCell className="whitespace-nowrap">
                    {inBrowser ? formatDisplayDate(entry.workDate, { style: "medium" }) : null}
                  </TableCell>
                )}
                <TableCell className="tabular-nums">{entry.startTime}</TableCell>
                <TableCell className="tabular-nums">{entry.endTime}</TableCell>
                <TableCell className="tabular-nums">{formatMinutes(entry.minutes)}</TableCell>
                <TableCell className="truncate" title={entry.description ?? undefined}>{entry.description ?? ""}</TableCell>
                {canLog && (
                  <TableCell>
                    <RowActionsMenu label={t("log.entryActions")}>
                      <RowAction icon={<Icon icon={PencilEdit02Icon} size="sm" />} onClick={() => startEditing(entry)}>{tCommon("actions.edit")}</RowAction>
                      <RowActionDestructive icon={<Icon icon={Delete02Icon} size="sm" />} onClick={() => setRemoving(entry)}>
                        {tCommon("actions.delete")}
                      </RowActionDestructive>
                    </RowActionsMenu>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <ConfirmActionModal
        isOpen={removing !== null}
        title={t("log.deleteTitle")}
        description={removing
          ? t("log.deleteDescription", {
            span: `${removing.startTime}–${removing.endTime}`,
            hasDescription: removing.description ? "yes" : "no",
            description: removing.description ?? "",
            date: inBrowser ? formatDisplayDate(removing.workDate, { style: "medium" }) : removing.workDate,
          })
          : ""}
        confirmLabel={tCommon("actions.delete")}
        destructive
        isLoading={remove.isPending}
        onCancelAction={() => setRemoving(null)}
        onConfirmAction={async () => {
          if (!removing) return;
          try {
            await remove.mutateAsync({ userId, entryId: removing.id });
            if (editing?.id === removing.id) {
              setEditing(null);
              setDraft(EMPTY);
            }
            setRemoving(null);
            showSuccess(t("log.deleted"));
          } catch (caught) {
            setRemoving(null);
            setFormError(refusal(caught));
          }
        }}
      />
    </div>
  );
};

export default PersonAttendanceTab;
