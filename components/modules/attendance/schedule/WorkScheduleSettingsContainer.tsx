"use client";

import React, { useState } from "react";
import { UserRoundSearch } from "lucide-react";
import { Label } from "@/public/desact/src/components/ui/label";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { UserPickerField, type PickedUser } from "@/components/modules/settings/shared/UserPickerField/UserPickerField";
import { useAttendanceCapabilities } from "@/components/modules/attendance/hooks";
import { WorkSchedulePanel } from "./WorkSchedulePanel";

/**
 * Settings → Attendance: one person's work schedule, picked by name. The same panel the timesheet
 * shows under a person's month — this is the way in for somebody who looks after schedules rather
 * than timesheets.
 */
export const WorkScheduleSettingsContainer: React.FC = () => {
  const [person, setPerson] = useState<PickedUser | null>(null);
  const capabilities = useAttendanceCapabilities(person?.id ?? null);

  return (
    <div className="space-y-6">
      <div className="w-80 space-y-1">
        <Label htmlFor="work-schedule-person">Person</Label>
        <UserPickerField id="work-schedule-person" value={person} onChange={setPerson}/>
      </div>

      {!person ? (
        <EmptyState
          icon={<UserRoundSearch className="h-6 w-6"/>}
          title="Choose a person"
          description="Their work schedules appear here: the hours per weekday, and the date each one starts."
        />
      ) : capabilities.error ? (
        <ErrorState error={capabilities.error} compact onRetry={() => void capabilities.refetch()}/>
      ) : capabilities.data && !capabilities.data.canViewSchedule ? (
        <EmptyState
          icon={<UserRoundSearch className="h-6 w-6"/>}
          title="Not available to you"
          description="Your access does not include this person's employment details."
        />
      ) : capabilities.data ? (
        <WorkSchedulePanel userId={person.id} canEdit={capabilities.data.canEditSchedule}/>
      ) : null}
    </div>
  );
};
