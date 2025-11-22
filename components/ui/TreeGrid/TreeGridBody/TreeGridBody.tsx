"use client";

import React from "react";
import styles from "../TreeGrid.module.css";
import { TreeGridRow } from "../TreeGridRow/TreeGridRow";
import { TreeGridRootDropZone } from "../TreeGridRootDropZone/TreeGridRootDropZone";
import { TreeGridColumn, TreeNodeBase } from "../types";

type TreeGridBodyProps<T extends TreeNodeBase> = {
  data: T[];
  columns: TreeGridColumn<T>[];
  gridTemplate: string;
  expandedSet: Set<string>;
  toggleNode: (id: string) => void;
  onRowClick?: (node: T) => void;
  enableDragAndDrop?: boolean;
};

export function TreeGridBody<T extends TreeNodeBase>({
  data,
  columns,
  gridTemplate,
  expandedSet,
  toggleNode,
  onRowClick,
  enableDragAndDrop = false,
}: TreeGridBodyProps<T>) {
  return (
    <div className={styles.body} role="treegrid" aria-readonly>
      {data.map((node) => (
        <TreeGridRow<T>
          key={node.id}
          node={node}
          level={0}
          columns={columns}
          gridTemplate={gridTemplate}
          expandedSet={expandedSet}
          toggleNode={toggleNode}
          onRowClick={onRowClick}
          enableDragAndDrop={enableDragAndDrop}
        />
      ))}
      {enableDragAndDrop ? <TreeGridRootDropZone/> : null}
    </div>
  );
}
