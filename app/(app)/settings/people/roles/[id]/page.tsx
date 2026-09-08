"use client";

import React from "react";
import { useParams } from "next/navigation";
import { PageGate } from "@/components/auth/PageGate";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import RoleDetailsContainer from "@/components/modules/settings/modules/roles/components/RoleDetailsContainer/RoleDetailsContainer";
import { useRoles } from "@/components/modules/settings/modules/roles/hooks/useRoles";

export default function RolePage() {
  const params = useParams<{ id: string }>();
  const roleId = params?.id as string;
  const { data: roles } = useRoles();
  const roleName = (roles ?? []).find((r) => r.id === roleId)?.name ?? "Role";

  return (
    <PageGate resource="ROLES.ROLE" action="VIEW">
      <div className="space-y-4">
        <div className="px-8">
          <SettingsPageHeader title={roleName} backHref="/settings/people/roles"/>
        </div>

        <RoleDetailsContainer roleId={roleId}/>
      </div>
    </PageGate>
  );
}
