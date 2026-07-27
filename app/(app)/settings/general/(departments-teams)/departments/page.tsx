"use client";

import * as React from "react";
import DepartmentsContainer from "@/components/modules/settings/modules/departments/DepartmentsContainer";
import SettingsDepartmentsAndTeamsLayout from "@/components/ui/SettingsDepartmentsAndTeamsLayout/SettingsDepartmentsAndTeamsLayout";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import PageDescription from "@/components/ui/PageDescription/PageDescription";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { AccessDenied } from "@/components/auth/AccessDenied";

export default function DepartmentsPage() {
  return (
    <SettingsDepartmentsAndTeamsLayout
      header={
        <>
          <SettingsPageHeader title="Departments" backHref="/settings"/>

          <PageDescription className="text-base text-muted-foreground/90">
            Departments are smaller groups within departments, used to organize people
            around specific projects or responsibilities.
          </PageDescription>
        </>
      }
    >
      <PermissionGate resource="ORG.DEPARTMENT" action="VIEW" fallback={<AccessDenied/>}>
        <DepartmentsContainer/>
      </PermissionGate>
    </SettingsDepartmentsAndTeamsLayout>
  );
}
