"use client";

import React from "react";
import { cn } from "@/public/desact/src/components/ui/utils";

function SkeletonLine({ className }: { className?: string }) {
  return (
    <div className={cn("h-4 rounded bg-brown-100 animate-pulse", className)} />
  );
}

export function DepartmentTreeSkeleton() {
  return (
    <div className="flex flex-col gap-1 p-2">
      {[80, 60, 72, 50, 65, 55, 70].map((w, i) => (
        <div key={i} className="flex items-center gap-1.5 py-1.5 px-2">
          <div className="w-4 h-4 flex-none" />
          <SkeletonLine style={{ width: `${w}%` } as React.CSSProperties} />
        </div>
      ))}
    </div>
  );
}
