"use client";

import LeaveTypesSettingsContainer from "@/components/modules/settings/modules/time/timeOff/leaveTypes/components/LeaveTypesSettingsContainer";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { AccessDenied } from "@/components/auth/AccessDenied";

export default function LeaveTypesPage() {
  return (
    <PermissionGate resource="PEOPLE.TIME_OFF_POLICIES" action="VIEW" fallback={<AccessDenied />}>
      <LeaveTypesSettingsContainer />
    </PermissionGate>
  );
}
