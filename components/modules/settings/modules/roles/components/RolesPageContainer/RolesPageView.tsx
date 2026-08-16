"use client";

import * as React from "react";
import { Card, CardContent, CardHeader } from "@/public/desact/src/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/public/desact/src/components/ui/tabs";
import { Input } from "@/public/desact/src/components/ui/input";
import { Search, Shield, Users } from "lucide-react";
import RolesPageHeader from "./RolesPageHeader";
import RolesTable from "@/components/modules/settings/modules/roles/components/RolesPageContainer/modules/RolesTable/RolesTable";
import UsersRolesTable
  from "@/components/modules/settings/modules/roles/components/RolesPageContainer/modules/UsersRolesTable/UsersRolesTable";
import { Role } from "@/models/role/Role";
import { UsersSearchItemDTO } from "@/models/user/fields";

export type RolesTableView = "roles" | "users";

export interface RolesPageViewProps {
  view: RolesTableView;
  onViewChange: (view: RolesTableView) => void;
  query: string;
  onQueryChange: (value: string) => void;
  roleRows: Role[] | undefined;
  userRows?: UsersSearchItemDTO[] | undefined;
  rolesLoading: boolean;
  usersLoading: boolean;
  hasMoreUsers?: boolean;
  isLoadingMoreUsers?: boolean;
  onLoadMoreUsers?: () => void;
  onCreateRole?: (values: { name: string; description?: string }) => void | Promise<void>;
  onRenameRole?: (roleId: string, values: { name: string; description?: string }) => void | Promise<void>;
  onDuplicateRole?: (roleId: string, values: { name: string }) => void | Promise<void>;
  onDeleteRole?: (roleId: string) => void | Promise<void>;
  onArchiveRole?: (roleId: string, archived: boolean) => void | Promise<void>;
  onExportRoles?: (values: { format: "csv" | "xlsx" }) => void;
  onApplyRoles?: (userId: string, roleIds: string[], currentRoleIds: string[]) => void | Promise<void>;
  isCreatingRole?: boolean;
  isSavingRoleName?: boolean;
  isDeletingRole?: boolean;
  isAssigningRoles?: boolean;
  createRoleErrorMessage?: string;
  saveRoleNameErrorMessage?: string;
  deleteRoleErrorMessage?: string;
  assignRolesErrorMessage?: string;
  onClearErrors?: () => void;
}

export default function RolesPageView({
  view,
  onViewChange,
  query,
  onQueryChange,
  roleRows,
  userRows,
  rolesLoading,
  usersLoading,
  hasMoreUsers = false,
  isLoadingMoreUsers = false,
  onLoadMoreUsers,
  onCreateRole,
  onRenameRole,
  onDuplicateRole,
  onDeleteRole,
  onArchiveRole,
  onExportRoles,
  onApplyRoles,
  isCreatingRole = false,
  isSavingRoleName = false,
  isDeletingRole = false,
  isAssigningRoles = false,
  createRoleErrorMessage,
  saveRoleNameErrorMessage,
  deleteRoleErrorMessage,
  assignRolesErrorMessage,
  onClearErrors,
}: RolesPageViewProps) {
  return (
    <Card className="flex h-full min-h-0 flex-col border-0 gap-3 px-8 pt-2">
      <CardHeader className="px-0 py-0 shrink-0">
        <div className="flex items-center justify-between gap-4">
          <Tabs value={view} onValueChange={(v) => onViewChange(v as RolesTableView)}>
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

          <div className="flex items-center gap-3">
            <div className="relative w-[260px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-400"/>
              <Input
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder={view === "roles" ? "Search roles" : "Search users"}
                className="pl-9 w-[260px] h-9"
                inputMode="search"
              />
            </div>

            <RolesPageHeader
              existingRoleNames={(roleRows ?? []).map((role) => role.name)}
              onCreateRole={onCreateRole}
              onExportRoles={onExportRoles}
              isCreatingRole={isCreatingRole}
              createRoleErrorMessage={createRoleErrorMessage}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-0 pb-0 flex-1 min-h-0 overflow-y-auto">
        {view === "roles" ? (
          <RolesTable
            roleRows={roleRows}
            rolesLoading={rolesLoading}
            onRenameRole={onRenameRole}
            onDuplicateRole={onDuplicateRole}
            onDeleteRole={onDeleteRole}
            onArchiveRole={onArchiveRole}
            isSavingRoleName={isSavingRoleName}
            isDeletingRole={isDeletingRole}
            saveRoleNameErrorMessage={saveRoleNameErrorMessage}
            deleteRoleErrorMessage={deleteRoleErrorMessage}
            onClearErrors={onClearErrors}
          />
        ) : (
          <UsersRolesTable
            userRows={userRows}
            usersLoading={usersLoading}
            // Archived roles come through too: the form hides the ones nobody holds and keeps the
            // ones a person still has, so they can at least be taken off.
            allRoles={roleRows ?? []}
            onApplyRoles={onApplyRoles}
            isApplyingRoles={isAssigningRoles}
            applyRolesErrorMessage={assignRolesErrorMessage}
            hasMore={hasMoreUsers}
            isLoadingMore={isLoadingMoreUsers}
            onLoadMore={onLoadMoreUsers}
          />
        )}
      </CardContent>
    </Card>
  );
}
