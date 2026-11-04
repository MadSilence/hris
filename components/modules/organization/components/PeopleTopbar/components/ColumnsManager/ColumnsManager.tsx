"use client";

import React, { useMemo, useState } from "react";
import { DragDropVerticalIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

import { Input } from "@/components/desact/input";
import { Checkbox } from "@/components/desact/checkbox";
import { Badge } from "@/components/desact/badge";

import { ReorderableList } from "@/components/utils/ReorderableList/ReorderableList";
import type { SortableApi } from "@/components/utils/SortableRow";
import type { ColumnItem } from "@/models/userTable";
import {
  reorderChecked,
  toggleColumn,
} from "@/components/modules/organization/components/PeopleTopbar/components/ColumnsManager/columnOrder";

type ColumnsManagerProps = {
  columns: ColumnItem[];
  onChange: (next: ColumnItem[]) => void;
  pinnedId?: string;
};

/**
 * Chosen columns sit at the top, in the order the table uses, and only they can be dragged: order
 * means nothing for a column that is not shown, and a grip handle on one is an invitation to a
 * change that does not happen.
 */
export const ColumnsManager: React.FC<ColumnsManagerProps> = ({ columns, onChange, pinnedId }) => {
  const [q, setQ] = useState("");

  const toggle = (id: string, checked: boolean) =>
    onChange(toggleColumn(columns, id, checked, pinnedId));

  const reorder = (orderedIds: string[]) =>
    onChange(reorderChecked(columns, orderedIds, pinnedId));

  const query = q.trim().toLowerCase();
  const matches = (c: ColumnItem) => !query || c.label.toLowerCase().includes(query);

  const { pinned, draggable, hidden } = useMemo(() => {
    const shown = columns.filter((c) => c.checked);
    return {
      pinned: shown.filter((c) => c.id === pinnedId),
      draggable: shown.filter((c) => c.id !== pinnedId),
      hidden: columns.filter((c) => !c.checked),
    };
  }, [columns, pinnedId]);

  const selectedCount = pinned.length + draggable.length;

  const visibleDraggable = draggable.filter(matches);
  const visibleHidden = hidden.filter(matches);
  const nothingFound = query && !pinned.some(matches) && !visibleDraggable.length && !visibleHidden.length;

  const renderRow = (item: ColumnItem, sortable?: SortableApi) => {
    const isPinned = item.id === pinnedId;

    return (
      <div
        ref={sortable?.setNodeRef}
        style={sortable?.style}
        className="flex items-center gap-2 rounded-control px-1.5 py-1.5 hover:bg-mist/60"
      >
        {sortable ? (
          <button
            type="button"
            className="cursor-grab text-tertiary/50 hover:text-tertiary active:cursor-grabbing"
            aria-label="Drag to reorder"
            {...sortable.attributes}
            {...sortable.listeners}
          >
            <Icon icon={DragDropVerticalIcon} size="sm" />
          </button>
        ) : (
          <span className="w-4 shrink-0" />
        )}

        <Checkbox
          checked={item.checked}
          disabled={isPinned}
          onCheckedChange={(v) => toggle(item.id, v === true)}
          aria-label={`Toggle ${item.label}`}
        />

        <span className="flex-1 truncate text-body text-primary" title={item.label}>
          {item.label}
        </span>
      </div>
    );
  };

  return (
    <div className="flex w-[280px] flex-col gap-2">
      <div className="relative">
        <Icon icon={Search01Icon} size="sm" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-tertiary" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search"
          className="h-9 pl-8"
          aria-label="Search columns"
        />
      </div>

      <div className="flex items-center justify-between px-1 text-hint font-medium text-tertiary">
        <span>Shown</span>
        <Badge variant="neutral" className="font-normal">
          {selectedCount}
        </Badge>
      </div>

      <div className="max-h-[320px] overflow-y-auto">
        {pinned.filter(matches).map((c) => (
          <React.Fragment key={c.id}>{renderRow(c)}</React.Fragment>
        ))}

        {/*
          * Dragging is disabled while searching: the list on screen is a subset, and dropping a row
          * inside it would reorder against neighbours the person cannot see.
          */}
        {query ? (
          visibleDraggable.map((c) => <React.Fragment key={c.id}>{renderRow(c)}</React.Fragment>)
        ) : (
          <ReorderableList<ColumnItem>
            items={draggable}
            getId={(c) => c.id}
            onReorder={reorder}
            RowComponent={({ item, sortable }) => renderRow(item, sortable)}
          />
        )}

        {visibleHidden.length ? (
          <>
            <div className="mt-2 px-1 pb-1 pt-2 text-hint font-medium text-tertiary">
              Available
            </div>
            {visibleHidden.map((c) => (
              <React.Fragment key={c.id}>{renderRow(c)}</React.Fragment>
            ))}
          </>
        ) : null}

        {nothingFound ? (
          <div className="px-2 py-6 text-center text-body text-tertiary">No columns found</div>
        ) : null}
      </div>
    </div>
  );
};

export default ColumnsManager;
