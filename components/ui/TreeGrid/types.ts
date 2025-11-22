import { ReactNode } from "react";

export type TreeNodeBase = {
  id: string;
  name: string;
  children?: TreeNodeBase[];
  [key: string]: unknown;
};

export type TreeGridColumn<T extends TreeNodeBase> = {
  id: string;
  header: ReactNode;
  render: (node: T) => ReactNode;
  span?: number;
  align?: "start" | "center" | "end";
  headerIcon?: ReactNode;
};

export type TreePosition = {
  id: string;
  parentId: string | null;
  index: number;
};

export type TreeGridProps<T extends TreeNodeBase> = {
  data: T[];
  columns: TreeGridColumn<T>[];
  nameSpan?: number;
  defaultExpandedIds?: string[];
  expandedIds?: string[];
  onExpandedChange?: (ids: string[]) => void;
  onRowClick?: (node: T) => void;
  enableDragAndDrop?: boolean;
  onPositionsChange?: (positions: TreePosition[]) => void;
};
