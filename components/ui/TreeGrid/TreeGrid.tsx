"use client";
import React, { useCallback, useMemo, useState } from "react";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import styles from "./TreeGrid.module.css";
import { TreeGridHeader } from "./TreeGridHeader/TreeGridHeader";
import { TreeGridBody } from "./TreeGridBody/TreeGridBody";
import { TreeGridColumn, TreeGridProps, TreeNodeBase, TreePosition, } from "./types";
import { cloneTree, flattenPositions, insertAsLastChild, insertAtRoot, removeNode, } from "./treeGridOperations";

export default function TreeGrid<T extends TreeNodeBase>({
  data,
  columns,
  nameSpan = 4,
  defaultExpandedIds,
  expandedIds,
  onExpandedChange,
  onRowClick,
  enableDragAndDrop = false,
  onPositionsChange,
  onDataChange,
}: TreeGridProps<T> & { onDataChange?: (next: T[]) => void }) {
  const [internalExpandedSet, setInternalExpandedSet] = useState<Set<string>>(
    () => new Set(defaultExpandedIds ?? [])
  );

  const expandedSet = useMemo(
    () => (expandedIds ? new Set(expandedIds) : internalExpandedSet),
    [expandedIds, internalExpandedSet]
  );

  const applyExpandedSet = useCallback(
    (nextExpandedSet: Set<string>) => {
      if (expandedIds && onExpandedChange) {
        onExpandedChange([...nextExpandedSet]);
      } else {
        setInternalExpandedSet(nextExpandedSet);
      }
    },
    [expandedIds, onExpandedChange]
  );

  const toggleNode = useCallback(
    (nodeId: string) => {
      const nextExpandedSet = new Set(expandedSet);
      if (nextExpandedSet.has(nodeId)) {
        nextExpandedSet.delete(nodeId);
      } else {
        nextExpandedSet.add(nodeId);
      }
      applyExpandedSet(nextExpandedSet);
    },
    [expandedSet, applyExpandedSet]
  );

  const gridTemplate = useMemo(() => {
    const spanValues = [nameSpan, ...columns.map((column) => column.span ?? 1)];
    return spanValues.map((span) => `minmax(0, ${span}fr)`).join(" ");
  }, [nameSpan, columns]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!active?.id || !over?.id) return;

      const sourceId = String(active.id);
      const targetId = String(over.id);
      if (sourceId === targetId) return;

      const cloned = cloneTree(data as TreeNodeBase[]);
      const { tree: withoutSource, removed } = removeNode(cloned, sourceId);
      if (!removed) return;

      const withInserted =
        targetId === "__ROOT__"
          ? insertAtRoot(withoutSource, removed)
          : insertAsLastChild(withoutSource, targetId, removed);

      const positions = flattenPositions(withInserted);
      onPositionsChange?.(positions as TreePosition[]);
      onDataChange?.(withInserted as T[]);
    },
    [data, onPositionsChange, onDataChange]
  );

  const body = (
    <TreeGridBody<T>
      data={data}
      columns={columns as TreeGridColumn<T>[]}
      gridTemplate={gridTemplate}
      expandedSet={expandedSet}
      toggleNode={toggleNode}
      onRowClick={onRowClick}
      enableDragAndDrop={enableDragAndDrop}
    />
  );

  return (
    <div className={styles.outer}>
      <div className={styles.container}>
        <TreeGridHeader
          columns={columns}
          gridTemplate={gridTemplate}
        />
        {enableDragAndDrop ? (
          <DndContext onDragEnd={handleDragEnd}>
            {body}
          </DndContext>
        ) : (
          body
        )}
      </div>
    </div>
  );
};
