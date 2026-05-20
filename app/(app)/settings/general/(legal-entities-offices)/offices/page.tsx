"use client";

import * as React from "react";

import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import PageDescription from "@/components/ui/PageDescription/PageDescription";
import OfficeContainer from "@/components/modules/settings/modules/office/components/OfficeContainer/OfficeContainer";
import SettingsLegalEntitiesAndOfficesLayout
  from "@/components/ui/SettingsLegalEntitiesAndOfficesLayout/SettingsLegalEntitiesAndOfficesLayout";

export default function OfficesPage() {
  return (
    <SettingsLegalEntitiesAndOfficesLayout
      header={
        <>
          <SettingsPageHeader title="Offices" backHref="/settings"/>

          <PageDescription className="text-base text-muted-foreground/90">
            Offices represent the physical or remote locations where your
            company operates. Each office contains details such as address,
            country, timezone, and employee distribution.
          </PageDescription>
        </>
      }
    >
      <OfficeContainer/>
    </SettingsLegalEntitiesAndOfficesLayout>
  );
}
