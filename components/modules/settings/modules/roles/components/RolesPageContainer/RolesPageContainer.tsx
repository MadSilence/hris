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
import {
  useArchiveRoleAction
} from "@/components/modules/settings/modules/roles/hooks/Role/useArchiveRoleAction/useArchiveRoleAction";
import { triggerExportDownload } from "@/components/modules/settings/shared/ExportDataModal";
import { ErrorState } from "@/components/feedback/ErrorState";
import { AccessDenied } from "@/components/auth/AccessDenied";
import { ForbiddenError } from "@/components/clients/exceptions";
import RolesPageView, { RolesTableView } from "./RolesPageView";

const PAGE_SIZE = 50;

const errorMessageOf = (error: unknown) =>
  error instanceof Error ? error.message : undefined;

const RolesPageContainer: React.FC = () => {
  const [view, setView] = React.useState<RolesTableView>("roles");
  const [query, setQuery] = React.useState("");
  const [showArchived, setShowArchived] = React.useState(false);

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
  const archiveRole = useArchiveRoleAction();
  const assignUserRoles = useAssignUserRolesAction();

  const archivedRoleCount = React.useMemo(
    () => (roles ?? []).filter((role) => role.archived).length,
    [roles],
  );

  /*
    What the roles table shows: the archived view or everything else, narrowed by the search.

    Archived roles used to be listed alongside active ones and marked with a badge, on the argument
    that a role granting nothing to the people who hold it is what an admin needs to notice. The
    toggle answers that better — it is one tap, it carries the count, and the list stops mixing two
    states. Rule: `technical_documentation/ui/ACTIONS_AND_MENUS.md` § 5.
  */
  const roleTableRows = React.useMemo(() => {
    let rows = (roles ?? []).filter((role) => (showArchived ? role.archived : !role.archived));
    if (view === "roles" && trimmedQuery.length >= 1) {
      const needle = trimmedQuery.toLowerCase();
      rows = rows.filter((role) => role.name.toLowerCase().includes(needle));
    }
    return rows;
  }, [roles, view, trimmedQuery, showArchived]);

  // Below the hooks, and rendered rather than thrown. These two were `throw rolesError` /
  // `throw peopleError` higher up: the boundary they reached replaces the page and discards the
  // message, so a 403 on the people list and a dead backend produced the same generic sentence.
  const failure = rolesError ?? peopleError;
  if (failure instanceof ForbiddenError) return <AccessDenied/>;
  if (failure) return <ErrorState error={failure} title="Roles could not be loaded"/>;

  return (
    <RolesPageView
      view={view}
      onViewChange={setView}
      query={query}
      onQueryChange={setQuery}
      roleRows={roleTableRows}
      /*
        Every role, unfiltered. The assign-roles form needs the archived ones so a person can be
        taken off them, and the name-collision check needs the ones the search is hiding — it used
        to read the filtered list, so typing in the search box let a duplicate name through.
      */
      allRoles={roles ?? []}
      archivedRoleCount={archivedRoleCount}
      showArchived={showArchived}
      onShowArchivedChange={setShowArchived}
      userRows={userRows}
      rolesLoading={rolesLoading}
      usersLoading={usersLoading}
      hasMoreUsers={hasMoreUsers}
      isLoadingMoreUsers={isLoadingMoreUsers}
      onLoadMoreUsers={() => void fetchMoreUsers()}
      onCreateRole={async (values) => {
        await createRole.mutateAsync({ name: values.name, description: values.description });
      }}
      onRenameRole={async (roleId, values) => {
        await renameRole.mutateAsync({
          id: roleId,
          name: values.name,
          description: values.description,
          version: values.version,
        });
      }}
      onDuplicateRole={async (roleId, values) => {
        await duplicateRole.mutateAsync({ id: roleId, name: values.name });
      }}
      onDeleteRole={async (roleId) => {
        await deleteRole.mutateAsync({ id: roleId });
      }}
      onArchiveRole={async (roleId, archived) => {
        await archiveRole.mutateAsync({ id: roleId, archived });
      }}
      onExportRoles={({ format }) => {
        void triggerExportDownload("/api/roles/export", format);
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
