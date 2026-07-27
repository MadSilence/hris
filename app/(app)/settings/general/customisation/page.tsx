"use client";

import CompanyAppearanceSettingsContainer
  from "@/components/modules/settings/modules/general/companyAppearance/components/CompanyAppearanceSettingsContainer/CompanyAppearanceSettingsContainer";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { AccessDenied } from "@/components/auth/AccessDenied";

export default function CompanyAppearanceSettingsPage() {
  return (
    <PermissionGate resource="SETTINGS.GENERAL" action="VIEW" fallback={<AccessDenied/>}>
      <CompanyAppearanceSettingsContainer/>
    </PermissionGate>
  );
}
