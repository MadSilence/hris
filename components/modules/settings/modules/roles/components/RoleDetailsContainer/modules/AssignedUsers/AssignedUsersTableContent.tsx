"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/public/desact/src/components/ui/table";
import { Avatar, AvatarFallback } from "@/public/desact/src/components/ui/avatar";
import { Button } from "@/public/desact/src/components/ui/button";
import type { UsersSearchItemDTO } from "@/models/user/fields";
import AssignedUsersTableSkeleton from "./AssignedUsersTableSkeleton";
import RemoveAssignedUserDialog from "./modals/RemoveAssignedUserDialog";

export interface AssignedUsersTableContentProps {
  rows: UsersSearchItemDTO[];
  isLoading: boolean;
  onRemoveUser: (userId: string) => void;
}

function getInitials(firstName?: string | null, lastName?: string | null, email?: string | null) {
  const a = (firstName ?? "").trim();
  const b = (lastName ?? "").trim();
  const initials = (a ? a[0] : "") + (b ? b[0] : "");
  if (initials) return initials.toUpperCase();
  const e = (email ?? "").trim();
  return (e[0] ?? "—").toUpperCase();
}

export default function AssignedUsersTableContent({
  rows,
  isLoading,
  onRemoveUser,
}: AssignedUsersTableContentProps) {
  const hasData = rows.length > 0;

  return (
    <div>
      <Table>
        <TableHeader className="[&_tr]:border-brown-200">
          <TableRow>
            <TableHead className="w-2/3">User</TableHead>
            <TableHead className="w-1/3">Position</TableHead>
            <TableHead className="w-10"/>
          </TableRow>
        </TableHeader>
      </Table>

      <div className="max-h-[540px] overflow-y-auto">
        <Table>
          <TableBody>
            {isLoading && <AssignedUsersTableSkeleton rows={6}/>}

            {!isLoading &&
              hasData &&
              rows.map((u) => {
                const fullName = `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email;
                const initials = getInitials(u.firstName, u.lastName, u.email);
                const position =
                  (u as any).position ??
                  (u as any).title ??
                  (u as any).jobTitle ??
                  "—";

                return (
                  <TableRow key={u.id} className="group border-brown-200 hover:bg-brown-50">
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="font-medium truncate">{fullName}</div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-muted-foreground">{position}</TableCell>

                    <TableCell className="text-right">
                      <RemoveAssignedUserDialog
                        userLabel={fullName}
                        trigger={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-700"
                            aria-label="Remove user"
                            onClick={(e) => e.stopPropagation()}
                          >
                            ✕
                          </Button>
                        }
                        onConfirm={() => onRemoveUser(u.id)}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}

            {!isLoading && !hasData && (
              <TableRow>
                <TableCell colSpan={3}>
                  <div className="text-sm text-muted-foreground">No users yet</div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
