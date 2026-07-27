"use client";


import PublicHolidayCalendarContainer
  from "@/components/modules/settings/modules/time/publicHolidays/components/PublicHolidayCalendarContainer/PublicHolidayCalendarContainer";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { AccessDenied } from "@/components/auth/AccessDenied";

export default function PublicHolidayCalendarPage() {
  return (
    <PermissionGate resource="ORG.PUBLIC_HOLIDAY_CALENDAR" action="VIEW" fallback={<AccessDenied/>}>
      <PublicHolidayCalendarContainer/>
    </PermissionGate>
  );
}
