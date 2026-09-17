"use client";

import { ConfirmActionModal } from "@/components/ui/ConfirmActionModal";

import { showError } from "@/lib/errors/errorToast";
import { FALLBACK_ERROR_MESSAGE, messageForError } from "@/lib/errors/errorMessages";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
import { useDuplicateAttributeAction } from "@/components/modules/settings/modules/attributes/hooks/Attribute/useDuplicateAttributeAction";
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
  const duplicateAttributeAction = useDuplicateAttributeAction();
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

  // The refusal of the open edit form, shown inside it.
  const [editAttributeError, setEditAttributeError] = useState<string | null>(null);
  /*
    The version the next write of the open attribute must carry. It starts as the version the form
    was opened with and follows the form's own writes: one save is two requests (the attribute, then
    its option set), both guarded on the attribute's version, and the first one moves it. Kept apart
    from `attributeToEdit` on purpose — replacing that object would re-seed the editor and wipe what
    was typed.
  */
  const editVersionRef = useRef<number | undefined>(undefined);

  const openEditAttribute = useCallback((attribute: Attribute) => {
    setEditAttributeError(null);
    editVersionRef.current = attribute.version;
    setAttributeToEdit(attribute);
  }, []);

  const handleSaveAttribute = useCallback(
    async (id: string, patch: AttributePatch): Promise<boolean> => {
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
        isSystem: _isSystem,
        dateHideYear,
        ...rest
      } = patch;

      setEditAttributeError(null);

      /*
        In sequence, not side by side. Fired together, the two requests raced on the attribute's
        version, and the form closed before either answered — a refusal was never seen. Now the form
        stays open until both have landed, and a refusal of either stops the save and is shown in it.
      */
      try {
        const updated = await updateAttributeAction.mutateAsync({
          id,
          ...rest,
          ...(dateHideYear == null ? {} : { dateHideYear }),
          version: editVersionRef.current,
        });
        if (updated.status === ActionStatus.ERROR) {
          setEditAttributeError(updated.errorMessage ?? FALLBACK_ERROR_MESSAGE);
          return false;
        }
        editVersionRef.current = updated.data?.version;
        // The list is driven by the *groups* query; the update hook only invalidates `attributes`,
        // so without this the saved change (a group move in particular) wouldn't show up.
        invalidateGroups();

        if (Array.isArray(options) && options.length > 0) {
          const saved = await updateOptionsAction.mutateAsync({
            attributeId: id,
            options,
            version: editVersionRef.current,
          });
          if (saved.status === ActionStatus.ERROR) {
            setEditAttributeError(saved.errorMessage ?? FALLBACK_ERROR_MESSAGE);
            return false;
          }
          invalidateGroups();
        }

        return true;
      } catch (error) {
        setEditAttributeError(messageForError(error));
        return false;
      }
    },
    [updateAttributeAction, updateOptionsAction, invalidateGroups]
  );

  // Duplicate confirms, like Archive, Delete, Unassign and Remove (ui/ACTIONS_AND_MENUS.md § 7): an
  // accidental copy goes unnoticed. The backend names the copy and places it last in the section, so
  // the dialog asks nothing but "did you mean to"; a refusal is shown inside it, which stays open.
  const [attributeToDuplicate, setAttributeToDuplicate] = useState<Attribute | null>(null);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const handleDuplicateAttribute = useCallback((attribute: Attribute) => {
    setDuplicateError(null);
    setAttributeToDuplicate(attribute);
  }, []);
  const confirmDuplicateAttribute = useCallback(() => {
    if (!attributeToDuplicate) return;
    duplicateAttributeAction.mutate(
      { id: attributeToDuplicate.id },
      {
        onSuccess: (result) => {
          if (result.status === ActionStatus.ERROR) {
            setDuplicateError(result.errorMessage ?? null);
            return;
          }
          setAttributeToDuplicate(null);
        },
        onError: (error) => showError(error),
      }
    );
  }, [attributeToDuplicate, duplicateAttributeAction]);

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

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center py-10">
        <Loader/>
      </div>
    );
  }

  return (
    <>
      {/* An option-set refusal used to be printed here, above the list, because the edit form had
          already closed. It now stays open and shows the refusal itself. */}
      <AttributeGroupsComponent
        groups={groups}
        onCreateGroup={() => setIsCreateGroupModalOpen(true)}
        onRenameGroup={setRenameGroup}
        onDeleteGroup={setDeleteGroup}
        onCreateAttribute={(group) => {
          setActiveGroup(group);
          setIsCreateAttributeModalOpen(true);
        }}
        onEditAttribute={openEditAttribute}
        onDuplicateAttribute={handleDuplicateAttribute}
        onDeleteAttribute={setAttributeToDelete}
        isSavingAttribute={
          updateAttributeAction.isPending
          || updateOptionsAction.isPending
          || duplicateAttributeAction.isPending
        }
        focusGroupId={focusGroupId}
        onFocusGroupHandled={() => setFocusGroupId(null)}
        onReorderGroups={handleReorderGroups}
        onReorderAttributes={handleReorderAttributes}
        onMoveAttribute={handleMoveAttribute}
      />

      <ConfirmActionModal
        isOpen={!!attributeToDuplicate}
        title={`Duplicate "${attributeToDuplicate?.name ?? ""}"?`}
        description="A copy of this field's definition and options is added at the end of the same section. Nobody's values are copied."
        confirmLabel="Duplicate"
        isLoading={duplicateAttributeAction.isPending}
        errorMessage={duplicateError}
        onConfirmAction={confirmDuplicateAttribute}
        onCancelAction={() => setAttributeToDuplicate(null)}
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
        onConfirmAction={(formValues) =>
          createAttributeGroupAction.mutate({
            name: formValues.name,
            description: formValues.description || null,
          })
        }
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
        isSaving={updateAttributeAction.isPending || updateOptionsAction.isPending}
        errorMessage={editAttributeError}
        onRequestCloseAction={() => {
          setEditAttributeError(null);
          setAttributeToEdit(null);
        }}
      />

      <RenameAttributeGroupModal
        isOpen={!!renameGroup}
        isLoading={renameAttributeGroupAction.isPending}
        initialName={renameGroup?.name}
        initialDescription={renameGroup?.description}
        errorMessage={
          renameAttributeGroupAction.data?.status === ActionStatus.ERROR
            ? renameAttributeGroupAction.data?.errorMessage
            : null
        }
        onConfirmAction={(formValues) => {
          if (!renameGroup) return;
          renameAttributeGroupAction.mutate({
            id: renameGroup.id,
            name: formValues.name,
            description: formValues.description || null,
            // `renameGroup` is the snapshot taken when the dialog opened, so this is that version.
            version: renameGroup.version,
          });
        }}
        onRequestCloseAction={() => {
          renameAttributeGroupAction.reset();
          setRenameGroup(null);
        }}
      />

      <DeleteGroupModal
        isOpen={!!deleteGroup}
        isLoading={deleteAttributeGroupAction.isPending}
        onConfirmAction={async () => {
          if (!deleteGroup) return;
          try {
            await deleteAttributeGroupAction.mutateAsync({ id: deleteGroup.id });
            setDeleteGroup(null);
          } catch (error) {
            showError(error);
          }
        }}
        onRequestCloseAction={() => setDeleteGroup(null)}
        group={deleteGroup as AttributeGroup}
      />

      <DeleteAttributeModal
        isOpen={!!attributeToDelete}
        isLoading={deleteAttributeAction.isPending}
        onConfirmAction={async () => {
          if (!attributeToDelete) return;
          try {
            await deleteAttributeAction.mutateAsync({ id: attributeToDelete.id });
            setAttributeToDelete(null);
          } catch (error) {
            showError(error);
          }
        }}
        onRequestCloseAction={() => setAttributeToDelete(null)}
        attribute={attributeToDelete as Attribute}
      />
    </>
  );
}
