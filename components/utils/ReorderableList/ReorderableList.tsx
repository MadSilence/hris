"use client";

import React from "react";
import { closestCenter, DndContext, DragEndEvent, DragOverlay, PointerSensor, useSensor, useSensors, } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy, } from "@dnd-kit/sortable";
import { SortableApi, SortableRow } from "@/components/utils/SortableRow";

export interface ReorderableListProps<T> {
  items: T[];
  getId: (item: T) => string;
  onReorder: (orderedIds: string[], movedId?: string) => void;
  RowComponent: React.FC<{ item: T; sortable: SortableApi }>;
  className?: string;
  OverlayComponent?: React.FC<{ item: T }>;
  getItemHeightPx?: (item: T) => number;
}

export function ReorderableList<T>({
  items,
  getId,
  onReorder,
  RowComponent,
  className,
  OverlayComponent,
}: ReorderableListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const [local, setLocal] = React.useState<T[]>([]);
  const [activeId, setActiveId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setLocal(items);
  }, [items]);

  const activeItem = React.useMemo(
    () => (activeId ? local.find((x) => getId(x) === activeId) ?? null : null),
    [activeId, local, getId]
  );

  function handleDragStart(e: any) {
    setActiveId(String(e.active.id));
  }

  function handleDragCancel() {
    setActiveId(null);
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const oldIndex = local.findIndex((x) => getId(x) === active.id);
    const newIndex = local.findIndex((x) => getId(x) === over.id);
    const next = arrayMove(local, oldIndex, newIndex);
    setLocal(next);
    onReorder(next.map(getId), String(active.id));
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragCancel={handleDragCancel}
      onDragEnd={handleDragEnd}
      autoScroll
    >
      <SortableContext items={local.map(getId)} strategy={verticalListSortingStrategy}>
        <div className={className}>
          {local.map((item) => (
            <SortableRow key={getId(item)} id={getId(item)}>
              {(sortable) => <RowComponent item={item} sortable={sortable}/>}
            </SortableRow>
          ))}
        </div>
      </SortableContext>

      <DragOverlay
        dropAnimation={{
          duration: 180,
          easing: "cubic-bezier(0.2, 0, 0, 1)",
        }}
      >
        {activeItem && OverlayComponent ? (
          <div style={{
            pointerEvents: "none",
            boxShadow: "var(--shadow-lg, 0 8px 24px rgba(0,0,0,.16))",
            borderRadius: "var(--radius-card, 12px)",
            opacity: 0.95,
          }}>
            <OverlayComponent item={activeItem}/>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
