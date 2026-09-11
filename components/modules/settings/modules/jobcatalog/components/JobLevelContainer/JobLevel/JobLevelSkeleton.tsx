"use client";

import * as React from "react";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";

/**
 * The career-track cards, waiting.
 *
 * Same auto-fill grid, same card border, same stack of level rows inside — so the tracks do not
 * arrive all at once into a page that was showing a centred spinner. Rule:
 * `technical_documentation/ui/TABLES_AND_LISTS.md` § 2.
 */
export const JobLevelSkeleton: React.FC<{ cards?: number }> = ({ cards = 4 }) => (
  <div className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(320px,1fr))]">
    {Array.from({ length: cards }).map((_, i) => (
      <div key={i} className="space-y-3 rounded-xl border border-brown-200 p-4">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
        {Array.from({ length: 3 }).map((__, j) => (
          <div key={j} className="flex items-center gap-2">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3.5 w-24" />
          </div>
        ))}
      </div>
    ))}
  </div>
);
