"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/public/desact/src/components/ui/card";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { ChevronsDownUp, ChevronsUpDown, Search } from "lucide-react";
import { useUserFields } from "@/components/modules/organization/hooks/useUserFields/useUserFields";
import { useAttributeGroups } from "@/components/modules/settings/modules/attributes/hooks/AttributeGroup/useAttributeGroups";
import { useRoles } from "@/components/modules/settings/modules/roles/hooks/useRoles";
import { useRoleFieldAccess } from "@/components/modules/settings/modules/roles/hooks/useRoleFieldAccess";
import { useCanAccess } from "@/components/auth/useAccess";
import {
  buildFieldAccessPayload,
  diffFieldAccess,
  draftFromRows,
  EMPTY_CELL,
  enforceHierarchy,
  FieldAccessDraft,
  FieldActionLevel,
  FieldScope,
} from "@/components/modules/settings/modules/roles/utils/fieldAccessDraft";
import FieldAccessView, { buildFieldGroups } from "./FieldAccessView";
import { FieldAccessSummaryModal } from "./FieldAccessSummaryModal";

function FieldAccessSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full"/>
      ))}
    </div>
  );
}

export default function FieldAccessContainer({ roleId }: { roleId: string }) {
  const { data: fields, isLoading: fieldsLoading, error: fieldsError } = useUserFields();
  const { data: attributeGroups, isLoading: groupsLoading } = useAttributeGroups();
  const { data, isLoading: accessLoading, error: accessError, save, saving, saveError } =
    useRoleFieldAccess(roleId);
  const { data: roles } = useRoles();

  const canEdit = useCanAccess("ROLES.ROLE", "EDIT");
  const isSystemRole = (roles ?? []).find((role) => role.id === roleId)?.systemOwner ?? false;
  // Backend rejects field-access edits on a system role with RF00005.
  const readOnly = !canEdit || isSystemRole;

  const [draft, setDraft] = React.useState<FieldAccessDraft>({});
  const [query, setQuery] = React.useState("");
  const [reviewOpen, setReviewOpen] = React.useState(false);

  const groups = React.useMemo(
    () => buildFieldGroups(fields ?? [], attributeGroups),
    [fields, attributeGroups],
  );

  const [openGroups, setOpenGroups] = React.useState<string[]>([]);

  React.useEffect(() => {
    setOpenGroups(groups.map((group) => group.id));
  }, [groups]);

  const serverDraft = React.useMemo(() => draftFromRows(data?.fields), [data]);

  React.useEffect(() => {
    setDraft(serverDraft);
  }, [serverDraft]);

  const payload = React.useMemo(
    () => buildFieldAccessPayload(draft, fields),
    [draft, fields],
  );
  const serverPayload = React.useMemo(
    () => buildFieldAccessPayload(serverDraft, fields),
    [serverDraft, fields],
  );
  const isDirty = JSON.stringify(payload) !== JSON.stringify(serverPayload);

  const changes = React.useMemo(
    () => diffFieldAccess(serverDraft, draft, fields),
    [serverDraft, draft, fields],
  );

  // Wait for the attribute groups too: without them every custom field would briefly
  // fall into the ungrouped bucket.
  const isLoading = fieldsLoading || accessLoading || groupsLoading;
  const error = fieldsError ?? accessError;
  const allExpanded = openGroups.length > 0;
  const showActions = !readOnly && isDirty;

  const handleChange = (fieldId: string, scope: FieldScope, level: FieldActionLevel) => {
    setDraft((current) => ({
      ...current,
      [fieldId]: enforceHierarchy({ ...(current[fieldId] ?? EMPTY_CELL), [scope]: level }),
    }));
  };

  const handleSave = async () => {
    try {
      await save({ fields: payload });
      setReviewOpen(false);
    } catch {
      // Surfaced inside the modal via saveError.
    }
  };

  return (
    <Card className="border-0 gap-3 px-0 pt-2">
      <CardHeader className="px-0 py-0">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold">Field access</h2>
            <p className="text-sm text-muted-foreground">
              Choose which employee fields this role can see and edit.
            </p>
          </div>

          <div className="flex flex-none flex-wrap items-center gap-2">
            <div className="relative w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brown-400"/>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search field"
                className="h-9 w-[220px] pl-9"
                inputMode="search"
              />
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-brown-600"
              onClick={() => setOpenGroups(allExpanded ? [] : groups.map((group) => group.id))}
            >
              {allExpanded ? <ChevronsDownUp className="h-4 w-4"/> : <ChevronsUpDown className="h-4 w-4"/>}
              {allExpanded ? "Collapse all" : "Expand all"}
            </Button>

            {showActions && (
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
          <FieldAccessSkeleton/>
        ) : error ? (
          <p className="text-sm text-red-600">Failed to load field access.</p>
        ) : (
          <FieldAccessView
            groups={groups}
            draft={draft}
            serverDraft={serverDraft}
            readOnly={readOnly}
            readOnlyReason={
              isSystemRole
                ? "This is a system role. It always has full access, and its field access cannot be changed."
                : !canEdit
                  ? "You do not have permission to change field access."
                  : undefined
            }
            query={query}
            openGroups={openGroups}
            onOpenGroupsChange={setOpenGroups}
            onChangeAction={handleChange}
          />
        )}
      </CardContent>

      <FieldAccessSummaryModal
        isOpen={reviewOpen}
        isSaving={saving}
        errorMessage={saveError?.message}
        changes={changes}
        onCancelAction={() => setReviewOpen(false)}
        onConfirmAction={handleSave}
      />
    </Card>
  );
}
