"use client";

import CompanyProfileSettingsContainer
  from "@/components/modules/settings/modules/general/companyProfile/components/CompanyProfileSettingsContainer/CompanyProfileSettingsContainer";
import { PageGate } from "@/components/auth/PageGate";

export default function CompanyProfileSettingsPage() {
  return (
    <PageGate resource="SETTINGS.GENERAL" action="VIEW">
      <CompanyProfileSettingsContainer/>
    </PageGate>
  );
}
