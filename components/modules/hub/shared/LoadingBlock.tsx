"use client";

import * as React from "react";
import { NodRing } from "@/components/desact/nod";
import { Skeleton } from "@/components/desact/skeleton";
import { cn } from "@/lib/cn";

/** Which face a wait shows (SPEC § 12): nothing under 0.3 s, a nodding ring to 2 s, then the block's skeleton. */
export const useLoadingPhase = (): "none" | "ring" | "skeleton" => {
  const [phase, setPhase] = React.useState<"none" | "ring" | "skeleton">("none");
  React.useEffect(() => {
    const ring = setTimeout(() => setPhase("ring"), 300);
    const skeleton = setTimeout(() => setPhase("skeleton"), 2000);
    return () => {
      clearTimeout(ring);
      clearTimeout(skeleton);
    };
  }, []);
  return phase;
};

/** A block still loading: each block of a hub page loads on its own and shows its own wait. */
export const LoadingBlock: React.FC<{ skeleton: React.ReactNode; className?: string }> = ({ skeleton, className }) => {
  const phase = useLoadingPhase();
  if (phase === "none") return <div className={className} aria-busy="true" />;
  if (phase === "ring")
    return (
      <div className={cn("flex items-center justify-center py-8", className)} aria-busy="true">
        <NodRing />
      </div>
    );
  return (
    <div className={className} aria-busy="true">
      {skeleton}
    </div>
  );
};

/** Skeleton rows the height of a list's rows. */
export const SkeletonRows: React.FC<{ count: number; height?: string }> = ({ count, height = "h-16" }) => (
  <div className="flex flex-col gap-3">
    {Array.from({ length: count }, (_, i) => (
      <Skeleton key={i} className={cn("w-full rounded-card", height)} />
    ))}
  </div>
);
