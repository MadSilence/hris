"use client";

import { PageGate } from "@/components/auth/PageGate";
import PublicHolidaysSettingsContainer
  from "@/components/modules/settings/modules/time/publicHolidays/components/PublicHolidaysSettingsContainer/PublicHolidaysSettingsContainer";

export default function PublicHolidaysPage() {
  return (
    <PageGate resource="ORG.PUBLIC_HOLIDAY_CALENDAR" action="VIEW">
      <PublicHolidaysSettingsContainer/>
    </PageGate>
  );
}
