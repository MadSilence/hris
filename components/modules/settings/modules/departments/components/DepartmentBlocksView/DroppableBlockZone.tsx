"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";

import { cn } from "@/public/desact/src/components/ui/utils";

type Props = {
  id: string;
  /** Nesting level, so a drop into nested blocks resolves to the innermost one. */
  depth?: number;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
};

/** Wraps a block so a dragged person can be dropped onto it. */
export function DroppableBlockZone({ id, depth = 0, disabled, className, children }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id, disabled, data: { depth } });

  return (
    <div
      ref={setNodeRef}
      data-drop-id={id}
      className={cn("rounded-xl", className, isOver && !disabled && "ring-2 ring-inset ring-emerald-400")}
    >
      {children}
    </div>
  );
}
