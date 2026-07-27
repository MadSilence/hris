import * as React from "react";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";

export const TimeOffPoliciesSettingsSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="grid grid-cols-4 gap-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-10" />
        </div>
      ))}
    </div>
  );
};
