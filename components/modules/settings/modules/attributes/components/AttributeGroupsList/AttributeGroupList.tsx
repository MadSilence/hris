"use client";

import styles from "./AttributeGroupList.module.css";
import React from "react";
import { AttributeGroup } from "@/models/attribute/AttributeGroup";
import { Button } from "@/public/desact/src/components/ui/button";
import { ReorderableList } from "@/components/utils/ReorderableList";
import { AttributeGroupRow } from "@/components/modules/settings/modules/attributes/components/AttributeGroupRow";

export interface AttributeGroupListProps {
  groups: AttributeGroup[];
  selectedId: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onOrderChange: (ids: string[], movedId?: string) => void;
}

export const AttributeGroupList: React.FC<AttributeGroupListProps> = ({
  groups,
  selectedId,
  onSelect,
  onCreate,
  onOrderChange,
}) => {
  return (
    <div className={styles.root}>
      <div className={styles.create}>
        <Button onClick={onCreate}>
          Create a section
        </Button>
      </div>

      <ReorderableList<AttributeGroup>
        items={groups}
        getId={(group) => group.id}
        onReorder={onOrderChange}
        className={styles.list}
        RowComponent={({ item, sortable }) => (
          <AttributeGroupRow
            group={item}
            sortable={sortable}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        )}
      />
    </div>
  );
};
