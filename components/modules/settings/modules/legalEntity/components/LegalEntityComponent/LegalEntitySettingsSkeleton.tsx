import * as React from "react";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";

export const LegalEntitySettingsSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="grid grid-cols-5 gap-4">
          <Skeleton className="h-8 w-full"/>
          <Skeleton className="h-8 w-full"/>
          <Skeleton className="h-8 w-full"/>
          <Skeleton className="h-8 w-full"/>
          <Skeleton className="h-8 w-full"/>
        </div>
      ))}
    </div>
  );
};
