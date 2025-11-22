"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";

export function TreeGridRootDropZone() {
  const { setNodeRef, isOver } = useDroppable({ id: "__ROOT__" });
  return (
    <div
      ref={setNodeRef}
      style={{
        height: "20px",
        background: isOver ? "hsla(0, 0%, 0%, 0.03)" : "transparent",
      }}
    />
  );
}
