"use client";

import * as React from "react";

import DepartmentsContainer from "@/components/modules/settings/modules/departments/DepartmentsContainer";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import PageDescription from "@/components/ui/PageDescription/PageDescription";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { AccessDenied } from "@/components/auth/AccessDenied";

export default function DepartmentsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-4 px-8">
        <SettingsPageHeader title="Departments" backHref="/settings" />

        <PageDescription className="text-base text-muted-foreground/90">
          Departments describe how your organization is structured. Nest them to mirror your
          reporting lines and group people accordingly.
        </PageDescription>
      </div>

      <div className="px-8">
        <PermissionGate resource="ORG.DEPARTMENT" action="VIEW" fallback={<AccessDenied />}>
          <DepartmentsContainer />
        </PermissionGate>
      </div>
    </div>
  );
}
