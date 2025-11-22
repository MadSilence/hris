"use client";

import React from "react";
import headerStyles from "./TreeGridHeader.module.css";
import { TreeGridColumn, TreeNodeBase } from "../types";
import Home from "@/public/icons/home.svg";

type TreeGridHeaderProps<T> = {
  columns: TreeGridColumn<TreeNodeBase>[];
  gridTemplate: string;
};

export function TreeGridHeader<T>({ columns, gridTemplate }: TreeGridHeaderProps<T>) {
  return (
    <div
      className={headerStyles.headerRow}
      style={{ gridTemplateColumns: gridTemplate }}
      role="row"
    >
      <div className={headerStyles.headerCell}>
        <Home/>
        <span className={headerStyles.headerTitle}>Name</span>
      </div>
      {columns.map((column) => (
        <div key={column.id} className={headerStyles.headerCell}>
          <div className={headerStyles.headerContent}>
            {column.headerIcon ? (
              <span className={headerStyles.headerIcon}>{column.headerIcon}</span>
            ) : null}
            {column.header}
          </div>
        </div>
      ))}
    </div>
  );
}
