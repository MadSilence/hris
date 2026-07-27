"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/public/desact/src/components/ui/card";
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
        <CardHeader className="pt-2 px-0">
          <AssignedUsersTableHeader
            query={query}
            onQueryChange={onQueryChange}
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
