import * as React from "react";
import { Skeleton } from "@/components/desact/skeleton";

/**
 * The tab while it loads, in its real shape (documents-tab T16): "Folders" over Mist tiles, the view switch, then rows
 * under a header with hairlines and no frame. A bare `border` here once drew every block in black (walk of
 * 2026-11-18): Tailwind 4 colours it with the text.
 */
export const PersonalDocumentsSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-6" aria-hidden>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-20" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3 rounded-card bg-mist p-3">
              <Skeleton className="size-10 rounded-control" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-14" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <Skeleton className="h-8 w-80 rounded-control" />

      <div className="flex flex-col divide-y divide-divider">
        <Skeleton className="mb-2 h-4 w-full max-w-md" />
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex h-12 items-center gap-3">
            <Skeleton className="size-7 rounded-control" />
            <Skeleton className="h-4 w-56" />
            <Skeleton className="ml-auto h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
};
