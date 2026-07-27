"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/public/desact/src/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/public/desact/src/components/ui/avatar";
import { Badge } from "@/public/desact/src/components/ui/badge";
import { Button } from "@/public/desact/src/components/ui/button";
import Link from "next/link";
import type { UsersSearchItemDTO } from "@/models/user/fields";
import AssignedUsersTableSkeleton from "./AssignedUsersTableSkeleton";
import RemoveAssignedUserDialog from "./modals/RemoveAssignedUserDialog";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { formatUserStatus, isActiveStatus } from "@/models/user/status";

export interface AssignedUsersTableContentProps {
  rows: UsersSearchItemDTO[];
  isLoading: boolean;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  onRemoveUser: (userId: string) => void;
  disableRemove?: boolean;
}

function getInitials(firstName?: string | null, lastName?: string | null, email?: string | null) {
  const a = (firstName ?? "").trim();
  const b = (lastName ?? "").trim();
  const initials = (a ? a[0] : "") + (b ? b[0] : "");
  if (initials) return initials.toUpperCase();
  const e = (email ?? "").trim();
  return (e[0] ?? "—").toUpperCase();
}

function StatusBadge({ status }: { status?: string | null }) {
  if (!status) return <span className="text-muted-foreground">—</span>;

  const label = formatUserStatus(status);
  const isActive = isActiveStatus(status);

  return (
    <Badge
      variant={isActive ? "outline" : "secondary"}
      className={isActive ? "border-green-200 bg-green-50 text-green-700" : ""}
    >
      {label}
    </Badge>
  );
}

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

export default function AssignedUsersTableContent({
  rows,
  isLoading,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  onRemoveUser,
  disableRemove = false,
}: AssignedUsersTableContentProps) {
  const hasData = rows.length > 0;

  return (
    <div className="max-h-[calc(100svh-328px)] overflow-y-auto">
      <Table>
        <TableHeader className="[&_tr]:border-brown-200 sticky top-0 z-10 bg-white">
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Added on</TableHead>
            <TableHead>Added by</TableHead>
            <TableHead className="w-10"/>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading && <AssignedUsersTableSkeleton rows={6}/>}

          {!isLoading &&
            hasData &&
            rows.map((u) => {
              const fullName = `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email;
              const initials = getInitials(u.firstName, u.lastName, u.email);

              return (
                <TableRow key={u.id} className="group border-brown-200 hover:bg-brown-50 [&_td]:py-2">
                  <TableCell className="py-2">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-7 w-7 shrink-0">
                        {u.avatarUrl ? <AvatarImage src={u.avatarUrl} alt={fullName}/> : null}
                        <AvatarFallback className="text-[11px]">{initials}</AvatarFallback>
                      </Avatar>
                      <Link
                        href={`/organization/people/${u.id}/personal`}
                        className="truncate text-sm font-medium text-foreground no-underline hover:underline"
                      >
                        {fullName}
                      </Link>
                    </div>
                  </TableCell>

                  <TableCell className="text-muted-foreground">{u.jobName || "—"}</TableCell>

                  <TableCell>
                    <StatusBadge status={u.status} />
                  </TableCell>

                  <TableCell className="text-muted-foreground">{formatDate(u.assignedAt)}</TableCell>

                  <TableCell className="text-muted-foreground">{u.assignedByName || "System"}</TableCell>

                  <TableCell className="text-right">
                    {/* Removing a role is gated by PEOPLE.PROFILE MANAGE on the backend. */}
                    <PermissionGate resource="PEOPLE.PROFILE" action="MANAGE">
                      {disableRemove ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600"
                          aria-label="Remove user"
                          disabled
                          title="The default role can't be removed"
                          onClick={(e) => e.stopPropagation()}
                        >
                          ✕
                        </Button>
                      ) : (
                        <RemoveAssignedUserDialog
                          userLabel={fullName}
                          trigger={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600 hover:text-red-700"
                              aria-label="Remove user"
                              onClick={(e) => e.stopPropagation()}
                            >
                              ✕
                            </Button>
                          }
                          onConfirm={() => onRemoveUser(u.id)}
                        />
                      )}
                    </PermissionGate>
                  </TableCell>
                </TableRow>
              );
            })}

          {!isLoading && !hasData && (
            <TableRow>
              <TableCell colSpan={6}>
                <div className="text-sm text-muted-foreground">No users yet</div>
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
    </div>
  );
}
