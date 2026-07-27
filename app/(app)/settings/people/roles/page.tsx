"use client";

import React from "react";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { AccessDenied } from "@/components/auth/AccessDenied";
import { PageDescription } from "@/components/ui/PageDescription/PageDescription";
import RolesPageContainer from "@/components/modules/settings/modules/roles/components/RolesPageContainer/RolesPageContainer";

const RolesSettingsPage: React.FC = () => {
  return (
    <PermissionGate resource="ROLES.ROLE" action="VIEW" fallback={<AccessDenied/>}>
      <div className="flex h-[calc(100svh-6rem)] flex-col gap-4 overflow-hidden">
        <div className="px-8 space-y-2 shrink-0">
          <SettingsPageHeader title={"Roles and permissions"} backHref="/settings"/>

          <PageDescription className="text-base text-muted-foreground/90">
            Manage access by defining roles and their permissions. Use the table below to review, search and navigate to specific roles.
          </PageDescription>
        </div>

        <div className="flex-1 min-h-0">
          <RolesPageContainer/>
        </div>
      </div>
    </PermissionGate>
  );
};

export default RolesSettingsPage;
