"use client";

import { pointerWithin, rectIntersection, type CollisionDetection } from "@dnd-kit/core";

/**
 * Blocks live on a zoomable canvas, and dnd-kit measures drop zones with transforms stripped off:
 * at any zoom other than 1 its cached rectangles sit nowhere near what the person sees, so both the
 * rect and the pointer hit tests miss. Ask the document what is actually under the cursor instead,
 * and fall back to dnd-kit's own strategies outside the canvas (the Unassigned panel).
 */
export const underPointer: CollisionDetection = (args) => {
  const point = args.pointerCoordinates;
  if (point) {
    const stack = document.elementsFromPoint(point.x, point.y);
    for (const element of stack) {
      const zone = element.closest<HTMLElement>("[data-drop-id]");
      const dropId = zone?.dataset.dropId;
      if (!dropId) continue;
      const container = args.droppableContainers.find((c) => String(c.id) === dropId);
      if (container) return [{ id: container.id, data: { droppableContainer: container, value: 0 } }];
    }
  }

  const hits = pointerWithin(args);
  return hits.length > 0 ? hits : rectIntersection(args);
};
