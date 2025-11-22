"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import type { DraggableAttributes } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

export type SortableApi = {
  setNodeRef: (node: HTMLElement | null) => void;
  attributes: DraggableAttributes;
  listeners?: Record<string, any>;
  style: React.CSSProperties;
  isDragging: boolean;
};

export interface SortableRowProps {
  id: string;
  children: (sortable: SortableApi) => React.ReactNode;
  classNameDragging?: string;
}

export const SortableRow: React.FC<SortableRowProps> = ({ id, children }) => {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
    willChange: "transform",
    transformOrigin: "center",
  };

  return children({
    setNodeRef,
    attributes,
    listeners,
    style,
    isDragging,
  });
};
