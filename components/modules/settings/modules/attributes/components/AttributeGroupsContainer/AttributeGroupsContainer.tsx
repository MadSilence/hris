"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { CreateGroupModal } from "../AttributeGroup/CreateGroupModal";
import { useCreateAttributeGroupAction } from "../../hooks/AttributeGroup/useCreateAttributeGroupAction";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useAttributeGroups, useInvalidateAttributeGroupsQuery } from "../../hooks/AttributeGroup/useAttributeGroups";
import { useReorderAttributeGroupAction } from "../../hooks/AttributeGroup/useReorderAttributeGroupAction";
import { useReorderAttributesAction } from "../../hooks/Attribute/useReorderAttributesAction";
import { sortBySortOrder } from "../../hooks/utils/useReorderAction";
import { DeleteGroupModal } from "../AttributeGroup/DeleteGroupModal";
import { AttributeGroup } from "@/models/attribute/AttributeGroup";
import { Attribute } from "@/models/attribute/Attribute";
import { useDeleteAttributeGroupAction } from "../../hooks/AttributeGroup/useDeleteAttributeGroupAction";
import { useRenameAttributeGroupAction } from "../../hooks/AttributeGroup/useRenameAttributeGroupAction";
import { RenameAttributeGroupModal } from "../AttributeGroup/RenameAttributeGroupModal";
import { CreateAttributeModal } from "@/components/modules/settings/modules/attributes/components/Attribute/CreateAttributeModal";
import { DeleteAttributeModal } from "@/components/modules/settings/modules/attributes/components/Attribute/DeleteAttributeModal";
import { useCreateAttributeAction } from "@/components/modules/settings/modules/attributes/hooks/Attribute/useCreateAttributeAction";
import { useDeleteAttributeAction } from "@/components/modules/settings/modules/attributes/hooks/Attribute/useDeleteAttributeAction";
import { useUpdateAttributeAction } from "@/components/modules/settings/modules/attributes/hooks/Attribute/useUpdateAttributeAction";
import { useUpdateAttributeOptionsAction } from "@/components/modules/settings/modules/attributes/hooks/Attribute/useUpdateAttributeOptionsAction";
import { AttributeGroupsComponent } from "@/components/modules/settings/modules/attributes/components/AttributeGroupsComponent";
import { Loader } from "@/components/ui/Loader";

export default function AttributeGroupsContainer() {
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [isCreateAttributeModalOpen, setIsCreateAttributeModalOpen] = useState(false);

  const [activeGroup, setActiveGroup] = useState<AttributeGroup | null>(null);
  const [renameGroup, setRenameGroup] = useState<AttributeGroup | null>(null);
  const [deleteGroup, setDeleteGroup] = useState<AttributeGroup | null>(null);
  const [attributeToDelete, setAttributeToDelete] = useState<Attribute | null>(null);

  const createAttributeGroupAction = useCreateAttributeGroupAction();
  const createAttributeAction = useCreateAttributeAction();
  const deleteAttributeGroupAction = useDeleteAttributeGroupAction();
  const renameAttributeGroupAction = useRenameAttributeGroupAction();
  const deleteAttributeAction = useDeleteAttributeAction();
  const updateAttributeAction = useUpdateAttributeAction();
  const updateOptionsAction = useUpdateAttributeOptionsAction();
  const reorderGroupsAction = useReorderAttributeGroupAction();
  const reorderAttributesAction = useReorderAttributesAction();
  const invalidateGroups = useInvalidateAttributeGroupsQuery();

  const { data: fetchedGroups, isLoading: loading } = useAttributeGroups();

  const groups = useMemo(
    () => sortBySortOrder(fetchedGroups ?? []),
    [fetchedGroups]
  );

  useEffect(() => {
    const status = createAttributeGroupAction.data?.status;
    if (status === ActionStatus.SUCCESS || status === ActionStatus.ERROR) {
      setIsCreateGroupModalOpen(false);
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
      setDeleteGroup(null);
    }
  }, [deleteAttributeGroupAction.data?.status]);

  useEffect(() => {
    const status = renameAttributeGroupAction.data?.status;
    if (status === ActionStatus.SUCCESS || status === ActionStatus.ERROR) {
      setRenameGroup(null);
    }
  }, [renameAttributeGroupAction.data?.status]);

  useEffect(() => {
    const status = deleteAttributeAction.data?.status;
    if (status === ActionStatus.SUCCESS || status === ActionStatus.ERROR) {
      setAttributeToDelete(null);
    }
  }, [deleteAttributeAction.data?.status]);

  const handleSaveAttribute = useCallback(
    (id: string, patch: Partial<Attribute>) => {
      const { options, ...rest } = patch as Partial<Attribute> & {
        options?: { id?: string; value: string; color: string; sortOrder?: number }[];
      };

      updateAttributeAction.mutate({ id, ...rest });

      if (Array.isArray(options) && options.length > 0) {
        updateOptionsAction.mutate({ attributeId: id, options });
      }
    },
    [updateAttributeAction, updateOptionsAction]
  );

  const handleReorderGroups = useCallback(
    (orderedIds: string[]) => {
      reorderGroupsAction.mutate(
        orderedIds.map((id, index) => ({ id, sortOrder: index + 1 })),
        { onSuccess: () => invalidateGroups() }
      );
    },
    [reorderGroupsAction, invalidateGroups]
  );

  const handleReorderAttributes = useCallback(
    (_groupId: string, orderedIds: string[]) => {
      reorderAttributesAction.mutate(
        orderedIds.map((id, index) => ({ id, sortOrder: index + 1 })),
        { onSuccess: () => invalidateGroups() }
      );
    },
    [reorderAttributesAction, invalidateGroups]
  );

  const handleMoveAttribute = useCallback(
    async (attributeId: string, targetGroupId: string, targetOrderedIds: string[]) => {
      await updateAttributeAction.mutateAsync({ id: attributeId, groupId: targetGroupId });
      await reorderAttributesAction.mutateAsync(
        targetOrderedIds.map((id, index) => ({ id, sortOrder: index + 1 }))
      );
      invalidateGroups();
    },
    [updateAttributeAction, reorderAttributesAction, invalidateGroups]
  );

  const optionsError =
    updateOptionsAction.data?.status === ActionStatus.ERROR
      ? updateOptionsAction.data?.errorMessage
      : null;

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center py-10">
        <Loader/>
      </div>
    );
  }

  return (
    <>
      {optionsError && (
        <p className="px-1 pb-3 text-sm text-destructive" role="alert">
          {optionsError}
        </p>
      )}

      <AttributeGroupsComponent
        groups={groups}
        onCreateGroup={() => setIsCreateGroupModalOpen(true)}
        onRenameGroup={setRenameGroup}
        onDeleteGroup={setDeleteGroup}
        onCreateAttribute={(group) => {
          setActiveGroup(group);
          setIsCreateAttributeModalOpen(true);
        }}
        onDeleteAttribute={setAttributeToDelete}
        onSaveAttribute={handleSaveAttribute}
        isSavingAttribute={updateAttributeAction.isPending || updateOptionsAction.isPending}
        onReorderGroups={handleReorderGroups}
        onReorderAttributes={handleReorderAttributes}
        onMoveAttribute={handleMoveAttribute}
      />

      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        isLoading={createAttributeGroupAction.isPending}
        onConfirmAction={(formValues) => createAttributeGroupAction.mutate({ name: formValues.name })}
        onRequestCloseAction={() => setIsCreateGroupModalOpen(false)}
      />

      <CreateAttributeModal
        isOpen={isCreateAttributeModalOpen}
        isLoading={createAttributeAction.isPending}
        onConfirmAction={(formValues) => {
          if (!activeGroup) return;
          createAttributeAction.mutate({
            name: formValues.name,
            groupId: activeGroup.id,
            type: formValues.type,
            isUnique: formValues.unique,
            decScale: formValues.decScale,
            hideYear: formValues.dateHideYearPublic,
            options: formValues.options,
            ...formValues.config,
          });
        }}
        onRequestCloseAction={() => setIsCreateAttributeModalOpen(false)}
      />

      <RenameAttributeGroupModal
        isOpen={!!renameGroup}
        isLoading={renameAttributeGroupAction.isPending}
        onConfirmAction={(formValues) => {
          if (!renameGroup) return;
          renameAttributeGroupAction.mutate({ id: renameGroup.id, name: formValues.name });
        }}
        onRequestCloseAction={() => setRenameGroup(null)}
      />

      <DeleteGroupModal
        isOpen={!!deleteGroup}
        isLoading={deleteAttributeGroupAction.isPending}
        onConfirmAction={() => {
          if (!deleteGroup) return;
          deleteAttributeGroupAction.mutate({ id: deleteGroup.id });
        }}
        onRequestCloseAction={() => setDeleteGroup(null)}
        group={deleteGroup as AttributeGroup}
      />

      <DeleteAttributeModal
        isOpen={!!attributeToDelete}
        isLoading={deleteAttributeAction.isPending}
        onConfirmAction={() => {
          if (!attributeToDelete) return;
          deleteAttributeAction.mutate({ id: attributeToDelete.id });
        }}
        onRequestCloseAction={() => setAttributeToDelete(null)}
        attribute={attributeToDelete as Attribute}
      />
    </>
  );
}
