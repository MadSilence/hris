"use client";

import * as React from "react";
import { Card, CardContent, CardHeader } from "@/public/desact/src/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/public/desact/src/components/ui/tabs";
import RolesPageHeader from "./RolesPageHeader";
import RolesTable from "@/components/modules/settings/modules/roles/components/RolesPageContainer/modules/RolesTable/RolesTable";
import UsersRolesTable
  from "@/components/modules/settings/modules/roles/components/RolesPageContainer/modules/UsersRolesTable/UsersRolesTable";
import { UsersSearchItemDTO } from "@/models/user/fields";
import { Shield, Users } from "lucide-react";

type TableView = "roles" | "users";

export interface RolesPageViewProps {
  roleRows: any;
  userRows?: UsersSearchItemDTO[] | undefined;
  rolesLoading: boolean;
  usersLoading: boolean;
}

export default function RolesPageView({
  roleRows,
  userRows,
  rolesLoading,
  usersLoading,
}: RolesPageViewProps) {
  const [view, setView] = React.useState<TableView>("roles");

  return (
    <Card className="border-0 px-8 pt-8">
      <CardHeader className="py-0">
        <div className="flex items-center justify-between gap-4">
          <Tabs value={view} onValueChange={(v) => setView(v as TableView)} className="w-full">
            <TabsList className="grid grid-cols-2 bg-brown-50 w-[320px]">
              <TabsTrigger value="roles" className="flex items-center gap-2">
                <Shield className="w-4 h-4"/>
                Roles
              </TabsTrigger>

              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4"/>
                Users
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <RolesPageHeader/>
        </div>
      </CardHeader>

      <CardContent className="pb-0">
        {view === "roles" ? (
          <RolesTable
            roleRows={roleRows}
            rolesLoading={rolesLoading}
          />
        ) : (
          <UsersRolesTable
            userRows={userRows}
            usersLoading={usersLoading}
            allRoles={roleRows ?? []}
          />
        )}
      </CardContent>
    </Card>
  );
}
