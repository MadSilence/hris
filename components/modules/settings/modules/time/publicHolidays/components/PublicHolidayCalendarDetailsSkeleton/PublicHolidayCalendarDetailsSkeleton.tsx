import * as React from "react";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";

export const PublicHolidayCalendarDetailsSkeleton: React.FC = () => {
  return (
    <div className="flex h-[calc(100svh-6rem)] flex-col gap-5 overflow-hidden px-8 pt-2">
      {/* Header + status + description */}
      <div className="flex flex-none flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-56" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full max-w-2xl" />
      </div>

      {/* Tabs */}
      <Skeleton className="h-10 w-full flex-none rounded-md" />

      {/* Holidays tab content */}
      <div className="flex min-h-0 flex-1 flex-col gap-6">
        {/* Info block */}
        <div className="flex-none space-y-1.5 pb-1 pt-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>

        {/* Toolbar */}
        <div className="flex flex-none items-center justify-between gap-4">
          <Skeleton className="h-9 w-[260px]" />
          <Skeleton className="h-9 w-24" />
        </div>

        {/* Table */}
        <div className="min-h-0 flex-1 overflow-hidden pr-1">
          <div className="flex gap-4 border-b border-brown-200 pb-2 pl-4">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="space-y-4 pt-4 pl-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={`phc-detail-skel-${i}`} className="flex gap-4">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
