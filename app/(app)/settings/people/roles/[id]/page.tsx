"use client";

import React from "react";
import { useParams } from "next/navigation";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { AccessDenied } from "@/components/auth/AccessDenied";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import RoleDetailsContainer from "@/components/modules/settings/modules/roles/components/RoleDetailsContainer/RoleDetailsContainer";
import { useRoles } from "@/components/modules/settings/modules/roles/hooks/useRoles";

export default function RolePage() {
  const params = useParams<{ id: string }>();
  const roleId = params?.id as string;
  const { data: roles } = useRoles();
  const roleName = (roles ?? []).find((r) => r.id === roleId)?.name ?? "Role";

  return (
    <PermissionGate anyOf={["PERM_ROLES_VIEW"]} fallback={<AccessDenied/>}>
      <div className="min-h-svh px-8 py-8">
        <div className="px-8 pt-8">
          <div className="px-6">
            <SettingsPageHeader
              className="px-8"
              title={roleName}
              backHref="/settings/people/roles"
            />
          </div>
        </div>
        <RoleDetailsContainer roleId={roleId}/>
      </div>
    </PermissionGate>
  );
}
