"use client";

import React from "react";
import { cn } from "@/lib/cn";
import type { HomeWidgetSize } from "@/models/home";

/**
 * Home's grid (the designers' Home fixes, Part 3): **always four fluid columns** with a 24 gap, so a person's
 * arrangement is the same on every screen — `repeat(4, minmax(0, 1fr))` across the container, whose width is at most
 * 1200 — and rows of 160 whatever the width. Each widget stands in its own cell (`col`, `row`); empty cells are
 * allowed. **Narrow** — the container under 1000 px (a 1280 screen, or zoomed in) — is three columns, the stored cells
 * are ignored and the widgets are packed in reading order with no holes. The parent must be a `@container`.
 */
export const WidgetGrid = React.forwardRef<HTMLDivElement, { children: React.ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>>(
  ({ children, className, ...rest }, ref) => (
  <div
    ref={ref}
    className={cn(
      "grid w-full auto-rows-[160px] grid-cols-[repeat(4,minmax(0,1fr))] gap-6",
      "@max-[999px]:grid-flow-row-dense @max-[999px]:grid-cols-[repeat(3,minmax(0,1fr))]",
      className,
    )}
    {...rest}
  >
    {children}
  </div>
  ),
);
WidgetGrid.displayName = "WidgetGrid";

/** The cell a widget takes. */
export const cellClass = (size: HomeWidgetSize) =>
  size === "L" ? "col-span-2 row-span-2" : size === "M" ? "col-span-1 row-span-2" : "col-span-1 row-span-1";

/** The cell a widget stands in at four columns; ignored under 1000 px, where the grid packs in order. */
const placeStyle = (col?: number, row?: number): React.CSSProperties | undefined =>
  col && row ? ({ "--home-col": col, "--home-row": row } as React.CSSProperties) : undefined;

export const WidgetCell: React.FC<
  { size: HomeWidgetSize; col?: number; row?: number; children?: React.ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>
> = ({ size, col, row, children, className, style, ...rest }) => (
  <div
    className={cn(
      "min-h-0 min-w-0",
      cellClass(size),
      col && row && "@min-[1000px]:col-start-(--home-col) @min-[1000px]:row-start-(--home-row)",
      className,
    )}
    style={{ ...placeStyle(col, row), ...style }}
    {...rest}
  >
    {children}
  </div>
);
