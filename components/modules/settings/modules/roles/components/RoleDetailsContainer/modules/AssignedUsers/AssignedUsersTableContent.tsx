"use client";

import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/public/desact/src/components/ui/table";
import { Badge } from "@/public/desact/src/components/ui/badge";
import { Button } from "@/public/desact/src/components/ui/button";
import type { UsersSearchItemDTO } from "@/models/user/fields";
import AssignedUsersTableSkeleton from "./AssignedUsersTableSkeleton";
import RemoveAssignedUserDialog from "./modals/RemoveAssignedUserDialog";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { formatUserStatus, isActiveStatus } from "@/models/user/status";
import UserChip from "@/components/modules/settings/shared/UserChip/UserChip";

export interface AssignedUsersTableContentProps {
  rows: UsersSearchItemDTO[];
  isLoading: boolean;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  onRemoveUser: (userId: string) => void;
  disableRemove?: boolean;
  emptyText?: string;
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
  emptyText = "No users yet",
}: AssignedUsersTableContentProps) {
  const hasData = rows.length > 0;

  return (
    <div className="max-h-[calc(100svh-328px)] overflow-y-auto">
      <table className="w-full caption-bottom text-sm">
        <TableHeader className="[&_tr]:border-brown-200 sticky top-0 z-10 bg-white">
          <TableRow>
            <TableHead className="pl-4">User</TableHead>
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

              return (
                <TableRow key={u.id} className="group border-brown-200 hover:bg-brown-50 [&_td]:py-2">
                  <TableCell className="py-2 pl-4">
                    <UserChip
                      id={u.id}
                      name={fullName}
                      avatarUrl={u.avatarUrl}
                      firstName={u.firstName}
                      lastName={u.lastName}
                      email={u.email}
                    />
                  </TableCell>

                  <TableCell className="text-muted-foreground">{u.jobName || "—"}</TableCell>

                  <TableCell>
                    <StatusBadge status={u.status} />
                  </TableCell>

                  <TableCell className="text-muted-foreground">{formatDate(u.assignedAt)}</TableCell>

                  <TableCell className="text-muted-foreground">
                    {u.assignedByName && u.assignedByName !== "System" ? (
                      <UserChip name={u.assignedByName}/>
                    ) : (
                      "System"
                    )}
                  </TableCell>

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
                <div className="py-6 text-center text-sm text-muted-foreground">{emptyText}</div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </table>

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
