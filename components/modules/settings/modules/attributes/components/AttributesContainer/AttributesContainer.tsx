"use client";

import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { Attribute } from "@/models/attribute/Attribute";
import { AttributesList } from "../AttributesList/AttributesList";
import { DeleteAttributeModal } from "@/components/modules/settings/modules/attributes/components/Attribute/DeleteAttributeModal";
import { useDeleteAttributeAction } from "@/components/modules/settings/modules/attributes/hooks/Attribute/useDeleteAttributeAction";
import { useUpdateAttributeAction } from "@/components/modules/settings/modules/attributes/hooks/Attribute/useUpdateAttributeAction";
import { useUpdateAttributeOptionsAction } from "@/components/modules/settings/modules/attributes/hooks/Attribute/useUpdateAttributeOptionsAction";
import { ActionStatus } from "@/components/models/ActionStatus";

export interface AttributesContainerProps {
  isLoading: boolean;
  attributes: Attribute[];
}

export const AttributesContainer: FC<AttributesContainerProps> = ({
  isLoading,
  attributes,
}) => {
  const [selectedId, setSelectedId] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const deleteAttributeAction = useDeleteAttributeAction();
  const updateAttributeAction = useUpdateAttributeAction();
  const updateOptionsAction = useUpdateAttributeOptionsAction();

  useEffect(() => {
    if (selectedId && !attributes.some((a) => a.id === selectedId)) {
      setSelectedId("");
    }
  }, [attributes, selectedId]);

  useEffect(() => {
    const status = deleteAttributeAction.data?.status;
    if (status === ActionStatus.SUCCESS || status === ActionStatus.ERROR) {
      setPendingDeleteId(null);
    }
  }, [deleteAttributeAction.data?.status]);

  const attributeToDelete = useMemo(
    () => attributes.find((a) => a.id === pendingDeleteId) || null,
    [attributes, pendingDeleteId]
  );

  const handleDeleteRequest = useCallback((id: string) => {
    setPendingDeleteId(id);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (pendingDeleteId) {
      deleteAttributeAction.mutate({ id: pendingDeleteId });
    }
  }, [deleteAttributeAction, pendingDeleteId]);

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

  const optionsError =
    updateOptionsAction.data?.status === ActionStatus.ERROR
      ? updateOptionsAction.data?.errorMessage
      : null;

  return (
    <section className="min-h-0 w-full" aria-busy={isLoading}>
      {optionsError && (
        <p className="px-1 pb-3 text-sm text-destructive" role="alert">
          {optionsError}
        </p>
      )}

      <AttributesList
        attributes={attributes}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onDeleteRequest={handleDeleteRequest}
        onSave={handleSaveAttribute}
        isSaving={updateAttributeAction.isPending || updateOptionsAction.isPending}
      />

      <DeleteAttributeModal
        isOpen={!!pendingDeleteId}
        isLoading={deleteAttributeAction.isPending}
        onConfirmAction={handleConfirmDelete}
        onRequestCloseAction={() => setPendingDeleteId(null)}
        attribute={attributeToDelete as Attribute}
      />
    </section>
  );
};
