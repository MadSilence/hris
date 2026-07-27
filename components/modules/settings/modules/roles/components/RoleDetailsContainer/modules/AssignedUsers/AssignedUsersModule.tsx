"use client";

import { useState } from "react";
import { useDebouncedValue } from "@/components/modules/organization/modules/profile/hooks/useDebouncedValue";
import { useRoleUsers } from "@/components/modules/settings/modules/roles/hooks/useRoleUsers";
import {
  useRemoveUserFromRoleAction
} from "@/components/modules/settings/modules/roles/hooks/Role/useRemoveUserFromRoleAction/useRemoveUserFromRoleAction";
import AssignedUsersTable from "./AssignedUsersTable";
import type { UsersSearchItemDTO } from "@/models/user/fields";

export interface AssignedUsersModuleProps {
  roleId: string;
  roleName?: string;
  isDefaultRole?: boolean;
  isLoading?: boolean;
}

export default function AssignedUsersModule({ roleId, roleName, isDefaultRole = false, isLoading = false }: AssignedUsersModuleProps) {
  const [query, setQuery] = useState("");
  const debouncedQ = useDebouncedValue(query.trim(), 300);
  const qForApi = debouncedQ.length >= 2 ? debouncedQ : null;

  const {
    items,
    isLoading: usersLoading,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useRoleUsers(roleId, qForApi);
  const removeUser = useRemoveUserFromRoleAction();

  if (error) throw error;

  const rows: UsersSearchItemDTO[] = items;
  const loading = isLoading || usersLoading;

  return (
    <AssignedUsersTable
      roleId={roleId}
      roleName={roleName}
      isDefaultRole={isDefaultRole}
      rows={rows}
      isLoading={loading}
      hasMore={hasNextPage}
      isLoadingMore={isFetchingNextPage}
      onLoadMore={() => void fetchNextPage()}
      query={query}
      onQueryChange={setQuery}
      onExport={() => {
      }}
      onRemoveUser={(userId) => {
        void removeUser.mutateAsync({ userId, roleId });
      }}
    />
  );
}
