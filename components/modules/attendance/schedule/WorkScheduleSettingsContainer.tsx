"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";

import { Label } from "@/components/desact/label";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { UserPickerField, type PickedUser } from "@/components/modules/settings/shared/UserPickerField/UserPickerField";
import { useAttendanceCapabilities } from "@/components/modules/attendance/hooks";
import { WorkSchedulePanel } from "./WorkSchedulePanel";

/**
 * Settings → Attendance: one person's work schedule, picked by name. The same panel Attendance
 * shows under a person's month — this is the way in for somebody who looks after schedules rather
 * than timesheets.
 */
export const WorkScheduleSettingsContainer: React.FC = () => {
  const t = useTranslations("attendance");
  const [person, setPerson] = useState<PickedUser | null>(null);
  const capabilities = useAttendanceCapabilities(person?.id ?? null);

  return (
    <div className="space-y-6">
      <div className="w-80 space-y-1">
        <Label htmlFor="work-schedule-person">{t("schedule.settings.person")}</Label>
        <UserPickerField id="work-schedule-person" value={person} onChange={setPerson}/>
      </div>

      {!person ? (
        <EmptyState
          scene="attendance"
          title={t("schedule.settings.chooseTitle")}
          description={t("schedule.settings.chooseDescription")}
        />
      ) : capabilities.error ? (
        <ErrorState error={capabilities.error} compact onRetry={() => void capabilities.refetch()}/>
      ) : capabilities.data && !capabilities.data.canViewSchedule ? (
        <EmptyState
          scene="attendance"
          title={t("schedule.settings.unavailableTitle")}
          description={t("schedule.settings.unavailableDescription")}
        />
      ) : capabilities.data ? (
        <WorkSchedulePanel userId={person.id} canEdit={capabilities.data.canEditSchedule}/>
      ) : null}
    </div>
  );
};
