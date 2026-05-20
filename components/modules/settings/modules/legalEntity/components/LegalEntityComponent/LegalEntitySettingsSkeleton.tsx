import * as React from "react";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";

export const LegalEntitySettingsSkeleton: React.FC = () => {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-[1.2fr_0.8fr_2fr_1.2fr_1fr] gap-4 py-2"
        >
          <Skeleton className="h-4 w-full"/>
          <Skeleton className="h-4 w-full"/>
          <Skeleton className="h-4 w-full"/>
          <Skeleton className="h-4 w-full"/>
          <Skeleton className="h-4 w-full"/>
        </div>
      ))}
    </div>
  );
};
