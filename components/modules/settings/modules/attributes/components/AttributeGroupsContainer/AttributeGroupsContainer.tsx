"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Ellipsis } from "lucide-react";

import { AttributeGroupList } from "@/components/modules/settings/modules/attributes/components/AttributeGroupsList";
import { CreateGroupModal } from "../AttributeGroup/CreateGroupModal";
import { useCreateAttributeGroupAction } from "../../hooks/AttributeGroup/useCreateAttributeGroupAction";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useAttributeGroups } from "../../hooks/AttributeGroup/useAttributeGroups";
import { useReorderAttributeGroupAction } from "../../hooks/AttributeGroup/useReorderAttributeGroupAction";
import { applyVerticalReorder, sortBySortOrder } from "../../hooks/utils/useReorderAction";
import { Button } from "@/public/desact/src/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/public/desact/src/components/ui/dropdown-menu";
import { DeleteGroupModal } from "../AttributeGroup/DeleteGroupModal";
import { AttributeGroup } from "@/models/attribute/AttributeGroup";
import { useDeleteAttributeGroupAction } from "../../hooks/AttributeGroup/useDeleteAttributeGroupAction";
import { useRenameAttributeGroupAction } from "../../hooks/AttributeGroup/useRenameAttributeGroupAction";
import { RenameAttributeGroupModal } from "../AttributeGroup/RenameAttributeGroupModal";
import { AttributesContainer } from "@/components/modules/settings/modules/attributes/components/AttributesContainer";
import { CreateAttributeModal } from "@/components/modules/settings/modules/attributes/components/Attribute/CreateAttributeModal";
import { useCreateAttributeAction } from "@/components/modules/settings/modules/attributes/hooks/Attribute/useCreateAttributeAction";
import { Loader } from "@/components/ui/Loader";

export default function AttributeGroupsContainer() {
  const [isCreateAttributeGroupModalOpen, setIsCreateAttributeGroupModalOpen] = useState(false);
  const [isDeleteAttributeGroupModalOpen, setIsDeleteAttributeGroupModalOpen] = useState(false);
  const [isRenameAttributeGroupModalOpen, setIsRenameAttributeGroupModalOpen] = useState(false);
  const [isCreateAttributeModalOpen, setIsCreateAttributeModalOpen] = useState(false);

  const createAttributeGroupAction = useCreateAttributeGroupAction();
  const createAttributeAction = useCreateAttributeAction();
  const reorderAttributeGroupAction = useReorderAttributeGroupAction();
  const deleteAttributeGroupAction = useDeleteAttributeGroupAction();
  const renameAttributeGroupAction = useRenameAttributeGroupAction();

  const [groups, setGroups] = useState<AttributeGroup[]>([]);
  const [selectedId, setSelectedId] = useState("");

  const { data: fetchedGroups, isLoading: loading } = useAttributeGroups();

  useEffect(() => {
    if (!fetchedGroups) return;

    const normalized = sortBySortOrder(fetchedGroups);
    setGroups(normalized);

    if (!selectedId || !normalized.some((g) => g.id === selectedId)) {
      setSelectedId(normalized[0]?.id ?? "");
    }
  }, [fetchedGroups]); // eslint-disable-line react-hooks/exhaustive-deps

  const selected = useMemo(
    () => groups.find((g) => g.id === selectedId) ?? groups[0],
    [groups, selectedId]
  );

  useEffect(() => {
    const status = createAttributeGroupAction.data?.status;
    if (status === ActionStatus.SUCCESS || status === ActionStatus.ERROR) {
      setIsCreateAttributeGroupModalOpen(false);
    }
  }, [createAttributeGroupAction.data?.status]);

  useEffect(() => {
    const status = createAttributeAction.data?.status;
    if (status === ActionStatus.SUCCESS || status === ActionStatus.ERROR) {
      setIsCreateAttributeModalOpen(false);
    }
  }, [createAttributeAction.data?.status]);

  useEffect(() => {
    const status = deleteAttributeGroupAction.data?.status;
    if (status === ActionStatus.SUCCESS || status === ActionStatus.ERROR) {
      setIsDeleteAttributeGroupModalOpen(false);
    }
  }, [deleteAttributeGroupAction.data?.status]);

  useEffect(() => {
    const status = renameAttributeGroupAction.data?.status;
    if (status === ActionStatus.SUCCESS || status === ActionStatus.ERROR) {
      setIsRenameAttributeGroupModalOpen(false);
    }
  }, [renameAttributeGroupAction.data?.status]);

  const onGroupsOrderChange = useCallback(
    (orderedIds: string[]) => {
      const { nextItems, changes } = applyVerticalReorder(groups, orderedIds);
      setGroups(nextItems);

      if (changes.length) {
        reorderAttributeGroupAction.mutate(changes);
      }
    },
    [groups, reorderAttributeGroupAction]
  );

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader/>
      </div>
    );
  }

  return (
    <div className="grid min-h-svh grid-cols-[280px_minmax(0,1fr)] gap-6 bg-[var(--color-bg-primary)] p-4">
      <aside className="min-h-0 overflow-auto">
        <AttributeGroupList
          groups={groups}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onCreate={() => setIsCreateAttributeGroupModalOpen(true)}
          onOrderChange={onGroupsOrderChange}
        />
      </aside>

      <main className="min-h-0 overflow-auto p-3">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <h1 className="truncate text-2xl font-semibold text-[var(--color-text-primary)]">
              {selected?.name ?? "Attributes"}
            </h1>

            {selected?.isSystem ? (
              <span className="whitespace-nowrap rounded-full bg-brown-50 px-2 py-1 text-sm text-[var(--color-text-tertiary)]">
                Preset Section
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={() => setIsCreateAttributeModalOpen(true)}>
              Add Attribute
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Attribute group actions">
                  <Ellipsis className="h-4 w-4"/>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsRenameAttributeGroupModalOpen(true)}>
                  Rename AttributeGroup
                </DropdownMenuItem>

                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setIsDeleteAttributeGroupModalOpen(true)}
                >
                  Delete AttributeGroup
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <AttributesContainer
          isLoading={loading}
          attributes={selected?.attributes ?? []}
        />
      </main>

      <CreateGroupModal
        isOpen={isCreateAttributeGroupModalOpen}
        isLoading={createAttributeGroupAction.isPending}
        onConfirmAction={(formValues) => createAttributeGroupAction.mutate({ name: formValues.name })}
        onRequestCloseAction={() => setIsCreateAttributeGroupModalOpen(false)}
      />

      <CreateAttributeModal
        isOpen={isCreateAttributeModalOpen}
        isLoading={false}
        onConfirmAction={(formValues) => {
          createAttributeAction.mutate({
            name: formValues.name,
            groupId: selected.id,
            type: formValues.type,
            isUnique: formValues.unique,
            decScale: formValues.decScale,
            hideYear: formValues.dateHideYearPublic,
            options: formValues.options,
          });
        }}
        onRequestCloseAction={() => setIsCreateAttributeModalOpen(false)}
      />

      <DeleteGroupModal
        isOpen={isDeleteAttributeGroupModalOpen}
        isLoading={deleteAttributeGroupAction.isPending}
        onConfirmAction={() => deleteAttributeGroupAction.mutate({ id: selected.id })}
        onRequestCloseAction={() => setIsDeleteAttributeGroupModalOpen(false)}
        group={selected}
      />

      <RenameAttributeGroupModal
        isOpen={isRenameAttributeGroupModalOpen}
        isLoading={renameAttributeGroupAction.isPending}
        onConfirmAction={(formValues) => {
          renameAttributeGroupAction.mutate({
            id: selected.id,
            name: formValues.name,
          });
        }}
        onRequestCloseAction={() => setIsRenameAttributeGroupModalOpen(false)}
      />
    </div>
  );
}
