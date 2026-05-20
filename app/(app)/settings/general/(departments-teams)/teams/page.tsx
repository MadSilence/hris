"use client";

import * as React from "react";

import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import PageDescription from "@/components/ui/PageDescription/PageDescription";
import SettingsDepartmentsAndTeamsLayout from "@/components/ui/SettingsDepartmentsAndTeamsLayout/SettingsDepartmentsAndTeamsLayout";
import TeamsContainer from "@/components/modules/settings/modules/teams/TeamsContainer";

export default function Page() {
  return (
    <SettingsDepartmentsAndTeamsLayout
      header={
        <>
          <SettingsPageHeader title="Teams" backHref="/settings"/>

          <PageDescription className="text-base text-muted-foreground/90">
            Teams are smaller groups within departments, used to organize people
            around specific projects or responsibilities.
          </PageDescription>
        </>
      }
    >
      <TeamsContainer />
    </SettingsDepartmentsAndTeamsLayout>
  );
}
