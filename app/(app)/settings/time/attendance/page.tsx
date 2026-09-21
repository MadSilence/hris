import { FC } from "react";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import PageDescription from "@/components/ui/PageDescription/PageDescription";
import { PageGate } from "@/components/auth/PageGate";
import { WorkScheduleSettingsContainer } from "@/components/modules/attendance/schedule";

/**
 * Attendance settings: work schedules (ATTENDANCE_PLAN 1.4 / 3.4). Timesheets themselves live on the
 * Timesheet page; this is where the working week behind them is kept.
 */
const AttendanceSettingsPage: FC = () => (
  <PageGate resource="PEOPLE.PROFILE" action="VIEW">
    <div className="space-y-6">
      <div className="px-8 space-y-4">
        <SettingsPageHeader title="Attendance" backHref="/settings"/>

        <PageDescription className="text-base text-muted-foreground/90">
          Work schedules: how many hours a person works on each weekday, from a date on. Leave is not charged
          for a day with no hours, and the timesheet compares recorded hours against the schedule. Somebody
          with no schedule works the company week.
        </PageDescription>
      </div>

      <div className="px-8">
        <WorkScheduleSettingsContainer/>
      </div>
    </div>
  </PageGate>
);

export default AttendanceSettingsPage;
