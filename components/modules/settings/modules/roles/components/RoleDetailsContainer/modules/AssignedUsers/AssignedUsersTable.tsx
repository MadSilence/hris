"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/public/desact/src/components/ui/card";
import { Archive } from "lucide-react";
import type { UsersSearchItemDTO } from "@/models/user/fields";
import AssignedUsersTableHeader from "./AssignedUsersTableHeader";
import AssignedUsersTableContent from "./AssignedUsersTableContent";
import {
  AssignUsersModal
} from "@/components/modules/settings/modules/roles/components/RoleDetailsContainer/modules/AssignedUsers/modals/AssignUsersModal/AssignUsersModal";
import {
  ExportAssignedUsersModal
} from "@/components/modules/settings/modules/roles/components/RoleDetailsContainer/modules/AssignedUsers/modals/ExportAssignedUsersModal";

export interface AssignedUsersTableProps {
  roleId: string;
  roleName?: string;
  isDefaultRole?: boolean;
  isArchived?: boolean;
  rows: UsersSearchItemDTO[] | undefined;
  isLoading?: boolean;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  query: string;
  onQueryChange: (v: string) => void;
  onExport: (values: { format: "csv" | "xlsx" }) => void;
  onRemoveUser: (userId: string) => void;
}

export default function AssignedUsersTable({
  roleId,
  roleName,
  isDefaultRole = false,
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

  return (
    <>
      <Card className="border-0 gap-3">
        {/* An archived role still lists whoever held it, but it grants them nothing — say so here
            rather than letting someone assign people to it and wonder why nothing happened. */}
        {isArchived && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <Archive className="mt-0.5 h-5 w-5 shrink-0 text-amber-600"/>
            <div className="min-w-0 text-sm text-amber-800">
              <p className="font-medium">This role is archived</p>
              <p>
                It grants nothing to the people below and cannot be assigned to anyone else.
                Restore it to start using it again.
              </p>
            </div>
          </div>
        )}

        <CardHeader className="pt-2 px-0">
          <AssignedUsersTableHeader
            query={query}
            onQueryChange={onQueryChange}
            assignDisabledReason={
              isArchived ? "An archived role cannot be assigned" : undefined
            }
            onAssignClick={() => setAssignOpen(true)}
            onExportClick={() => setExportOpen(true)}
          />
        </CardHeader>

        <CardContent className="px-0">
          <AssignedUsersTableContent
            rows={rows}
            isLoading={isLoading}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={onLoadMore}
            onRemoveUser={onRemoveUser}
            disableRemove={isDefaultRole}
            emptyText={
              isArchived
                ? "Nobody holds this archived role."
                : "No users yet — use Assign to give this role to someone."
            }
          />
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
