"use client";

import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/public/desact/src/components/ui/table";
import UsersRolesTableSkeleton from "./UsersRolesTableSkeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/public/desact/src/components/ui/avatar";
import { Badge } from "@/public/desact/src/components/ui/badge";
import { Button } from "@/public/desact/src/components/ui/button";
import { Role } from "@/models/role/Role";
import { UsersSearchItemDTO } from "@/models/user/fields";
import { useCanAccess } from "@/components/auth/useAccess";
import {
  AssignRolesModal
} from "@/components/modules/settings/modules/roles/components/RolesPageContainer/modules/UsersRolesTable/modals/AssignRolesModal";


export interface UsersRolesTableProps {
  userRows?: UsersSearchItemDTO[];
  usersLoading: boolean;
  allRoles: Role[];
  onApplyRoles?: (
    userId: string,
    roleIds: string[],
    currentRoleIds: string[],
  ) => void | Promise<void>;
  isApplyingRoles?: boolean;
  applyRolesErrorMessage?: string;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
}

function getInitials(firstName?: string | null, lastName?: string | null, email?: string | null) {
  const a = (firstName ?? "").trim();
  const b = (lastName ?? "").trim();

  const initials = (a ? a[0] : "") + (b ? b[0] : "");
  if (initials) return initials.toUpperCase();

  const e = (email ?? "").trim();
  return (e[0] ?? "—").toUpperCase();
}

export default function UsersRolesTable({
  userRows,
  usersLoading,
  allRoles,
  onApplyRoles,
  isApplyingRoles = false,
  applyRolesErrorMessage,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
}: UsersRolesTableProps) {
  const hasUsers = (userRows?.length ?? 0) > 0;
  const [selectedUser, setSelectedUser] =
    React.useState<UsersSearchItemDTO | null>(null);

  // Assigning roles is gated by PEOPLE.PROFILE MANAGE on the backend, not ROLES.ROLE.
  const canAssignRoles = useCanAccess("PEOPLE.PROFILE", "MANAGE");

  return (
    <>
      <Table className="table-fixed">
        <TableHeader className="sticky top-0 z-10 bg-white">
          <TableRow>
            <TableHead className="w-1/3">User</TableHead>
            <TableHead className="w-1/3">Position</TableHead>
            <TableHead className="w-1/3">Assigned Roles</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
            {usersLoading && <UsersRolesTableSkeleton rows={5}/>}

            {!usersLoading &&
              hasUsers &&
              userRows!.map((u) => {
                const fullName =
                  `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() ||
                  u.email;
                const initials = getInitials(
                  u.firstName,
                  u.lastName,
                  u.email
                );

                return (
                  <TableRow
                    key={u.id}
                    className={`border-brown-200 ${canAssignRoles ? "cursor-pointer hover:bg-brown-50" : ""}`}
                    onClick={() => {
                      if (canAssignRoles) setSelectedUser(u);
                    }}
                  >
                    <TableCell className="py-2 w-1/3">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-7 w-7 shrink-0">
                          {u.avatarUrl ? <AvatarImage src={u.avatarUrl} alt={fullName}/> : null}
                          <AvatarFallback className="text-[11px]">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate text-sm font-medium">{fullName}</span>
                      </div>
                    </TableCell>

                    <TableCell className="w-1/3 text-muted-foreground">{u.jobName || "—"}</TableCell>

                    <TableCell className="w-1/3">
                      {u.roles?.length ? (
                        <div className="flex flex-wrap gap-1.5">
                          {u.roles.map((r) => (
                            <Badge key={r.id} variant="secondary" className="font-normal">
                              {r.name}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}

            {!usersLoading && !hasUsers && (
              <TableRow>
                <TableCell colSpan={3}>
                  <div className="text-sm text-muted-foreground">
                    No users yet
                  </div>
                </TableCell>
              </TableRow>
            )}
        </TableBody>
      </Table>

      {hasMore && (
        <div className="flex justify-center py-3">
          <Button variant="outline" size="sm" onClick={onLoadMore} disabled={isLoadingMore}>
            {isLoadingMore ? "Loading…" : "Load more"}
          </Button>
        </div>
      )}

      <AssignRolesModal
        isOpen={!!selectedUser}
        user={selectedUser}
        allRoles={allRoles}
        isLoading={isApplyingRoles}
        errorMessage={applyRolesErrorMessage}
        onCancelAction={() => setSelectedUser(null)}
        onApplyAction={async (userId, roleIds) => {
          const currentRoleIds = (selectedUser?.roles ?? []).map((role) => role.id);

          try {
            await onApplyRoles?.(userId, roleIds, currentRoleIds);
            setSelectedUser(null);
          } catch {
            // The error is surfaced inside the modal via errorMessage.
          }
        }}
      />
    </>
  );
}
