"use client";

import React, { Fragment } from "react";
import Link from "next/link";
import { ChevronLeft, UserRound } from "lucide-react";
import { Button } from "@/public/desact/src/components/ui/button";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/public/desact/src/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/public/desact/src/components/ui/avatar";
import { AccessDenied } from "@/components/auth/AccessDenied";
import { ForbiddenError } from "@/components/clients/exceptions";
import { ErrorState } from "@/components/feedback/ErrorState";
import { formatDisplayDate } from "@/lib/date";
import { formatMinutes, type AttendanceLogDay, type AttendanceTotals } from "@/models/attendance";
import { useAttendanceCapabilities, useAttendanceLog } from "@/components/modules/attendance/hooks";
import { WorkSchedulePanel } from "@/components/modules/attendance/schedule";
import { PeriodControl } from "@/components/modules/attendance/overview/PeriodControl";
import { useAttendanceView } from "@/components/modules/attendance/overview";

type Props = { userId: string };

/** Why a day is what it is — the note column, and the export's. Missing first: it is what the page is opened for. */
export const dayNote = (day: AttendanceLogDay): { text: string; tone: "missing" | "plain" } | null => {
  if (day.missing) return { text: "Missing", tone: "missing" };
  if (!day.employed) return day.loggedMinutes > 0 ? { text: "Outside employment", tone: "plain" } : null;
  if (day.holiday) return { text: `Public holiday: ${day.holiday}`, tone: "plain" };
  if (day.onLeave) return { text: "On leave", tone: "plain" };
  if (!day.workingDay) return { text: "Not a working day", tone: "plain" };
  if (day.overtimeMinutes > 0) return { text: `Overtime ${formatMinutes(day.overtimeMinutes)}`, tone: "plain" };
  return null;
};

/** Every expected day, so a gap shows; a day off only when something was logged on it. */
export const daysShown = (days: AttendanceLogDay[]): AttendanceLogDay[] =>
  days.filter((day) => day.expected || day.loggedMinutes > 0);

const TOTALS: { key: keyof AttendanceTotals; label: string; minutes: boolean }[] = [
  { key: "expectedDays", label: "Expected Days", minutes: false },
  { key: "loggedDays", label: "Logged Days", minutes: false },
  { key: "expectedMinutes", label: "Expected Hours", minutes: true },
  { key: "loggedMinutes", label: "Logged Hours", minutes: true },
  { key: "overtimeMinutes", label: "Overtime Hours", minutes: true },
];

const COLUMNS = 6;

/**
 * One person's log for a period (ATTENDANCE_REBUILD_PLAN batch 4) — opened from a row of the
 * overview, read-only. Every expected day is listed and a missing one is marked; several spans on a day
 * are several lines under one date. Logging happens on the person's own profile, nowhere else.
 */
export const AttendancePersonContainer: React.FC<Props> = ({ userId }) => {
  const { view, setMonth, setRange } = useAttendanceView();
  const log = useAttendanceLog(userId, view.period);
  const capabilities = useAttendanceCapabilities(userId);

  if (log.error instanceof ForbiddenError) return <AccessDenied/>;

  const person = log.data?.person;
  const name = person ? `${person.firstName ?? ""} ${person.lastName ?? ""}`.trim() : "";
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const backHref = `/attendance${view.search ? `?${view.search}` : ""}`;
  const days = log.data ? daysShown(log.data.days) : [];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href={backHref}
            aria-label="Back to Attendance"
            className="no-underline grid h-10 w-10 place-items-center rounded-full border bg-white hover:bg-brown-50 active:translate-y-px"
          >
            <ChevronLeft className="h-4 w-4"/>
          </Link>
          {person ? (
            <>
              <Avatar className="h-10 w-10">
                {person.avatarUrl ? <AvatarImage src={person.avatarUrl} alt={name}/> : null}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <h1 className="text-3xl font-semibold">{name}</h1>
            </>
          ) : (
            <Skeleton className="h-9 w-64"/>
          )}
        </div>
        <div className="flex items-center gap-3">
          <PeriodControl month={view.month} range={view.range} onMonthChange={setMonth} onRangeChange={setRange}/>
          <Button asChild variant="outline">
            <Link href={`/organization/people/${userId}/attendance`} className="no-underline">
              <UserRound className="h-4 w-4"/>
              Open Profile
            </Link>
          </Button>
        </div>
      </header>

      {log.error ? (
        <ErrorState error={log.error} onRetry={() => void log.refetch()}/>
      ) : (
        <>
          <dl className="flex flex-wrap gap-x-10 gap-y-3" aria-label="Period totals">
            {TOTALS.map((total) => (
              <div key={total.key}>
                <dt className="text-xs text-muted-foreground">{total.label}</dt>
                <dd className="mt-0.5 text-lg font-semibold tabular-nums text-brown-900">
                  {log.data
                    ? total.minutes ? formatMinutes(log.data.totals[total.key]) : log.data.totals[total.key]
                    : <Skeleton className="h-6 w-12"/>}
                </dd>
              </div>
            ))}
          </dl>

          <div className="rounded-lg border border-brown-200 bg-white">
            <Table className="table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-40">Date</TableHead>
                  <TableHead className="w-20">From</TableHead>
                  <TableHead className="w-20">To</TableHead>
                  <TableHead className="w-20 text-right">Hours</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-56">Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {log.isLoading
                  ? Array.from({ length: 8 }, (_, index) => (
                    <TableRow key={index}>
                      {Array.from({ length: COLUMNS }, (__, cell) => (
                        <TableCell key={cell}><Skeleton className="h-4 w-16"/></TableCell>
                      ))}
                    </TableRow>
                  ))
                  : days.length === 0
                    ? (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={COLUMNS} className="py-10 text-center text-sm text-muted-foreground">
                          Nothing was expected and nothing was logged in this period.
                        </TableCell>
                      </TableRow>
                    )
                    : days.map((day) => {
                      const note = dayNote(day);
                      const noteCell = (
                        <TableCell className={note?.tone === "missing" ? "font-medium text-danger-700" : "text-muted-foreground"}>
                          {note?.text ?? ""}
                        </TableCell>
                      );
                      const dateCell = (
                        <TableCell className="whitespace-nowrap">{formatDisplayDate(day.date, { style: "medium" })}</TableCell>
                      );
                      if (day.entries.length === 0) {
                        return (
                          <TableRow key={day.date} className="hover:bg-transparent">
                            {dateCell}
                            <TableCell/>
                            <TableCell/>
                            <TableCell/>
                            <TableCell/>
                            {noteCell}
                          </TableRow>
                        );
                      }
                      return (
                        <Fragment key={day.date}>
                          {day.entries.map((entry, index) => (
                            <TableRow key={entry.id} className="hover:bg-transparent">
                              {index === 0 ? dateCell : <TableCell/>}
                              <TableCell className="tabular-nums">{entry.startTime}</TableCell>
                              <TableCell className="tabular-nums">{entry.endTime}</TableCell>
                              <TableCell className="text-right tabular-nums">{formatMinutes(entry.minutes)}</TableCell>
                              <TableCell className="truncate" title={entry.description ?? undefined}>{entry.description ?? ""}</TableCell>
                              {index === 0 ? noteCell : <TableCell/>}
                            </TableRow>
                          ))}
                        </Fragment>
                      );
                    })}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {capabilities.data?.canViewSchedule && (
        <WorkSchedulePanel userId={userId} today={log.data?.today} canEdit={capabilities.data.canEditSchedule}/>
      )}
    </div>
  );
};
