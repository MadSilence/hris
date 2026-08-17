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
import { Attribute, AttributePatch } from "@/models/attribute/Attribute";
import { AttributeType } from "@/models/attribute/AttributeType";
import { serializeObjectFields } from "@/models/attribute/objectFields";
import { useDeleteAttributeGroupAction } from "../../hooks/AttributeGroup/useDeleteAttributeGroupAction";
import { useRenameAttributeGroupAction } from "../../hooks/AttributeGroup/useRenameAttributeGroupAction";
import { RenameAttributeGroupModal } from "../AttributeGroup/RenameAttributeGroupModal";
import { CreateAttributeModal } from "@/components/modules/settings/modules/attributes/components/Attribute/CreateAttributeModal";
import { EditAttributeModal } from "@/components/modules/settings/modules/attributes/components/Attribute/EditAttributeModal";
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
  const [attributeToEdit, setAttributeToEdit] = useState<Attribute | null>(null);
  const [attributeToDelete, setAttributeToDelete] = useState<Attribute | null>(null);
  // Group just created — the list scrolls to it and opens it (it lands at the very end).
  const [focusGroupId, setFocusGroupId] = useState<string | null>(null);

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

  // Close only on success. Closing on ERROR too is what made a duplicate name look like a no-op:
  // the request failed, the message existed, and the modal was already gone.
  useEffect(() => {
    if (createAttributeGroupAction.data?.status === ActionStatus.SUCCESS) {
      setIsCreateGroupModalOpen(false);
      setFocusGroupId(createAttributeGroupAction.data?.data?.id ?? null);
    }
  }, [createAttributeGroupAction.data]);

  useEffect(() => {
    if (createAttributeAction.data?.status === ActionStatus.SUCCESS) {
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
    if (renameAttributeGroupAction.data?.status === ActionStatus.SUCCESS) {
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
    (id: string, patch: AttributePatch) => {
      // Server-owned fields ride along in the patch (it is a `Partial<Attribute>`) but are not part
      // of the update contract — drop them instead of putting them on the wire.
      const {
        options,
        createdAt: _createdAt,
        updatedAt: _updatedAt,
        createdBy: _createdBy,
        updatedBy: _updatedBy,
        version: _version,
        companyId: _companyId,
        sortOrder: _sortOrder,
        system: _system,
        dateHideYear,
        ...rest
      } = patch;

      // The list is driven by the *groups* query; the update hook only invalidates `attributes`,
      // so without this the saved change (a group move in particular) wouldn't show up.
      updateAttributeAction.mutate(
        { id, ...rest, ...(dateHideYear == null ? {} : { dateHideYear }) },
        { onSuccess: () => invalidateGroups() }
      );

      if (Array.isArray(options) && options.length > 0) {
        updateOptionsAction.mutate(
          { attributeId: id, options },
          { onSuccess: () => invalidateGroups() }
        );
      }
    },
    [updateAttributeAction, updateOptionsAction, invalidateGroups]
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
        onEditAttribute={setAttributeToEdit}
        onDeleteAttribute={setAttributeToDelete}
        isSavingAttribute={updateAttributeAction.isPending || updateOptionsAction.isPending}
        focusGroupId={focusGroupId}
        onFocusGroupHandled={() => setFocusGroupId(null)}
        onReorderGroups={handleReorderGroups}
        onReorderAttributes={handleReorderAttributes}
        onMoveAttribute={handleMoveAttribute}
      />

      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        isLoading={createAttributeGroupAction.isPending}
        existingNames={groups.map((g) => g.name)}
        errorMessage={
          createAttributeGroupAction.data?.status === ActionStatus.ERROR
            ? createAttributeGroupAction.data?.errorMessage
            : null
        }
        onConfirmAction={(formValues) => createAttributeGroupAction.mutate({ name: formValues.name })}
        onRequestCloseAction={() => {
          createAttributeGroupAction.reset();
          setIsCreateGroupModalOpen(false);
        }}
      />

      <CreateAttributeModal
        isOpen={isCreateAttributeModalOpen}
        isLoading={createAttributeAction.isPending}
        existingNames={(activeGroup?.attributes ?? []).map((a) => a.name)}
        errorMessage={
          createAttributeAction.data?.status === ActionStatus.ERROR
            ? createAttributeAction.data?.errorMessage
            : null
        }
        onConfirmAction={(formValues) => {
          if (!activeGroup) return;
          createAttributeAction.mutate({
            name: formValues.name,
            groupId: activeGroup.id,
            type: formValues.type,
            isUnique: formValues.unique,
            sensitive: formValues.sensitive,
            decScale: formValues.decScale,
            hideYear: formValues.dateHideYearPublic,
            options: formValues.options,
            objectFields:
              formValues.type === AttributeType.OBJECT
                ? serializeObjectFields(formValues.objectFields ?? [])
                : undefined,
            ...formValues.config,
          });
        }}
        onRequestCloseAction={() => {
          createAttributeAction.reset();
          setIsCreateAttributeModalOpen(false);
        }}
      />

      <EditAttributeModal
        attribute={attributeToEdit}
        groups={groups}
        isOpen={!!attributeToEdit}
        onSaveAction={handleSaveAttribute}
        onRequestCloseAction={() => setAttributeToEdit(null)}
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
