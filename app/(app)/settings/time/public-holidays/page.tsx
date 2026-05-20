"use client";

import { PermissionGate } from "@/components/auth/PermissionGate";
import { AccessDenied } from "@/components/auth/AccessDenied";
import PublicHolidaysSettingsContainer
  from "@/components/modules/settings/modules/time/publicHolidays/components/PublicHolidaysSettingsContainer/PublicHolidaysSettingsContainer";

export default function PublicHolidaysPage() {
  return (
    <PermissionGate anyOf={["PERM_PUBLIC_HOLIDAYS_MANAGE"]} fallback={<AccessDenied/>}>
      <PublicHolidaysSettingsContainer/>
    </PermissionGate>
  );
}
