import { FC } from "react";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import PageDescription from "@/components/ui/PageDescription/PageDescription";
import { PageGate } from "@/components/auth/PageGate";
import {
  AttendanceRateField,
  CompanyWorkdayNorm,
  WorkScheduleSettingsContainer,
} from "@/components/modules/attendance/schedule";

/**
 * Attendance settings: how long a company working day is, which money field prices logged time, and the
 * personal schedules that override the working day.
 * Logged time itself lives on the Attendance page and the person profile; this is the norm behind it.
 */
const AttendanceSettingsPage: FC = () => (
  <PageGate resource="PEOPLE.PROFILE" action="VIEW">
    <div className="space-y-6">
      <div className="px-8 space-y-4">
        <SettingsPageHeader title="Attendance" backHref="/settings"/>

        <PageDescription className="text-base text-muted-foreground/90">
          What Attendance expects of people. Everybody works the company week at the company&apos;s working-day
          length, unless they have a personal schedule: hours per weekday, from a date on. Leave is not charged
          for a day with no hours, and time logged beyond a day&apos;s hours is overtime.
        </PageDescription>
      </div>

      <div className="space-y-10 px-8">
        <CompanyWorkdayNorm/>
        <AttendanceRateField/>
        <WorkScheduleSettingsContainer/>
      </div>
    </div>
  </PageGate>
);

export default AttendanceSettingsPage;
