"use client";

import TimeOffPoliciesSettingsContainer from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/components/TimeOffPoliciesSettingsContainer";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { AccessDenied } from "@/components/auth/AccessDenied";

export default function TimeOffPage() {
  return (
    <PermissionGate resource="PEOPLE.TIME_OFF_POLICIES" action="VIEW" fallback={<AccessDenied/>}>
      <TimeOffPoliciesSettingsContainer />
    </PermissionGate>
  );
}
