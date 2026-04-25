"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/public/desact/src/components/ui/tabs";
import { Bell, Shield, Users } from "lucide-react";
import PermissionsModule
  from "@/components/modules/settings/modules/roles/components/RoleDetailsContainer/modules/Permissions/PermissionsModule";
import AssignedUsersModule
  from "@/components/modules/settings/modules/roles/components/RoleDetailsContainer/modules/AssignedUsers/AssignedUsersModule";

export interface RoleDetailsViewProps {
  roleId: string;
  isLoading?: boolean;
}

export default function RoleDetailsView({ roleId, isLoading = false }: RoleDetailsViewProps) {
  return (
    <div className="px-8 pt-8 space-y-6">

      <Tabs defaultValue="assigned" className="w-full">
        <TabsList className="grid grid-cols-3 w-full bg-brown-50">
          <TabsTrigger value="assigned" className="flex items-center gap-2">
            <Users className="w-4 h-4"/>
            Assigned Users
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Shield className="w-4 h-4"/>
            Permissions
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4"/>
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assigned" className="mt-3">
          <AssignedUsersModule roleId={roleId} isLoading={isLoading}/>
        </TabsContent>

        <TabsContent value="permissions" className="mt-3">
          <PermissionsModule roleId={roleId} isLoading={isLoading}/>
        </TabsContent>
      </Tabs>
    </div>
  );
}
