"use client";

import React, { useCallback, useEffect, useState } from "react";
import styles from "./AttributesList.module.css";
import { Attribute } from "@/models/attribute/Attribute";
import { ReorderableList } from "@/components/utils/ReorderableList";
import { applyVerticalReorder, sortBySortOrder } from "@/components/modules/settings/modules/attributes/hooks/utils/useReorderAction";
import { useReorderAttributesAction } from "@/components/modules/settings/modules/attributes/hooks/Attribute/useReorderAttributesAction";
import { AttributeRow } from "@/components/modules/settings/modules/attributes/components/AttributeRow/AttributeRow";

export interface AttributesListProps {
  attributes: Attribute[];
  selectedId: string;
  onSelect: (id: string) => void;
  onDeleteRequest: (id: string) => void;
  onSave: (id: string, patch: Partial<Attribute>) => void;
  isSaving?: boolean;
}

export const AttributesList: React.FC<AttributesListProps> = ({
  attributes,
  selectedId,
  onSelect,
  onDeleteRequest,
  onSave,
  isSaving,
}) => {
  const [items, setItems] = useState<Attribute[]>(() => sortBySortOrder(attributes));
  const reorderAttributesAction = useReorderAttributesAction();

  useEffect(() => {
    setItems(sortBySortOrder(attributes));
  }, [attributes]);

  const handleReorder = useCallback(
    (orderedIds: string[], movedId?: string) => {
      const { nextItems, changes } = applyVerticalReorder(items, orderedIds);
      setItems(nextItems);
      if (changes.length) {
        reorderAttributesAction.mutate(changes);
      }
    },
    [items, reorderAttributesAction]
  );

  return (
    <ReorderableList<Attribute>
      items={items}
      getId={(a) => a.id}
      onReorder={handleReorder}
      className={styles.list}
      RowComponent={({ item, sortable }) => (
        <AttributeRow
          attribute={item}
          sortable={sortable}
          selectedId={selectedId}
          onSelect={onSelect}
          onDeleteRequest={onDeleteRequest}
          onSave={onSave}
          isSaving={isSaving}
        />
      )}
    />
  );
};
