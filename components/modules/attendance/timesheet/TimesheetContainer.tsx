"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Button } from "@/public/desact/src/components/ui/button";
import { Label } from "@/public/desact/src/components/ui/label";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider/CurrentUserProvider";
import { UserPickerField, type PickedUser } from "@/components/modules/settings/shared/UserPickerField/UserPickerField";
import { messageForError } from "@/lib/errors/errorMessages";
import {
  AttendanceActionError,
  useAttendanceCapabilities,
  useAttendanceMonth,
  useRecordAttendanceDay,
} from "@/components/modules/attendance/hooks";
import { WorkSchedulePanel } from "@/components/modules/attendance/schedule/WorkSchedulePanel";
import { ExportTimesheetsModal } from "@/components/modules/attendance/export/ExportTimesheetsModal";
import { TimesheetGrid } from "./TimesheetGrid";
import { TimesheetSummary } from "./TimesheetSummary";
import type { SaveDayResult } from "./TimesheetDayRow";
import { formatMonthLabel, shiftMonth } from "./month";

/**
 * My timesheet (ATTENDANCE_PLAN 2.5–2.6): a month, one row per day, hours and a description, the
 * running total above it — and, for somebody whose access reaches further than themselves, a person
 * picker to read other people's.
 *
 * Every "may I" on this screen is the server's answer for the person on screen
 * (`/attendance/users/{id}/capabilities`), not a reading of the caller's scope names.
 */
export const TimesheetContainer: React.FC = () => {
  const { user } = useCurrentUser();
  const [picked, setPicked] = useState<PickedUser | null>(null);
  const [month, setMonth] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const self: PickedUser | null = user
    ? { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, avatarUrl: user.avatarUrl }
    : null;
  const person = picked ?? self;
  const personId = person?.id ?? null;

  const capabilities = useAttendanceCapabilities(personId);
  const monthQuery = useAttendanceMonth(personId, month);
  const recordDay = useRecordAttendanceDay();

  const shownMonth = month ?? monthQuery.data?.month ?? null;
  const caps = capabilities.data;

  const save = async (date: string, hours: number, description: string): Promise<SaveDayResult> => {
    if (!personId) return { error: messageForError(null) };
    try {
      await recordDay.mutateAsync({ userId: personId, date, body: { hours, description } });
      return {};
    } catch (caught) {
      if (caught instanceof AttendanceActionError) {
        const fields = Object.keys(caught.result.fieldErrors ?? {});
        const field = fields.includes("hours") ? "hours" : fields.includes("description") ? "description" : undefined;
        return { error: caught.result.errorMessage ?? messageForError(caught), field };
      }
      return { error: messageForError(caught) };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-end gap-4">
          {caps?.canViewOthers && (
            <div className="w-72 space-y-1">
              <Label htmlFor="timesheet-person">Person</Label>
              <UserPickerField
                id="timesheet-person"
                value={person}
                onChange={(next) => setPicked(next)}
                allowClear={false}
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Previous Month"
              disabled={!shownMonth}
              onClick={() => shownMonth && setMonth(shiftMonth(shownMonth, -1))}
            >
              <ChevronLeft className="h-4 w-4"/>
            </Button>
            <span className="min-w-40 text-center text-lg font-medium" aria-live="polite">
              {shownMonth ? formatMonthLabel(shownMonth) : ""}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Next Month"
              disabled={!shownMonth}
              onClick={() => shownMonth && setMonth(shiftMonth(shownMonth, 1))}
            >
              <ChevronRight className="h-4 w-4"/>
            </Button>
          </div>
        </div>

        {caps?.canExport && shownMonth && person && (
          <Button type="button" variant="outline" onClick={() => setExporting(true)}>
            <Download className="h-4 w-4"/>
            Export
          </Button>
        )}
      </div>

      {monthQuery.error ? (
        <ErrorState error={monthQuery.error} onRetry={() => void monthQuery.refetch()}/>
      ) : (
        <>
          {monthQuery.data && <TimesheetSummary summary={monthQuery.data.summary}/>}
          <TimesheetGrid
            month={monthQuery.data}
            isLoading={monthQuery.isLoading}
            canRecord={Boolean(caps?.canRecord)}
            onSave={save}
          />
        </>
      )}

      {personId && caps?.canViewSchedule && (
        <WorkSchedulePanel userId={personId} today={monthQuery.data?.today} canEdit={caps.canEditSchedule}/>
      )}

      {exporting && shownMonth && person && (
        <ExportTimesheetsModal
          isOpen={exporting}
          month={shownMonth}
          person={person}
          canExportOthers={Boolean(caps?.canViewOthers)}
          onCloseAction={() => setExporting(false)}
        />
      )}
    </div>
  );
};
