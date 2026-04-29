"use client";

import { FC } from "react";
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

export const AttributeGroupList: FC<AttributeGroupListProps> = ({
  groups,
  selectedId,
  onSelect,
  onCreate,
  onOrderChange,
}) => {
  return (
    <div className="flex min-h-0 flex-col gap-4">
      <div>
        <Button onClick={onCreate}>Create a section</Button>
      </div>

      <ReorderableList<AttributeGroup>
        items={groups}
        getId={(group) => group.id}
        onReorder={onOrderChange}
        className="flex min-h-0 flex-col gap-2"
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
