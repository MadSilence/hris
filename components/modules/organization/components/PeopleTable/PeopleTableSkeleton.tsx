"use client";

import React from "react";
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/public/desact/src/components/ui/table";

type SkeletonColumn = { id: string; label?: string };

type Props = {
  /** The columns that will be shown. Empty while the field list is still loading. */
  columns?: SkeletonColumn[];
  rows?: number;
};

/**
 * The People table while it loads.
 *
 * It has to stand on its own rather than borrow the real table's columns: `isLoading` covers the
 * field list too, and until that arrives there are no columns at all — which is how the old
 * skeleton ended up as a single narrow strip of empty checkbox cells. When the columns are not
 * known yet it lays out a plausible five, so the switch to real data does not shift the page.
 */
const PLACEHOLDER_COLUMNS: SkeletonColumn[] = [
  { id: "placeholder-name" },
  { id: "placeholder-1" },
  { id: "placeholder-2" },
  { id: "placeholder-3" },
  { id: "placeholder-4" },
];

// Fixed, not random: a random width would differ between server and client render.
const BAR_WIDTHS = ["w-32", "w-24", "w-36", "w-20", "w-28"];

const Bar: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`h-3.5 animate-pulse rounded bg-brown-100 ${className ?? ""}`} />
);

export const PeopleTableSkeleton: React.FC<Props> = ({ columns, rows = 10 }) => {
  const cols = columns && columns.length > 0 ? columns : PLACEHOLDER_COLUMNS;

  return (
    <table className="w-full caption-bottom table-fixed text-sm" aria-hidden>
      <TableHeader className="sticky top-0 z-10 bg-background [&_tr]:border-brown-200">
        <TableRow>
          <TableHead className="w-12" />
          {cols.map((column, i) => (
            <TableHead key={column.id} className="truncate">
              {column.label ? (
                <span className="truncate text-foreground">{column.label}</span>
              ) : (
                <Bar className={BAR_WIDTHS[i % BAR_WIDTHS.length]} />
              )}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>

      <TableBody>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <TableRow key={`skeleton-${rowIndex}`} className="border-brown-200 [&_td]:py-2">
            <TableCell className="w-12">
              <div className="h-4 w-4 animate-pulse rounded-[4px] bg-brown-100" />
            </TableCell>

            {cols.map((column, colIndex) => (
              <TableCell key={column.id}>
                {colIndex === 0 ? (
                  // The first column is the person: avatar and name, same shape as the real chip.
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 shrink-0 animate-pulse rounded-full bg-brown-100" />
                    <Bar className="w-28" />
                  </div>
                ) : (
                  <Bar className={BAR_WIDTHS[(rowIndex + colIndex) % BAR_WIDTHS.length]} />
                )}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </table>
  );
};

export default PeopleTableSkeleton;
