"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/desact/card";
import { Archive02Icon } from "@hugeicons/core-free-icons";
import { AssignmentHistoryList } from "@/components/audience/assignment/history/AssignmentHistory";
import type { UsersSearchItemDTO } from "@/models/user/fields";
import AssignedUsersTableHeader from "./AssignedUsersTableHeader";
import AssignedUsersTableContent from "./AssignedUsersTableContent";
import { AssignUsersModal } from "@/components/modules/settings/modules/roles/components/RoleDetailsContainer/modules/AssignedUsers/modals/AssignUsersModal/AssignUsersModal";
import { ExportAssignedUsersModal } from "@/components/modules/settings/modules/roles/components/RoleDetailsContainer/modules/AssignedUsers/modals/ExportAssignedUsersModal";
import { Banner } from "@/components/desact/alert";

export interface AssignedUsersTableProps {
  roleId: string;
  roleName?: string;
  isDefaultRole?: boolean;
  isSystemOwnerRole?: boolean;
  isArchived?: boolean;
  rows: UsersSearchItemDTO[] | undefined;
  isLoading?: boolean;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  query: string;
  onQueryChange: (v: string) => void;
  onExport: (values: { format: "csv" | "xlsx" }) => void;
  onRemoveUser: (userId: string) => Promise<unknown> | void;
}

export default function AssignedUsersTable({
  roleId,
  roleName,
  isDefaultRole = false,
  isSystemOwnerRole = false,
  isArchived = false,
  rows = [],
  isLoading = false,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  query,
  onQueryChange,
  onExport,
  onRemoveUser,
}: AssignedUsersTableProps) {
  const [exportOpen, setExportOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  /** Who held the role, by which rule or by hand, and when: the table's second view. */
  const [showHistory, setShowHistory] = useState(false);

  return (
    <>
      <Card className="border-0 gap-3">
        {/* Archiving took the role from everybody (WALK_QUESTIONS § 22), so the list below is empty;
            say why rather than letting someone try to assign people to it. */}
        {isArchived && (
          <Banner icon={Archive02Icon} title="This role is archived">
            Archiving took it from everyone who held it, and it cannot be assigned. Unarchive it to
            start using it again.
          </Banner>
        )}

        <CardHeader className="pt-2 px-0">
          <AssignedUsersTableHeader
            query={query}
            onQueryChange={onQueryChange}
            assignDisabledReason={isArchived ? "An archived role cannot be assigned" : undefined}
            onAssignClick={() => setAssignOpen(true)}
            onExportClick={() => setExportOpen(true)}
            showHistory={showHistory}
            onShowHistoryChange={setShowHistory}
          />
        </CardHeader>

        <CardContent className="px-0">
          {showHistory ? (
            <AssignmentHistoryList assignableType="ROLE" assignableId={roleId} />
          ) : (
            <AssignedUsersTableContent
              rows={rows}
              isLoading={isLoading}
              hasMore={hasMore}
              isLoadingMore={isLoadingMore}
              onLoadMore={onLoadMore}
              onRemoveUser={onRemoveUser}
              disableRemove={isDefaultRole}
              isSystemOwnerRole={isSystemOwnerRole}
              emptyText={
                isArchived
                  ? "Nobody holds this archived role."
                  : "No users yet — use Assign to give this role to someone."
              }
            />
          )}
        </CardContent>
      </Card>

      <AssignUsersModal
        isOpen={assignOpen}
        roleId={roleId}
        roleName={roleName}
        onCloseAction={() => setAssignOpen(false)}
      />

      <ExportAssignedUsersModal
        isOpen={exportOpen}
        isLoading={false}
        roleName={roleName ?? "Role"}
        onCancelAction={() => setExportOpen(false)}
        onConfirmAction={(values) => {
          onExport(values);
          setExportOpen(false);
        }}
      />
    </>
  );
}
