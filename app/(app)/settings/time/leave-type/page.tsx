"use client";

import LeaveTypesSettingsContainer from "@/components/modules/settings/modules/time/timeOff/leaveTypes/components/LeaveTypesSettingsContainer";
import { PageGate } from "@/components/auth/PageGate";

export default function LeaveTypesPage() {
  return (
    <PageGate resource="PEOPLE.TIME_OFF_POLICIES" action="VIEW">
      <LeaveTypesSettingsContainer />
    </PageGate>
  );
}
