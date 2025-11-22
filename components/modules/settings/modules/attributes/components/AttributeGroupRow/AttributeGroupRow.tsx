"use client";

import React from "react";
import styles from "./AttributeGroupRow.module.css";
import { AttributeGroup } from "@/models/attribute/AttributeGroup";
import { SortableApi } from "@/components/utils/SortableRow";

export interface AttributeGroupRowProps {
  group: AttributeGroup;
  sortable: SortableApi;
  selectedId: string;
  onSelect: (id: string) => void;
}

export const AttributeGroupRow: React.FC<AttributeGroupRowProps> = ({
  group,
  sortable,
  selectedId,
  onSelect,
}) => {
  return (
    <div
      ref={sortable.setNodeRef}
      style={sortable.style}
      className={`${styles.item} ${group.id === selectedId ? styles.active : ""}`}
      onClick={() => onSelect(group.id)}
      data-testid="attribute-group-row"
    >
      <span className={styles.handle} {...sortable.attributes} {...(sortable.listeners ?? {})}>
      ⋮⋮
      </span>
      <span>{group.name}</span>
    </div>
  );
};
