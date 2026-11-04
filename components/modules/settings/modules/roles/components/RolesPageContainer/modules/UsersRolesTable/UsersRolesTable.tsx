"use client";

import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/desact/table";
import UsersRolesTableSkeleton from "./UsersRolesTableSkeleton";
import UserChip from "@/components/modules/settings/shared/UserChip/UserChip";
import { Badge } from "@/components/desact/badge";
import { Button } from "@/components/desact/button";
import { Role } from "@/models/role/Role";
import { UsersSearchItemDTO } from "@/models/user/fields";
import { useCanAccess } from "@/components/auth/useAccess";
import {
  AssignRolesModal
} from "@/components/modules/settings/modules/roles/components/RolesPageContainer/modules/UsersRolesTable/modals/AssignRolesModal";

import { ListEmptyState } from "@/components/feedback/ListEmptyState";

export interface UsersRolesTableProps {
  userRows?: UsersSearchItemDTO[];
  usersLoading: boolean;
  /** The search text, so the empty screen can tell a miss from an empty list. */
  query?: string;
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

export default function UsersRolesTable({
  userRows,
  usersLoading,
  query,
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

  const canAssignRoles = useCanAccess("PEOPLE.PROFILE", "MANAGE");

  return (
    <>
      <Table className="table-fixed" stickyHeader>
        <TableHeader className="sticky top-0 z-10 bg-card">
          <TableRow>
            <TableHead className="w-1/3 pl-4">User</TableHead>
            <TableHead className="w-1/3">Position</TableHead>
            <TableHead className="w-1/3">Assigned roles</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
            {usersLoading && <UsersRolesTableSkeleton rows={5}/>}

            {!usersLoading &&
              hasUsers &&
              userRows!.map((u) => {
                const fullName =
                  `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() ||
                  u.email ||
                  "Unnamed";
                return (
                  <TableRow
                    key={u.id}
                    className={`border-divider ${canAssignRoles ? "cursor-pointer hover:bg-subtle" : ""}`}
                    onClick={() => {
                      if (canAssignRoles) setSelectedUser(u);
                    }}
                  >
                    <TableCell className="py-2 pl-4 w-1/3">
                      <UserChip
                        id={u.id}
                        name={fullName}
                        avatarUrl={u.avatarUrl}
                        firstName={u.firstName}
                        lastName={u.lastName}
                        email={u.email}
                      />
                    </TableCell>

                    <TableCell className="w-1/3 text-tertiary">{u.jobName}</TableCell>

                    <TableCell className="w-1/3">
                      {u.roles?.length ? (
                        <div className="flex flex-wrap gap-1.5">
                          {u.roles.map((r) => (
                            <Badge key={r.id} variant="neutral" className="font-normal">
                              {r.name}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        null
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}

            {!usersLoading && !hasUsers && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={3}>
                  {/*
                    No create action: people are not added from the roles screen, so this is the one
                    empty state on a list that genuinely has nothing to offer.
                  */}
                  <ListEmptyState
                    query={query}
                    scene="team-and-org"
                    title="No people yet"
                    description="People appear here once they are added to the organization."
                    noResultsHint="Try a different name or email."
                  />
                </TableCell>
              </TableRow>
            )}
        </TableBody>
      </Table>

      {hasMore && (
        <div className="flex justify-center py-3">
          <Button type="button" variant="secondary" size="sm" onClick={onLoadMore} disabled={isLoadingMore}>
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
          }
        }}
      />
    </>
  );
}
