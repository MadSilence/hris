"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/public/desact/src/components/ui/tabs";
import { Bell, Eye, Shield, Users } from "lucide-react";
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
  isArchived?: boolean;
  isLoading?: boolean;
}

export default function RoleDetailsView({ roleId, roleName, isDefaultRole = false, isArchived = false, isLoading = false }: RoleDetailsViewProps) {
  // Counts loaded rows — the backend has no total yet, so this grows as pages load.
  const { items: assignedUsers, isLoading: assignedLoading } = useRoleUsers(roleId, null);
  const assignedCount = assignedLoading ? undefined : assignedUsers.length;

  return (
    <div className="px-8 space-y-4">

      <Tabs defaultValue="assigned" className="w-full">
        <TabsList className="grid grid-cols-4 w-full bg-brown-50">
          <TabsTrigger value="assigned" className="flex items-center gap-2">
            <Users className="w-4 h-4"/>
            Assigned Users
            {assignedCount != null && (
              <span className="text-brown-400">({assignedCount})</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Shield className="w-4 h-4"/>
            Permissions
          </TabsTrigger>
          <TabsTrigger value="field-access" className="flex items-center gap-2">
            <Eye className="w-4 h-4"/>
            Field Access
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4"/>
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assigned" className="mt-8">
          <AssignedUsersModule roleId={roleId} roleName={roleName} isDefaultRole={isDefaultRole} isArchived={isArchived} isLoading={isLoading}/>
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
