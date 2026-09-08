"use client";

import CompanyAppearanceSettingsContainer
  from "@/components/modules/settings/modules/general/companyAppearance/components/CompanyAppearanceSettingsContainer/CompanyAppearanceSettingsContainer";
import { PageGate } from "@/components/auth/PageGate";

export default function CompanyAppearanceSettingsPage() {
  return (
    <PageGate resource="SETTINGS.GENERAL" action="VIEW">
      <CompanyAppearanceSettingsContainer/>
    </PageGate>
  );
}
