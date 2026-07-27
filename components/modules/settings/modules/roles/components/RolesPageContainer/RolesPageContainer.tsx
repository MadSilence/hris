"use client";

import React from "react";
import { useRoles } from "@/components/modules/settings/modules/roles/hooks/useRoles";
import { usePeopleSearchInfinite } from "@/components/modules/organization/hooks/usePeopleSearch";
import { useDebouncedValue } from "@/components/modules/organization/modules/profile/hooks/useDebouncedValue";
import {
  useCreateRoleAction
} from "@/components/modules/settings/modules/roles/hooks/Role/useCreateRoleAction/useCreateRoleAction";
import {
  useRenameRoleAction
} from "@/components/modules/settings/modules/roles/hooks/Role/useRenameRoleAction/useRenameRoleAction";
import {
  useDuplicateRoleAction
} from "@/components/modules/settings/modules/roles/hooks/Role/useDuplicateRoleAction/useDuplicateRoleAction";
import {
  useDeleteRoleAction
} from "@/components/modules/settings/modules/roles/hooks/Role/useDeleteRoleAction/useDeleteRoleAction";
import {
  useAssignUserRolesAction
} from "@/components/modules/settings/modules/roles/hooks/Role/useAssignUserRolesAction/useAssignUserRolesAction";
import RolesPageView, { RolesTableView } from "./RolesPageView";

const PAGE_SIZE = 50;

const errorMessageOf = (error: unknown) =>
  error instanceof Error ? error.message : undefined;

const RolesPageContainer: React.FC = () => {
  const [view, setView] = React.useState<RolesTableView>("roles");
  const [query, setQuery] = React.useState("");

  const trimmedQuery = query.trim();
  const debouncedQuery = useDebouncedValue(trimmedQuery, 300);
  const userSearchQuery = view === "users" && debouncedQuery.length >= 2 ? debouncedQuery : null;

  const { data: roles, isLoading: rolesLoading, error: rolesError } = useRoles();

  const {
    items: userRows,
    isLoading: usersLoading,
    error: peopleError,
    hasNextPage: hasMoreUsers,
    fetchNextPage: fetchMoreUsers,
    isFetchingNextPage: isLoadingMoreUsers,
  } = usePeopleSearchInfinite({
    limit: PAGE_SIZE,
    q: userSearchQuery,
    sortField: "last_name",
    sortDir: "asc",
    selectedFields: null,
    filters: null,
  });

  const createRole = useCreateRoleAction();
  const renameRole = useRenameRoleAction();
  const duplicateRole = useDuplicateRoleAction();
  const deleteRole = useDeleteRoleAction();
  const assignUserRoles = useAssignUserRolesAction();

  if (rolesError) throw rolesError;
  if (peopleError) throw peopleError;

  // Roles are fully loaded, so filter them on the client by name.
  const filteredRoles = React.useMemo(() => {
    if (view !== "roles" || trimmedQuery.length < 1) return roles;
    const needle = trimmedQuery.toLowerCase();
    return (roles ?? []).filter((role) => role.name.toLowerCase().includes(needle));
  }, [roles, view, trimmedQuery]);

  return (
    <RolesPageView
      view={view}
      onViewChange={setView}
      query={query}
      onQueryChange={setQuery}
      roleRows={filteredRoles}
      userRows={userRows}
      rolesLoading={rolesLoading}
      usersLoading={usersLoading}
      hasMoreUsers={hasMoreUsers}
      isLoadingMoreUsers={isLoadingMoreUsers}
      onLoadMoreUsers={() => void fetchMoreUsers()}
      onCreateRole={async (values) => {
        await createRole.mutateAsync({ name: values.name });
      }}
      onRenameRole={async (roleId, values) => {
        await renameRole.mutateAsync({
          id: roleId,
          name: values.name,
          description: roles?.find((role) => role.id === roleId)?.description,
        });
      }}
      onDuplicateRole={async (roleId, values) => {
        await duplicateRole.mutateAsync({ id: roleId, name: values.name });
      }}
      onDeleteRole={async (roleId) => {
        await deleteRole.mutateAsync({ id: roleId });
      }}
      onApplyRoles={async (userId, roleIds, currentRoleIds) => {
        await assignUserRoles.mutateAsync({ userId, roleIds, currentRoleIds });
      }}
      isCreatingRole={createRole.isPending}
      isSavingRoleName={renameRole.isPending || duplicateRole.isPending}
      isDeletingRole={deleteRole.isPending}
      isAssigningRoles={assignUserRoles.isPending}
      createRoleErrorMessage={errorMessageOf(createRole.error)}
      saveRoleNameErrorMessage={errorMessageOf(renameRole.error ?? duplicateRole.error)}
      deleteRoleErrorMessage={errorMessageOf(deleteRole.error)}
      assignRolesErrorMessage={errorMessageOf(assignUserRoles.error)}
      onClearErrors={() => {
        renameRole.reset();
        duplicateRole.reset();
        deleteRole.reset();
      }}
    />
  );
};

export default RolesPageContainer;
