"use client";

import * as React from "react";

import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import PageDescription from "@/components/ui/PageDescription/PageDescription";
import TeamsContainer from "@/components/modules/settings/modules/teams/TeamsContainer";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { AccessDenied } from "@/components/auth/AccessDenied";

export default function TeamsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-4 px-8">
        <SettingsPageHeader title="Teams" backHref="/settings" />

        <PageDescription className="text-base text-muted-foreground/90">
          Teams are smaller groups within departments, used to organize people around specific
          projects or responsibilities.
        </PageDescription>
      </div>

      <div className="px-8">
        <PermissionGate resource="ORG.TEAM" action="VIEW" fallback={<AccessDenied />}>
          <TeamsContainer />
        </PermissionGate>
      </div>
    </div>
  );
}
