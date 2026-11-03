"use client";

import React from "react";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useReviewCycle } from "@/components/modules/reviews/hooks";
import { CycleBuilderContainer } from "./builder/CycleBuilderContainer";
import { CycleRunContainer } from "./run/CycleRunContainer";

/** One cycle: a draft opens in its builder, a launched or closed one on its run page. */
export function CyclePageContainer({ cycleId }: { cycleId: string }) {
  const cycle = useReviewCycle(cycleId);
  if (cycle.error) return <div className="mx-auto max-w-4xl"><ErrorState error={cycle.error} /></div>;
  if (!cycle.data) return <Skeleton className="mx-auto h-64 w-full max-w-4xl rounded-xl" aria-busy="true" />;
  return cycle.data.status === "DRAFT"
    ? <CycleBuilderContainer cycle={cycle.data} />
    : <CycleRunContainer cycleId={cycleId} />;
}
