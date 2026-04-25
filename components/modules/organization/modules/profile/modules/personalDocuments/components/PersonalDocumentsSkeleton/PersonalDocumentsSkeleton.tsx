import * as React from "react";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";

export const PersonalDocumentsSkeleton: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Skeleton className="h-4 w-20"/>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-md"/>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32"/>
                  <Skeleton className="h-3 w-24"/>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Skeleton className="h-4 w-16"/>
        <div className="space-y-3 rounded-lg border p-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full"/>
          ))}
        </div>
      </div>
    </div>
  );
};
