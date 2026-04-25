"use client";

import React from "react";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { AccessDenied } from "@/components/auth/AccessDenied";
import { PageDescription } from "@/components/ui/PageDescription/PageDescription";
import RolesPageContainer from "@/components/modules/settings/modules/roles/components/RolesPageContainer/RolesPageContainer";

const RolesSettingsPage: React.FC = () => {
  return (
    <PermissionGate anyOf={["PERM_ROLES_VIEW"]} fallback={<AccessDenied/>}>
      <div className="min-h-svh px-8 py-8">
        <div className="px-8 pt-8">
          <div className="px-6">
            <SettingsPageHeader title={"Roles and permissions"} backHref="/settings"/>
          </div>
          <div className="mt-2">
            <PageDescription className="px-6 text-base text-muted-foreground/90">
              Manage access by defining roles and their permissions. Use the table below to review, search and navigate to specific roles.
            </PageDescription>
          </div>
        </div>
        <RolesPageContainer/>
      </div>
    </PermissionGate>
  );
};

export default RolesSettingsPage;
