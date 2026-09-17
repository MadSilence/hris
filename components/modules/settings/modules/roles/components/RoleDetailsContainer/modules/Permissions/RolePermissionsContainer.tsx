"use client";

import { messageForError } from "@/lib/errors/errorMessages";
import { ErrorState } from "@/components/feedback/ErrorState";
import React from "react";
import { Card, CardContent, CardHeader } from "@/public/desact/src/components/ui/card";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
import { Button } from "@/public/desact/src/components/ui/button";
import { ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import { useRolePermissions } from "@/components/modules/settings/modules/roles/hooks/useRolePermissions";
import { useRoles } from "@/components/modules/settings/modules/roles/hooks/useRoles";
import { useCanAccess } from "@/components/auth/useAccess";
import { AccessAction, RESOURCE_GROUPS, ResourceCode } from "@/models/access";
import {
  buildRolePermissionsBody,
  buildRolePermissionsPayload,
  choiceToScopes,
  diffRolePermissions,
  draftFromPermissions,
  RolePermissionsDraft,
  RoleScopeFilters,
  ScopeChoice,
  scopeFiltersFromPermissions,
  scopesToChoice,
} from "@/components/modules/settings/modules/roles/utils/rolePermissionsPayload";
import RolePermissionsView from "./RolePermissionsView";
import { RolePermissionsSummaryModal } from "./RolePermissionsSummaryModal";
import { ScopeFilterModal } from "./ScopeFilterModal";
import { SearchBox } from "@/components/ui/SearchBox";

function PermissionsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full"/>
      ))}
    </div>
  );
}

export default function RolePermissionsContainer({ roleId }: { roleId: string }) {
  const { data, isLoading, error, save, saving, saveError } = useRolePermissions(roleId);
  const { data: roles, isLoading: rolesLoading } = useRoles();

  const canEdit = useCanAccess("ROLES.ROLE", "EDIT");
  const isSystemRole = (roles ?? []).find((role) => role.id === roleId)?.systemOwner ?? false;
  // The backend rejects edits of a system role with 422 SYSTEM_ROLE_NOT_EDITABLE, and its
  // permissions are bypassed anyway — a system owner is allowed everything.
  //
  // `rolesLoading` counts as read-only, and this is the interesting part. Until the list arrives
  // `isSystemRole` is `false` by default — not "unknown", *false* — so a system role rendered
  // **editable** for as long as the fetch took, and anything toggled in that window came back 422
  // on save. Offering an edit that cannot succeed is worse than making somebody wait a moment.
  const readOnly = !canEdit || isSystemRole || rolesLoading;

  const [draft, setDraft] = React.useState<RolePermissionsDraft>({});
  const [scopeFilters, setScopeFilters] = React.useState<RoleScopeFilters>({});
  // Which cell's custom filter is being edited, if any.
  const [editingCell, setEditingCell] =
    React.useState<{ resource: ResourceCode; action: AccessAction } | null>(null);
  const [reviewOpen, setReviewOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [openGroups, setOpenGroups] = React.useState<string[]>(
    RESOURCE_GROUPS.map((group) => group.id),
  );

  const allExpanded = openGroups.length > 0;
  const toggleAllGroups = () =>
    setOpenGroups(allExpanded ? [] : RESOURCE_GROUPS.map((group) => group.id));

  const serverDraft = React.useMemo(
    () => draftFromPermissions(data?.permissions ?? []),
    [data],
  );

  const serverFilters = React.useMemo(
    () => scopeFiltersFromPermissions(data?.permissions ?? []),
    [data],
  );

  React.useEffect(() => {
    setDraft(serverDraft);
    setScopeFilters(serverFilters);
  }, [serverDraft, serverFilters]);

  const payload = React.useMemo(
    () => buildRolePermissionsPayload(draft, scopeFilters),
    [draft, scopeFilters],
  );
  const serverPayload = React.useMemo(
    () => buildRolePermissionsPayload(serverDraft, serverFilters),
    [serverDraft, serverFilters],
  );
  const isDirty = JSON.stringify(payload) !== JSON.stringify(serverPayload);

  const changes = React.useMemo(
    () => diffRolePermissions(serverDraft, draft),
    [serverDraft, draft],
  );

  const handleChange = (resource: ResourceCode, action: AccessAction, choice: ScopeChoice) => {
    setDraft((current) => {
      const resourceDraft = { ...(current[resource] ?? {}) };
      const scopes = choiceToScopes(choice);

      resourceDraft[action] = scopes;

      // Actions are not hierarchical on the backend, so granting EDIT/MANAGE without VIEW
      // produces a role that cannot open a single page. Grant VIEW alongside by default;
      // it stays editable, and the row warns if it is taken away deliberately.
      const grantsHigherAccess = action !== "VIEW" && scopes.length > 0;
      const hasNoViewYet = scopesToChoice(resourceDraft.VIEW) === "NONE";

      if (grantsHigherAccess && hasNoViewYet) {
        resourceDraft.VIEW = scopes;
      }

      return { ...current, [resource]: resourceDraft };
    });
  };

  const handleSave = async () => {
    try {
      // Carries the version the grants were loaded with: a colleague's save in between is refused
      // (E00409) and the review stays open with the draft intact, instead of being overwritten.
      await save(buildRolePermissionsBody(draft, scopeFilters, data?.version));
      setReviewOpen(false);
    } catch {
      // Surfaced inside the modal via saveError.
    }
  };

  const showFooter = !readOnly && isDirty;

  return (
    <Card className="border-0 gap-3 px-0 pt-2">
      <CardHeader className="px-0 py-0">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold">Permissions</h2>
            <p className="text-sm text-muted-foreground">
              Set the access level for each resource.
            </p>
          </div>

          <div className="flex flex-none flex-wrap items-center gap-2">
            <SearchBox value={query} onChange={setQuery}/>

            <Button variant="ghost" size="sm" className="gap-1.5 text-brown-600" onClick={toggleAllGroups}>
              {allExpanded ? <ChevronsDownUp className="h-4 w-4"/> : <ChevronsUpDown className="h-4 w-4"/>}
              {allExpanded ? "Collapse all" : "Expand all"}
            </Button>

            {showFooter && (
              <>
                <Button variant="outline" onClick={() => setDraft(serverDraft)} disabled={saving}>
                  Reset
                </Button>
                <Button onClick={() => setReviewOpen(true)} disabled={saving}>
                  Review &amp; Save
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-0 pb-0 pt-0 max-h-[calc(100svh-328px)] overflow-y-auto">
        {isLoading ? (
          <PermissionsSkeleton/>
        ) : error ? (
          <ErrorState error={error} title="Permissions did not load" compact/>
        ) : (
          <RolePermissionsView
            draft={draft}
            serverDraft={serverDraft}
            readOnly={readOnly}
            query={query}
            openGroups={openGroups}
            onOpenGroupsChange={setOpenGroups}
            readOnlyReason={
              isSystemRole
                ? "This is a system role. It always has full access, and its permissions cannot be changed."
                : !canEdit
                  ? "You do not have permission to change role permissions."
                  : undefined
            }
            onChangeAction={handleChange}
            scopeFilters={scopeFilters}
            onEditFilters={(resource, action) => setEditingCell({ resource, action })}
          />
        )}
      </CardContent>

      {editingCell && (
        <ScopeFilterModal
          isOpen
          grantLabel={`${editingCell.resource} · ${editingCell.action}`}
          value={scopeFilters[editingCell.resource]?.[editingCell.action]}
          onCancelAction={() => setEditingCell(null)}
          onConfirmAction={(segment) => {
            setScopeFilters((current) => ({
              ...current,
              [editingCell.resource]: {
                ...(current[editingCell.resource] ?? {}),
                [editingCell.action]: segment,
              },
            }));
            setEditingCell(null);
          }}
        />
      )}

      <RolePermissionsSummaryModal
        isOpen={reviewOpen}
        isSaving={saving}
        errorMessage={saveError ? messageForError(saveError) : undefined}
        changes={changes}
        onCancelAction={() => setReviewOpen(false)}
        onConfirmAction={handleSave}
      />
    </Card>
  );
}
