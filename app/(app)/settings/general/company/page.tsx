"use client";

import CompanyProfileSettingsContainer
  from "@/components/modules/settings/modules/general/companyProfile/components/CompanyProfileSettingsContainer/CompanyProfileSettingsContainer";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { AccessDenied } from "@/components/auth/AccessDenied";

export default function CompanyProfileSettingsPage() {
  return (
    <PermissionGate resource="SETTINGS.GENERAL" action="VIEW" fallback={<AccessDenied/>}>
      <CompanyProfileSettingsContainer/>
    </PermissionGate>
  );
}
