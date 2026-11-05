"use client";

import { useTranslations } from "next-intl";
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/desact/table";
import { Button } from "@/components/desact/button";
import type { UsersSearchItemDTO } from "@/models/user/fields";
import AssignedUsersTableSkeleton from "./AssignedUsersTableSkeleton";
import RemoveAssignedUserDialog from "./modals/RemoveAssignedUserDialog";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { type DateFormatter, useDateFormatter } from "@/lib/date";
import UserChip from "@/components/modules/settings/shared/UserChip/UserChip";
import { UserStatusBadge } from "@/components/ui/StatusBadge";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider/CurrentUserProvider";

export interface AssignedUsersTableContentProps {
  rows: UsersSearchItemDTO[];
  isLoading: boolean;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  onRemoveUser: (userId: string) => Promise<unknown> | void;
  disableRemove?: boolean;
  /** Removing yourself from it ends your own session, and the dialog says so. */
  isSystemOwnerRole?: boolean;
  emptyText?: string;
}


function formatDate(iso: string | null | undefined, formatDisplayDate: DateFormatter) {
  return iso ? formatDisplayDate(iso, { style: "medium" }) : "";
}

export default function AssignedUsersTableContent({
  rows,
  isLoading,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  onRemoveUser,
  disableRemove = false,
  isSystemOwnerRole = false,
  emptyText,
}: AssignedUsersTableContentProps) {
  const t = useTranslations("settings");
  const formatDisplayDate = useDateFormatter();
  const tCommon = useTranslations("common");
  const { userId: currentUserId } = useCurrentUser();
  const hasData = rows.length > 0;

  return (
    <div className="max-h-[calc(100svh-328px)] overflow-y-auto">
      <table className="w-full caption-bottom text-body">
        <TableHeader className="[&_tr]:border-divider sticky top-0 z-10 bg-card">
          <TableRow>
            <TableHead className="pl-4">{t("roles.assigned.columns.user")}</TableHead>
            <TableHead>{t("roles.assigned.columns.position")}</TableHead>
            <TableHead>{tCommon("fields.status")}</TableHead>
            <TableHead>{t("roles.assigned.columns.addedOn")}</TableHead>
            <TableHead>{t("roles.assigned.columns.addedBy")}</TableHead>
            <TableHead className="w-10"/>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading && <AssignedUsersTableSkeleton rows={6}/>}

          {!isLoading &&
            hasData &&
            rows.map((u) => {
              const fullName =
                `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email || t("roles.assigned.unnamed");

              return (
                <TableRow key={u.id} className="group border-divider hover:bg-subtle [&_td]:py-2">
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

                  <TableCell className="text-tertiary">{u.jobName}</TableCell>

                  <TableCell>
                    <UserStatusBadge status={u.status}/>
                  </TableCell>

                  <TableCell className="text-tertiary">{formatDate(u.assignedAt, formatDisplayDate)}</TableCell>

                  <TableCell className="text-tertiary">
                    {/* i18n-exempt: the backend's marker for an assignment nobody made by hand */}
                    {/* i18n-exempt: the backend's marker for an assignment nobody made by hand */}
                    {u.assignedByName && u.assignedByName !== "System" ? (
                      <UserChip name={u.assignedByName}/>
                    ) : (
                      t("roles.assigned.system")
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    {/* Removing a role is gated by PEOPLE.PROFILE MANAGE on the backend. */}
                    <PermissionGate resource="PEOPLE.PROFILE" action="MANAGE">
                      {disableRemove ? (
                        <Button type="button"
                          variant="ghost"
                          size="icon"
                          className="text-danger-text"
                          aria-label={t("roles.assigned.removeUser")}
                          disabled
                          title={t("roles.assigned.defaultCannotRemove")}
                          onClick={(e) => e.stopPropagation()}
                        >
                          ✕
                        </Button>
                      ) : (
                        <RemoveAssignedUserDialog
                          userLabel={fullName}
                          removingOwnOwnerRole={isSystemOwnerRole && u.id === currentUserId}
                          trigger={
                            <Button type="button"
                              variant="ghost"
                              size="icon"
                              className="text-danger-text hover:text-status-declined-text"
                              aria-label={t("roles.assigned.removeUser")}
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
                <div className="py-6 text-center text-body text-tertiary">{emptyText ?? t("roles.assigned.emptyDefault")}</div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </table>

      {hasMore && (
        <div className="flex justify-center py-3">
          <Button type="button" variant="secondary" size="sm" onClick={onLoadMore} disabled={isLoadingMore}>
            {isLoadingMore ? tCommon("states.loading") : t("roles.assigned.loadMore")}
          </Button>
        </div>
      )}
    </div>
  );
}
