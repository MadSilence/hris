"use client";

import React from "react";
import { cn } from "@/lib/cn";
import type { HomeWidgetSize } from "@/models/home";

/**
 * Home's grid (`home-widgets` § System): four columns of 254 with a 24 gap at 1440 — 1088 in all — rows of 160, three
 * columns at 1280 and below. A widget is Small 1 × 1, Medium 1 × 2 or Large 2 × 2, placed in the person's order, and
 * the **dense** flow lets a smaller one fill the first hole it fits, so no hole is left in the middle.
 */
export const WidgetGrid: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div
    className={cn(
      "grid w-full max-w-[1088px] grid-flow-row-dense auto-rows-[160px] grid-cols-4 gap-6 max-[1281px]:grid-cols-3",
      className,
    )}
  >
    {children}
  </div>
);

/** The cell a widget takes. */
export const cellClass = (size: HomeWidgetSize) =>
  size === "L" ? "col-span-2 row-span-2" : size === "M" ? "col-span-1 row-span-2" : "col-span-1 row-span-1";

export const WidgetCell: React.FC<{ size: HomeWidgetSize; children?: React.ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>> = ({
  size,
  children,
  className,
  ...rest
}) => (
  <div className={cn("min-h-0 min-w-0", cellClass(size), className)} {...rest}>
    {children}
  </div>
);
