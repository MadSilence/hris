"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/desact/skeleton";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useStepByTask } from "@/components/modules/reviews/hooks";
import { stepHref } from "@/models/reviews";

/** Finds the review step a Tasks row points at — nominating, approving peers, approving a review — and moves on. */
export function StepByTaskRedirect({ taskId }: { taskId: string }) {
  const router = useRouter();
  const found = useStepByTask(taskId);
  useEffect(() => {
    if (found.data) router.replace(stepHref(found.data.kind, found.data.participantId));
  }, [found.data, router]);
  if (found.error) return <div className="mx-auto max-w-3xl"><ErrorState error={found.error} /></div>;
  return <Skeleton className="mx-auto h-64 w-full max-w-3xl rounded-popover" aria-busy="true" />;
}
