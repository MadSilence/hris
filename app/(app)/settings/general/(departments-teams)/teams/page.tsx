"use client";

import * as React from "react";
import { Suspense } from "react";

import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import PageDescription from "@/components/ui/PageDescription/PageDescription";
import TeamsContainer from "@/components/modules/settings/modules/teams/TeamsContainer";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { AccessDenied } from "@/components/auth/AccessDenied";

export default function TeamsPage() {
  // The page owns the viewport height so the canvas can fill what is left instead of pushing the
  // whole page into a scroll.
  return (
    <div className="flex h-[calc(100dvh-6rem)] flex-col gap-5 px-10">
      <div className="flex-none space-y-3">
        <SettingsPageHeader title="Teams" backHref="/settings" />

        <PageDescription className="text-base text-muted-foreground/90">
          Teams group people around projects and responsibilities, and one person can be on several. Switch between the structure chart and blocks of people, search by team or by person, and turn on Edit to move teams and people around.
        </PageDescription>
      </div>

      <div className="min-h-0 flex-1">
        <PermissionGate resource="ORG.TEAM" action="VIEW" fallback={<AccessDenied />}>
          <Suspense fallback={null}>
            <TeamsContainer />
          </Suspense>
        </PermissionGate>
      </div>
    </div>
  );
}
