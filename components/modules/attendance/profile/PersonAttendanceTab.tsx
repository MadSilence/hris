"use client";

import { FC, useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { Info, Pencil, Trash2, Wand2 } from "lucide-react";

import { Button } from "@/public/desact/src/components/ui/button";
import { Card } from "@/public/desact/src/components/ui/card";
import { Label } from "@/public/desact/src/components/ui/label";
import { Textarea } from "@/public/desact/src/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/public/desact/src/components/ui/table";
import { TimePicker } from "@/components/ui/TimePicker";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { RowAction, RowActionDestructive, RowActionsMenu } from "@/components/ui/RowActionsMenu";
import { ConfirmActionModal } from "@/components/ui/ConfirmActionModal";
import { ErrorState } from "@/components/feedback/ErrorState";
import { FormError } from "@/components/feedback/FormError";
import { UserCalendarContainer } from "@/components/modules/calendar/components/UserCalendarContainer/UserCalendarContainer";
import { expandSpanToDays } from "@/components/modules/calendar/lib/dateRange";
import { TimeOffRequestStatus } from "@/api/modules/timeOff/timeOffRequests/dto";
import { dateToISO, formatDisplayDate } from "@/lib/date";
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
const noSubscribe = () => () => {};

/**
 * What the form says before a span is logged beyond a day's norm (the owner, 2026-09-28): a weekend,
 * a holiday, a day of leave or a day outside employment has no norm, so every minute on it is
 * overtime; on any other day, what goes above the norm is. Nothing is refused — the person is told.
 */
export const beyondNormNotice = (days: AttendanceLogDay[], minutes: number | null): string | null => {
  if (days.length === 0) return null;
  const withoutNorm = days.filter((day) => day.normMinutes === 0);
  const over = minutes === null
    ? []
    : days.filter((day) => day.normMinutes > 0 && day.loggedMinutes + minutes > day.normMinutes);

  const parts: string[] = [];
  if (withoutNorm.length === 1 && days.length === 1) {
    const day = withoutNorm[0];
    const why = day.holiday ? `a public holiday (${day.holiday})` : day.onLeave ? "a day of leave"
      : !day.employed ? "outside employment" : "not a working day";
    parts.push(`This day is ${why}: all time logged on it counts as overtime.`);
  } else if (withoutNorm.length > 0) {
    parts.push(`${withoutNorm.length} of the picked days have no norm — a weekend, a holiday or leave: all time logged on them counts as overtime.`);
  }
  if (over.length === 1 && days.length === 1) {
    const day = over[0];
    parts.push(`This takes the day beyond its norm of ${formatMinutes(day.normMinutes)}; ${formatMinutes(day.loggedMinutes + minutes! - day.normMinutes)} counts as overtime.`);
  } else if (over.length > 0) {
    parts.push(`This takes ${over.length} of the picked days beyond their norm; the time above it counts as overtime.`);
  }
  return parts.length ? parts.join(" ") : null;
};

/** Hours as the calendar marks them — a day's under its number, and the month's total beneath. */
const HoursBadge: FC<{ minutes: number }> = ({ minutes }) => (
  <span className="rounded-md bg-brown-100/70 px-2 py-1 text-xs font-medium tabular-nums text-brown-700">
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
export const PersonAttendanceTab: FC<Props> = ({ userId }) => {
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
  const suggestion = !editing && draft.from === "" && draft.to === "" && draft.description === "" ? lastFilled : null;
  // Amending replaces the span's own minutes, so it must not be counted twice against the day.
  const noticeDays = editing
    ? pickedDays.map((day) => ({ ...day, loggedMinutes: day.loggedMinutes - editing.minutes }))
    : pickedDays;
  const notice = canLog ? beyondNormNotice(noticeDays, minutes) : null;

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
      setFormError("Enter a start and an end on the same day, the end later than the start.");
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
        showSuccess("Time updated.");
      } else {
        await logSpan.mutateAsync({
          userId,
          body: { dates: pickedDates, startTime: draft.from, endTime: draft.to, description: draft.description },
        });
        showSuccess(single ? "Time logged." : `Time logged on ${pickedDates.length} days.`);
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
              return logged > 0 ? <div className="flex justify-center pt-2"><HoursBadge minutes={logged}/></div> : null;
            }}
            footer={() => (
              <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
                <span>Total</span>
                <HoursBadge minutes={log.data?.totals.loggedMinutes ?? 0}/>
              </div>
            )}
          />
        </div>

        {canLog && (
          <Card className="min-h-0 gap-4 border-brown-100 p-6 xl:w-80 xl:shrink-0">
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-foreground">{editing ? "Edit Time" : "Log Hours"}</h3>
              <p className="min-h-5 text-sm text-muted-foreground">{rangeLabel}</p>
            </div>

            {!editing && (
              <p className="text-sm text-muted-foreground">
                Drag across the calendar to pick more than one day — the times below are logged on each of them.
              </p>
            )}

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
                  <RequiredLabel htmlFor="attendance-from" required>From</RequiredLabel>
                  <TimePicker
                    id="attendance-from"
                    value={draft.from}
                    placeholder={suggestion?.from}
                    onChange={(from) => setDraft((d) => ({ ...d, from }))}
                  />
                </div>
                <div className="space-y-2">
                  <RequiredLabel htmlFor="attendance-to" required>To</RequiredLabel>
                  <TimePicker
                    id="attendance-to"
                    value={draft.to}
                    placeholder={suggestion?.to}
                    onChange={(to) => setDraft((d) => ({ ...d, to }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="attendance-description">Description</Label>
                <Textarea
                  id="attendance-description"
                  rows={3}
                  value={draft.description}
                  placeholder={suggestion?.description || undefined}
                  onChange={(event) => setDraft((d) => ({ ...d, description: event.target.value }))}
                />
              </div>

              {suggestion && (
                <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => setDraft(suggestion)}>
                  <Wand2 className="h-4 w-4"/>
                  Quick Fill
                </Button>
              )}

              {notice && (
                <p className="flex items-start gap-2 rounded-md bg-warning-50 px-3 py-2 text-sm text-warning-800" role="status">
                  <Info className="mt-0.5 h-4 w-4 shrink-0"/>
                  <span>{notice}</span>
                </p>
              )}

              <FormError message={formError}/>

              <div className="flex gap-2">
                {editing && (
                  <Button type="button" variant="outline" className="flex-1" onClick={() => { setEditing(null); setDraft(EMPTY); setFormError(null); }}>
                    Cancel
                  </Button>
                )}
                <Button type="submit" className="flex-1" disabled={busy || minutes === null}>
                  {editing ? "Save Changes" : "Log Hours"}
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
              {!single && <TableHead className="w-36">Date</TableHead>}
              <TableHead className="w-24">From</TableHead>
              <TableHead className="w-24">To</TableHead>
              <TableHead className="w-24">Hours</TableHead>
              <TableHead>Description</TableHead>
              {canLog && <TableHead className="w-12"/>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pickedEntries.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="py-6 text-center text-sm text-muted-foreground">
                  {single ? "Nothing logged on this day." : "Nothing logged on these days."}
                </TableCell>
              </TableRow>
            ) : pickedEntries.map((entry) => (
              <TableRow key={entry.id} className={editing?.id === entry.id ? "bg-brown-50" : undefined}>
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
                    <RowActionsMenu label="Entry Actions">
                      <RowAction icon={<Pencil className="h-4 w-4"/>} onClick={() => startEditing(entry)}>Edit</RowAction>
                      <RowActionDestructive icon={<Trash2 className="h-4 w-4"/>} onClick={() => setRemoving(entry)}>
                        Delete
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
        title="Delete Entry"
        description={removing
          ? `${removing.startTime}–${removing.endTime}${removing.description ? ` · ${removing.description}` : ""} will be removed from ${inBrowser ? formatDisplayDate(removing.workDate, { style: "medium" }) : removing.workDate}.`
          : ""}
        confirmLabel="Delete"
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
            showSuccess("Entry deleted.");
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
