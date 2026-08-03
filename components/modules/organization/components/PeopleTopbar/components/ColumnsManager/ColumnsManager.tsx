"use client";

import React, { useState } from "react";
import { GripVertical, Search } from "lucide-react";

import { Input } from "@/public/desact/src/components/ui/input";
import { Checkbox } from "@/public/desact/src/components/ui/checkbox";
import { Badge } from "@/public/desact/src/components/ui/badge";

import { ReorderableList } from "@/components/utils/ReorderableList/ReorderableList";
import type { SortableApi } from "@/components/utils/SortableRow";
import type { ColumnItem } from "@/models/userTable";

type ColumnsManagerProps = {
  columns: ColumnItem[];
  onChange: (next: ColumnItem[]) => void;
  pinnedId?: string;
};

export const ColumnsManager: React.FC<ColumnsManagerProps> = ({ columns, onChange, pinnedId }) => {
  const [q, setQ] = useState("");

  const toggle = (id: string, checked: boolean) =>
    onChange(columns.map((c) => (c.id === id ? { ...c, checked } : c)));

  const reorder = (orderedIds: string[]) => {
    const byId = new Map(columns.map((c) => [c.id, c]));
    onChange(orderedIds.map((id) => byId.get(id)).filter(Boolean) as ColumnItem[]);
  };

  const query = q.trim().toLowerCase();
  const filtered = query
    ? columns.filter((c) => c.label.toLowerCase().includes(query))
    : columns;

  const selectedCount = columns.filter((c) => c.checked).length;

  const renderRow = (item: ColumnItem, sortable?: SortableApi) => {
    const isPinned = item.id === pinnedId;
    const canDrag = !!sortable && !isPinned;

    return (
      <div
        ref={sortable?.setNodeRef}
        style={sortable?.style}
        className="flex items-center gap-2 rounded-md px-1.5 py-1.5 hover:bg-muted/60"
      >
        {canDrag ? (
          <button
            type="button"
            className="cursor-grab text-muted-foreground/50 hover:text-muted-foreground active:cursor-grabbing"
            aria-label="Drag to reorder"
            {...sortable!.attributes}
            {...sortable!.listeners}
          >
            <GripVertical className="h-4 w-4" />
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

        <span className="flex-1 truncate text-sm text-foreground" title={item.label}>
          {item.label}
        </span>
      </div>
    );
  };

  return (
    <div className="flex w-[280px] flex-col gap-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search columns…"
          className="h-9 pl-8"
          aria-label="Search columns"
        />
      </div>

      <div className="flex items-center justify-between px-1 text-xs font-medium text-muted-foreground">
        <span>Columns</span>
        <Badge variant="secondary" className="font-normal">
          {selectedCount}
        </Badge>
      </div>

      <div className="max-h-[320px] overflow-y-auto">
        {query ? (
          filtered.length ? (
            filtered.map((c) => <React.Fragment key={c.id}>{renderRow(c)}</React.Fragment>)
          ) : (
            <div className="px-2 py-6 text-center text-sm text-muted-foreground">No columns found</div>
          )
        ) : (
          <ReorderableList<ColumnItem>
            items={columns}
            getId={(c) => c.id}
            onReorder={reorder}
            RowComponent={({ item, sortable }) => renderRow(item, sortable)}
          />
        )}
      </div>
    </div>
  );
};

export default ColumnsManager;
