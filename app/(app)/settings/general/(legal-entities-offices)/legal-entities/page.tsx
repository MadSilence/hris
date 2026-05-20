"use client";

import * as React from "react";

import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import PageDescription from "@/components/ui/PageDescription/PageDescription";
import LegalEntityContainer from "@/components/modules/settings/modules/legalEntity/components/LegalEntityContainer/LegalEntityContainer";
import SettingsLegalEntitiesAndOfficesLayout
  from "@/components/ui/SettingsLegalEntitiesAndOfficesLayout/SettingsLegalEntitiesAndOfficesLayout";

export default function LegalEntitiesPage() {
  return (
    <SettingsLegalEntitiesAndOfficesLayout
      header={
        <>
          <SettingsPageHeader title="Legal Entities" backHref="/settings"/>

          <PageDescription className="text-base text-muted-foreground/90">
            Legal Entities define the official registered companies within your
            organization. Each entity includes important compliance details such
            as registration number, tax ID, and address.
          </PageDescription>
        </>
      }
    >
      <LegalEntityContainer/>
    </SettingsLegalEntitiesAndOfficesLayout>
  );
}
