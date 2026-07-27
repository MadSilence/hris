import * as React from "react";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";

export const PublicHolidayCalendarDetailsSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-56" />

      <div className="rounded-xl border bg-white px-6 py-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
      </div>

      <div className="space-y-3">
        <Skeleton className="h-9 w-48" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="grid grid-cols-3 gap-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
};
