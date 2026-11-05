"use client";

import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/desact/tabs";
import { Notification01Icon, Shield01Icon, UserGroupIcon, ViewIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import FieldAccessModule
  from "@/components/modules/settings/modules/roles/components/RoleDetailsContainer/modules/FieldAccess/FieldAccessModule";
import PermissionsModule
  from "@/components/modules/settings/modules/roles/components/RoleDetailsContainer/modules/Permissions/PermissionsModule";
import AssignedUsersModule
  from "@/components/modules/settings/modules/roles/components/RoleDetailsContainer/modules/AssignedUsers/AssignedUsersModule";
import { useRoleUsers } from "@/components/modules/settings/modules/roles/hooks/useRoleUsers";

export interface RoleDetailsViewProps {
  roleId: string;
  roleName?: string;
  isDefaultRole?: boolean;
  isSystemOwnerRole?: boolean;
  isArchived?: boolean;
  isLoading?: boolean;
}

export default function RoleDetailsView({ roleId, roleName, isDefaultRole = false, isSystemOwnerRole = false, isArchived = false, isLoading = false }: RoleDetailsViewProps) {
  const t = useTranslations("settings");
  // Counts loaded rows — the backend has no total yet, so this grows as pages load.
  const { items: assignedUsers, isLoading: assignedLoading } = useRoleUsers(roleId, null);
  const assignedCount = assignedLoading ? undefined : assignedUsers.length;

  return (
    <div className="px-8 space-y-4">

      <Tabs defaultValue="assigned" className="w-full">
        <TabsList>
          <TabsTrigger value="assigned" className="flex items-center gap-2">
            <Icon icon={UserGroupIcon} size="sm" />
            {t("roles.detail.tabs.assigned")}
            {assignedCount != null && (
              <span className="text-tertiary">({assignedCount})</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Icon icon={Shield01Icon} size="sm" />
            {t("roles.detail.tabs.permissions")}
          </TabsTrigger>
          <TabsTrigger value="field-access" className="flex items-center gap-2">
            <Icon icon={ViewIcon} size="sm" />
            {t("roles.detail.tabs.fieldAccess")}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Icon icon={Notification01Icon} size="sm" />
            {t("roles.detail.tabs.notifications")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assigned" className="mt-8">
          <AssignedUsersModule roleId={roleId} roleName={roleName} isDefaultRole={isDefaultRole} isSystemOwnerRole={isSystemOwnerRole} isArchived={isArchived} isLoading={isLoading}/>
        </TabsContent>

        <TabsContent value="permissions" className="mt-8">
          <PermissionsModule roleId={roleId} isLoading={isLoading}/>
        </TabsContent>

        <TabsContent value="field-access" className="mt-8">
          <FieldAccessModule roleId={roleId} isLoading={isLoading}/>
        </TabsContent>
      </Tabs>
    </div>
  );
}
