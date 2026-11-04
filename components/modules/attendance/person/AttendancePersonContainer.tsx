"use client";

import React, { Fragment } from "react";
import Link from "next/link";
import { ArrowLeft01Icon, UserIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { Skeleton } from "@/components/desact/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/desact/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/desact/avatar";
import { AccessDenied } from "@/components/auth/AccessDenied";
import { ForbiddenError } from "@/components/clients/exceptions";
import { ErrorState } from "@/components/feedback/ErrorState";
import { formatDisplayDate } from "@/lib/date";
import { formatMinutes, type AttendanceLogDay, type AttendanceTotals } from "@/models/attendance";
import { useAttendanceCapabilities, useAttendanceLog } from "@/components/modules/attendance/hooks";
import { formatAmounts } from "@/components/modules/attendance/lib";
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

type NumericTotal = Exclude<keyof AttendanceTotals, "amounts">;

const TOTALS: { key: NumericTotal; label: string; minutes: boolean }[] = [
  { key: "expectedDays", label: "Expected days", minutes: false },
  { key: "loggedDays", label: "Logged days", minutes: false },
  { key: "expectedMinutes", label: "Expected hours", minutes: true },
  { key: "loggedMinutes", label: "Logged hours", minutes: true },
  { key: "overtimeMinutes", label: "Overtime hours", minutes: true },
];

const COLUMNS = 6;

/**
 * One person's log for a period (technical_documentation/ATTENDANCE.md § 8) — opened from a row of the
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
  const amount = formatAmounts(log.data?.totals.amounts);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href={backHref}
            aria-label="Back to attendance"
            className="no-underline grid h-10 w-10 place-items-center rounded-pill border bg-card hover:bg-subtle active:translate-y-px"
          >
            <Icon icon={ArrowLeft01Icon} size="sm" />
          </Link>
          {person ? (
            <>
              <Avatar className="h-10 w-10">
                {person.avatarUrl ? <AvatarImage src={person.avatarUrl} alt={name}/> : null}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <h1 className="text-page-title">{name}</h1>
            </>
          ) : (
            <Skeleton className="h-9 w-64"/>
          )}
        </div>
        <div className="flex items-center gap-3">
          <PeriodControl month={view.month} range={view.range} onMonthChange={setMonth} onRangeChange={setRange}/>
          <Button asChild variant="secondary">
            <Link href={`/organization/people/${userId}/attendance`} className="no-underline">
              <Icon icon={UserIcon} size="sm" />
              Open profile
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
                <dt className="text-hint text-tertiary">{total.label}</dt>
                <dd className="mt-0.5 text-section-title tabular-nums text-primary">
                  {log.data
                    ? total.minutes ? formatMinutes(log.data.totals[total.key]) : log.data.totals[total.key]
                    : <Skeleton className="h-6 w-12"/>}
                </dd>
              </div>
            ))}
            {/* Only when the server sent money: a reader who may not see the rate gets no figure, not a 0. */}
            {amount && (
              <div>
                <dt className="text-hint text-tertiary">Amount</dt>
                <dd className="mt-0.5 text-section-title tabular-nums text-primary">{amount}</dd>
              </div>
            )}
          </dl>

          <div className="rounded-control border border-divider bg-card">
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
                        <TableCell colSpan={COLUMNS} className="py-10 text-center text-body text-tertiary">
                          Nothing was expected and nothing was logged in this period.
                        </TableCell>
                      </TableRow>
                    )
                    : days.map((day) => {
                      const note = dayNote(day);
                      const noteCell = (
                        <TableCell className={note?.tone === "missing" ? "font-medium text-status-declined-text" : "text-tertiary"}>
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
