"use client";

import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/public/desact/src/components/ui/table";
import UsersRolesTableSkeleton from "./UsersRolesTableSkeleton";
import { Avatar, AvatarFallback } from "@/public/desact/src/components/ui/avatar";
import { Role } from "@/models/role/Role";
import AssignRolesModal from "./modals/AssignRolesModal";
import { UsersSearchItemDTO } from "@/models/user/fields";


export interface UsersRolesTableProps {
  userRows?: UsersSearchItemDTO[];
  usersLoading: boolean;
  allRoles: Role[];
  onApplyRoles?: (userId: string, roleIds: string[]) => void; // позже сюда подключишь мутацию
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
}: UsersRolesTableProps) {
  const hasUsers = (userRows?.length ?? 0) > 0;
  const [selectedUser, setSelectedUser] =
    React.useState<UsersSearchItemDTO | null>(null);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/2">User</TableHead>
            <TableHead className="w-1/2">Assigned Roles</TableHead>
          </TableRow>
        </TableHeader>
      </Table>

      {/* Scrollable body */}
      <div className="max-h-[580px] overflow-y-auto">
        <Table>
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
                    className="border-brown-200 cursor-pointer hover:bg-brown-50"
                    onClick={() => setSelectedUser(u)}
                  >
                    <TableCell className="py-3 w-1/2">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <p className="font-medium">{fullName}</p>
                      </div>
                    </TableCell>

                    <TableCell className="text-muted-foreground w-1/2">
                      {u.roles?.length
                        ? u.roles.map((r) => r.name).join(", ")
                        : "—"}
                    </TableCell>
                  </TableRow>
                );
              })}

            {!usersLoading && !hasUsers && (
              <TableRow>
                <TableCell colSpan={2}>
                  <div className="text-sm text-muted-foreground">
                    No users yet
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AssignRolesModal
        isOpen={!!selectedUser}
        user={selectedUser}
        allRoles={allRoles}
        isLoading={false}
        onRequestClose={() => setSelectedUser(null)}
        onApply={(userId, roleIds) => {
          onApplyRoles?.(userId, roleIds);
          setSelectedUser(null);
        }}
      />
    </>
  );
}
