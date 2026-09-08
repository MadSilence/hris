"use client";


import PublicHolidayCalendarContainer
  from "@/components/modules/settings/modules/time/publicHolidays/components/PublicHolidayCalendarContainer/PublicHolidayCalendarContainer";
import { PageGate } from "@/components/auth/PageGate";

export default function PublicHolidayCalendarPage() {
  return (
    <PageGate resource="ORG.PUBLIC_HOLIDAY_CALENDAR" action="VIEW">
      <PublicHolidayCalendarContainer/>
    </PageGate>
  );
}
