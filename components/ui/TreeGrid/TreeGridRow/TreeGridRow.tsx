"use client";
import React from "react";
import rowStyles from "./TreeGridRow.module.css";
import { TreeGridColumn, TreeNodeBase } from "../types";
import ArrowUp from "@/public/icons/arrow-up.svg";
import ArrowDown from "@/public/icons/arrow-down.svg";
import { useDraggable, useDroppable } from "@dnd-kit/core";

type TreeGridRowProps<T extends TreeNodeBase> = {
  node: T;
  level: number;
  columns: TreeGridColumn<T>[];
  gridTemplate: string;
  expandedSet: Set<string>;
  toggleNode: (id: string) => void;
  onRowClick?: (node: T) => void;
  enableDragAndDrop?: boolean;
};

export function TreeGridRow<T extends TreeNodeBase>({
  node,
  level,
  columns,
  gridTemplate,
  expandedSet,
  toggleNode,
  onRowClick,
  enableDragAndDrop = false,
}: TreeGridRowProps<T>) {
  const hasChildren = (node.children?.length ?? 0) > 0;
  const isExpanded = expandedSet.has(node.id);

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: node.id,
    disabled: !enableDragAndDrop,
  });

  const { setNodeRef: setDragRef, attributes, listeners, isDragging } = useDraggable({
    id: node.id,
    disabled: !enableDragAndDrop,
  });

  const levelGuides = Array.from({ length: level }, (_, index) => (
    <span key={index} className={rowStyles.levelGuide} aria-hidden="true"/>
  ));

  return (
    <>
      <div
        ref={enableDragAndDrop ? setDropRef : undefined}
        className={[
          rowStyles.row,
          enableDragAndDrop ? rowStyles.rowDragEnabled : "",
          isDragging ? rowStyles.rowDragging : "",
          isOver ? rowStyles.rowOver : "",
        ].join(" ")}
        style={{ gridTemplateColumns: gridTemplate }}
        role="row"
        aria-level={level + 1}
        aria-expanded={hasChildren ? isExpanded : undefined}
        onClick={onRowClick ? () => onRowClick(node) : undefined}
      >
        <div className={rowStyles.nameColumn}>
          <div className={rowStyles.nameCell}>
            {enableDragAndDrop ? (
              <span
                ref={setDragRef}
                className={rowStyles.dragHandle}
                {...listeners}
                {...attributes}
                onClick={(event) => event.stopPropagation()}
              >
                ⋮⋮
              </span>
            ) : null}

            <span className={rowStyles.levelGuides}>{levelGuides}</span>

            {hasChildren ? (
              <button
                type="button"
                className={rowStyles.toggleButton}
                aria-label={isExpanded ? "Collapse" : "Expand"}
                onClick={(event) => {
                  event.stopPropagation();
                  toggleNode(node.id);
                }}
              >
                {isExpanded ? <ArrowDown/> : <ArrowUp/>}
              </button>
            ) : (
              <span className={rowStyles.togglePlaceholder}/>
            )}

            <span className={rowStyles.nodeName}>{node.name}</span>
          </div>
        </div>

        {columns.map((column) => (
          <div key={column.id} className={rowStyles.cell}>
            {column.render(node)}
          </div>
        ))}
      </div>

      {hasChildren && isExpanded
        ? node.children!.map((child) => (
          <TreeGridRow<T>
            key={child.id}
            node={child as T}
            level={level + 1}
            columns={columns}
            gridTemplate={gridTemplate}
            expandedSet={expandedSet}
            toggleNode={toggleNode}
            onRowClick={onRowClick}
            enableDragAndDrop={enableDragAndDrop}
          />
        ))
        : null}
    </>
  );
}
