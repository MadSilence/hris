"use client";

import * as React from "react";
import { Skeleton } from "@/components/desact/skeleton";

/**
 * The shape of the category rows, not a spinner.
 *
 * Same border, same divider, same row height and the same three blocks as the real row — name,
 * description, actions — so nothing moves when the data lands. Rule:
 * `technical_documentation/ui/TABLES_AND_LISTS.md` § 2.
 */
export const DocumentCategoriesSkeleton: React.FC<{ rows?: number }> = ({ rows = 4 }) => (
  <div className="divide-y divide-divider rounded-control border border-divider">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 px-4 py-3">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-64" />
        </div>
        <Skeleton className="h-8 w-8 rounded-control" />
        <Skeleton className="h-8 w-8 rounded-control" />
      </div>
    ))}
  </div>
);
