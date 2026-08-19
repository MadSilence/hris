"use client";

import * as React from "react";
import { Suspense } from "react";

import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import PageDescription from "@/components/ui/PageDescription/PageDescription";
import DepartmentsContainer from "@/components/modules/settings/modules/departments/DepartmentsContainer";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { AccessDenied } from "@/components/auth/AccessDenied";

export default function DepartmentsPage() {
  // The page owns the viewport height so the canvas can fill what is left instead of pushing the
  // whole page into a scroll.
  return (
    <div className="flex h-[calc(100dvh-6rem)] flex-col gap-5 px-10">
      <div className="flex-none space-y-3">
        <SettingsPageHeader title="Departments" backHref="/settings" />

        <PageDescription className="text-base text-muted-foreground/90">
          Two views of the same structure: a chart of how departments nest, and blocks showing who sits where. Search by department or by person, and turn on Edit to move departments and people around.
        </PageDescription>
      </div>

      <div className="min-h-0 flex-1">
        <PermissionGate resource="ORG.DEPARTMENT" action="VIEW" fallback={<AccessDenied />}>
          <Suspense fallback={null}>
            <DepartmentsContainer />
          </Suspense>
        </PermissionGate>
      </div>
    </div>
  );
}
