import { getTranslations } from "next-intl/server";
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
const AttendanceSettingsPage = async () => {
  const t = await getTranslations("timeOff");
  return (
  <PageGate resource="PEOPLE.PROFILE" action="VIEW">
    <div className="space-y-6">
      <div className="px-8 space-y-4">
        <SettingsPageHeader title={t("settingsPages.attendance.title")} backHref="/settings"/>

        <PageDescription className="text-body text-tertiary/90">
          {t("settingsPages.attendance.description")}
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
};

export default AttendanceSettingsPage;
