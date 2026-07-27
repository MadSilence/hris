"use client";

import * as React from "react";

import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import PageDescription from "@/components/ui/PageDescription/PageDescription";
import SettingsDepartmentsAndTeamsLayout from "@/components/ui/SettingsDepartmentsAndTeamsLayout/SettingsDepartmentsAndTeamsLayout";
import TeamsContainer from "@/components/modules/settings/modules/teams/TeamsContainer";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { AccessDenied } from "@/components/auth/AccessDenied";

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
      <PermissionGate resource="ORG.TEAM" action="VIEW" fallback={<AccessDenied/>}>
        <TeamsContainer />
      </PermissionGate>
    </SettingsDepartmentsAndTeamsLayout>
  );
}
