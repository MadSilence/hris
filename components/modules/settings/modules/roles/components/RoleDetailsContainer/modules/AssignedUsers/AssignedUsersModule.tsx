"use client";

import { ErrorState } from "@/components/feedback/ErrorState";
import { useState } from "react";
import { useDebouncedValue } from "@/components/modules/organization/modules/profile/hooks/useDebouncedValue";
import { useRoleUsers } from "@/components/modules/settings/modules/roles/hooks/useRoleUsers";
import {
  useRemoveUserFromRoleAction
} from "@/components/modules/settings/modules/roles/hooks/Role/useRemoveUserFromRoleAction/useRemoveUserFromRoleAction";
import { triggerExportDownload } from "@/components/modules/settings/shared/ExportDataModal";
import AssignedUsersTable from "./AssignedUsersTable";
import type { UsersSearchItemDTO } from "@/models/user/fields";
import { AccessDenied } from "@/components/auth/AccessDenied";
import { showError } from "@/lib/errors/errorToast";
import { ForbiddenError } from "@/components/clients/exceptions";

export interface AssignedUsersModuleProps {
  roleId: string;
  roleName?: string;
  isDefaultRole?: boolean;
  isArchived?: boolean;
  isLoading?: boolean;
}

export default function AssignedUsersModule({ roleId, roleName, isDefaultRole = false, isArchived = false, isLoading = false }: AssignedUsersModuleProps) {
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
  if (error instanceof ForbiddenError) return <AccessDenied/>;
  if (error) return <ErrorState error={error} compact />;

  const rows: UsersSearchItemDTO[] = items;
  const loading = isLoading || usersLoading;

  return (
    <AssignedUsersTable
      roleId={roleId}
      roleName={roleName}
      isDefaultRole={isDefaultRole}
      isArchived={isArchived}
      rows={rows}
      isLoading={loading}
      hasMore={hasNextPage}
      isLoadingMore={isFetchingNextPage}
      onLoadMore={() => void fetchNextPage()}
      query={query}
      onQueryChange={setQuery}
      onExport={({ format }) => {
        void triggerExportDownload(`/api/roles/${roleId}/users/export`, format);
      }}
      /*
       * The refusal has to reach somebody. `mutateAsync` rejects on an ERROR envelope and nothing
       * caught it, so removing a role that the server refused — the last System Owner, an archived
       * role — did nothing at all and said nothing at all: no card, no message, no row change. By
       * the time the answer arrives the confirmation has closed, which is what makes this a card
       * rather than inline text (`hris/CLAUDE.md` § "Showing a failure").
       */
      onRemoveUser={async (userId) => {
        try {
          await removeUser.mutateAsync({ userId, roleId });
        } catch (error) {
          showError(error);
        }
      }}
    />
  );
}
