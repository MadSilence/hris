"use client";

import * as React from "react";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";

/**
 * The job catalog, waiting.
 *
 * The screen used to show a centred spinner, which is the same shape whatever is coming — so the
 * whole catalog appeared at once and pushed the page around. This carries the real column grid and
 * the accordion cards beneath it. Rule: `technical_documentation/ui/TABLES_AND_LISTS.md` § 2.
 *
 * The grid string is duplicated from `JobFamilyComponent` on purpose: exporting it would tie the
 * screen's layout to its skeleton in a way that makes the skeleton the thing nobody dares change.
 * If the columns move, this file moves with them — which is the review § 2 asks for.
 */
export const JobFamilySkeleton: React.FC<{ families?: number }> = ({ families = 4 }) => (
  <div className="space-y-4 pt-2">
    {Array.from({ length: families }).map((_, i) => (
      <div key={i} className="rounded-xl border border-brown-200 px-3 py-3">
        <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_48px] items-center gap-4">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-8 w-8 justify-self-end rounded-md" />
        </div>
      </div>
    ))}
  </div>
);
