"use client";

import React, { useState } from "react";
import { CalendarClock, Plus } from "lucide-react";
import { Button } from "@/public/desact/src/components/ui/button";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/public/desact/src/components/ui/table";
import { EmptyState } from "@/components/feedback/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ErrorState } from "@/components/feedback/ErrorState";
import { showSuccess } from "@/lib/errors/errorToast";
import { messageForError } from "@/lib/errors/errorMessages";
import { formatDisplayDate } from "@/lib/date";
import { WEEKDAY_FIELDS, type WorkSchedule, type WorkScheduleWriteRequest } from "@/models/attendance";
import { AttendanceActionError, useAddWorkSchedule, useWorkSchedules } from "@/components/modules/attendance/hooks";
import { formatHours } from "@/components/modules/attendance/timesheet/month";
import { AddWorkScheduleModal } from "./AddWorkScheduleModal";

type Props = {
  userId: string;
  /** The company's today (`yyyy-MM-dd`), to say which schedule is in force. Falls back to none marked. */
  today?: string;
  /** Server-answered: may the caller add a schedule for this person. */
  canEdit: boolean;
};

/** The schedule in force on a date: the latest one not after it. Rows arrive newest first. */
export const scheduleInForce = (schedules: WorkSchedule[], today?: string): WorkSchedule | null => {
  if (!today) return null;
  return schedules.find((schedule) => schedule.effectiveFrom <= today) ?? null;
};

const weeklyHours = (schedule: WorkSchedule) =>
  WEEKDAY_FIELDS.reduce((sum, field) => sum + Number(schedule[field.key] ?? 0), 0);

/**
 * A person's working week over time (ATTENDANCE_PLAN 1.4 and 3.4). Read-only history plus one
 * action: add a schedule from a date. Somebody with no schedule works the company week.
 */
export const WorkSchedulePanel: React.FC<Props> = ({ userId, today, canEdit }) => {
  const { data: schedules, isLoading, error, refetch } = useWorkSchedules(userId);
  const addSchedule = useAddWorkSchedule();
  const [adding, setAdding] = useState(false);

  const submit = async (body: WorkScheduleWriteRequest): Promise<string | null> => {
    try {
      await addSchedule.mutateAsync({ userId, body });
      showSuccess("Work schedule added.");
      return null;
    } catch (caught) {
      return caught instanceof AttendanceActionError
        ? caught.result.errorMessage ?? messageForError(caught)
        : messageForError(caught);
    }
  };

  const current = scheduleInForce(schedules ?? [], today);

  return (
    <section className="space-y-3" aria-labelledby="work-schedule-heading">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 id="work-schedule-heading" className="text-lg font-semibold">Work Schedule</h2>
          <p className="text-sm text-muted-foreground">
            Hours per weekday. Days with no hours are not charged as leave. A schedule is never edited — a
            change is a new schedule from the date it starts.
          </p>
        </div>
        {canEdit && (
          <Button type="button" onClick={() => setAdding(true)} className="bg-brown-600 text-white hover:bg-brown-700">
            <Plus className="h-4 w-4"/>
            Add Work Schedule
          </Button>
        )}
      </div>

      {error ? (
        <ErrorState error={error} compact onRetry={() => void refetch()}/>
      ) : !isLoading && (schedules ?? []).length === 0 ? (
        <EmptyState
          icon={<CalendarClock className="h-6 w-6"/>}
          title="Works the company week"
          description="No personal schedule. The company's working days apply, with no set number of hours."
          onCreate={canEdit ? () => setAdding(true) : undefined}
          createLabel={canEdit ? "Add Work Schedule" : undefined}
        />
      ) : (
        <div className="rounded-lg border border-brown-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Effective From</TableHead>
                {WEEKDAY_FIELDS.map((field) => <TableHead key={field.key}>{field.label}</TableHead>)}
                <TableHead>Weekly Hours</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 2 }, (_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-4 w-24"/></TableCell>
                    {WEEKDAY_FIELDS.map((field) => <TableCell key={field.key}><Skeleton className="h-4 w-6"/></TableCell>)}
                    <TableCell><Skeleton className="h-4 w-10"/></TableCell>
                  </TableRow>
                ))
                : (schedules ?? []).map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatDisplayDate(schedule.effectiveFrom, { style: "medium" })}
                      {current?.id === schedule.id && <StatusBadge status="active" label="In Force" className="ml-2"/>}
                    </TableCell>
                    {WEEKDAY_FIELDS.map((field) => (
                      <TableCell key={field.key}>{formatHours(schedule[field.key])}</TableCell>
                    ))}
                    <TableCell>{formatHours(weeklyHours(schedule))}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      )}

      {canEdit && (
        <AddWorkScheduleModal
          isOpen={adding}
          current={current}
          onCloseAction={() => setAdding(false)}
          onSubmitAction={submit}
        />
      )}
    </section>
  );
};
