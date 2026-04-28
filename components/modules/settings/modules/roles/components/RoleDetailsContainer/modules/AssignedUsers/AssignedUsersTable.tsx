"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/public/desact/src/components/ui/card";
import type { UsersSearchItemDTO } from "@/models/user/fields";
import AssignedUsersTableHeader from "./AssignedUsersTableHeader";
import AssignedUsersTableContent from "./AssignedUsersTableContent";
import {
  AddRoleRuleModal
} from "@/components/modules/settings/modules/roles/components/RoleDetailsComponent/modules/AssignedUsers/modals/AddRoleRuleModal/AddRoleRuleModal";
import {
  ExportAssignedUsersModal
} from "@/components/modules/settings/modules/roles/components/RoleDetailsContainer/modules/AssignedUsers/modals/ExportAssignedUsersModal";

export interface AssignedUsersTableProps {
  roleId: string;
  roleName?: string;
  rows: UsersSearchItemDTO[] | undefined;
  totalCount: number;
  isLoading?: boolean;
  query: string;
  onQueryChange: (v: string) => void;
  onExport: (values: { format: "csv" | "xlsx" }) => void;
  onRemoveUser: (userId: string) => void;
}

export default function AssignedUsersTable({
  roleId,
  roleName,
  rows = [],
  totalCount,
  isLoading = false,
  query,
  onQueryChange,
  onExport,
  onRemoveUser,
}: AssignedUsersTableProps) {
  const [exportOpen, setExportOpen] = useState(false);

  return (
    <>
      <Card className="border-0 gap-3">
        <CardHeader className="pt-8 px-0">
          <AssignedUsersTableHeader
            totalCount={totalCount}
            query={query}
            onQueryChange={onQueryChange}
            onExportClick={() => setExportOpen(true)}
            manageRulesTrigger={
              <AddRoleRuleModal
                isOpen={false}
                isLoading={false}
                onCancelAction={() => {
                  console.log("AddRoleRuleModal: cancel");
                }}
                onConfirmAction={(payload) => {
                  console.log("AddRoleRuleModal: confirm", payload);
                }}
              />
            }
          />
        </CardHeader>

        <CardContent className="px-0">
          <AssignedUsersTableContent rows={rows} isLoading={isLoading} onRemoveUser={onRemoveUser}/>
        </CardContent>
      </Card>

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
