"use client";

import React from "react";
import { useRoleModulePermissions } from "@/components/modules/settings/modules/roles/hooks/useRoleModulePermissions";
import RolePermissionsView from "./RolePermissionsView";
import { useAttributeGroups } from "@/components/modules/settings/modules/attributes/hooks/AttributeGroup/useAttributeGroups";

export default function RolePermissionsContainer({ roleId }: { roleId: string }) {
  const modulesQ = useRoleModulePermissions(roleId);

  const {
    data: fetchedGroups,
    isLoading: groupsLoading,
    error: groupsError,
  } = useAttributeGroups();

  if (modulesQ.error) throw modulesQ.error;
  if (groupsError) throw groupsError;

  return (
    <RolePermissionsView
      roleId={roleId}
      modulesData={modulesQ.data}
      modulesLoading={modulesQ.isLoading}
      attributeGroups={fetchedGroups ?? []}
      groupsLoading={groupsLoading}
      saveModules={modulesQ.save}
      savingModules={modulesQ.saving}
    />
  );
}
