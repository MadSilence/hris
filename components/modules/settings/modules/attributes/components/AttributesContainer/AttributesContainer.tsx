"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./AttributesContainer.module.css";
import { Attribute } from "@/models/attribute/Attribute";
import { AttributesList } from "../AttributesList/AttributesList";
import { DeleteAttributeModal } from "@/components/modules/settings/modules/attributes/components/Attribute/DeleteAttributeModal";
import { useDeleteAttributeAction } from "@/components/modules/settings/modules/attributes/hooks/Attribute/useDeleteAttributeAction";
import { useUpdateAttributeAction } from "@/components/modules/settings/modules/attributes/hooks/Attribute/useUpdateAttributeAction";
import { ActionStatus } from "@/components/models/ActionStatus";

export interface AttributesContainerProps {
  isLoading: boolean;
  attributes: Attribute[];
}

export const AttributesContainer: React.FC<AttributesContainerProps> = ({
  isLoading,
  attributes,
}) => {
  const [selectedId, setSelectedId] = useState<string>("");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const deleteAttributeAction = useDeleteAttributeAction();
  const updateAttributeAction = useUpdateAttributeAction();

  useEffect(() => {
    if (selectedId && !attributes.some(a => a.id === selectedId)) {
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
    () => attributes.find(a => a.id === pendingDeleteId) || null,
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
      updateAttributeAction.mutate({ id, ...patch });
    },
    [updateAttributeAction]
  );

  return (
    <section className={styles.section} aria-busy={isLoading}>
      <AttributesList
        attributes={attributes}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onDeleteRequest={handleDeleteRequest}
        onSave={handleSaveAttribute}
        isSaving={updateAttributeAction.isPending}
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
