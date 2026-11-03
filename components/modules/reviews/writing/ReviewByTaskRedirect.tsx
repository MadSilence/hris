"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useAssignmentByTask } from "@/components/modules/reviews/hooks";

/** Finds the review a Tasks row points at, and moves on to it. */
export function ReviewByTaskRedirect({ taskId }: { taskId: string }) {
  const router = useRouter();
  const found = useAssignmentByTask(taskId);
  useEffect(() => {
    if (found.data) router.replace(`/reviews/write/${found.data.assignmentId}`);
  }, [found.data, router]);
  if (found.error) return <div className="mx-auto max-w-3xl"><ErrorState error={found.error} /></div>;
  return <Skeleton className="mx-auto h-64 w-full max-w-3xl rounded-xl" aria-busy="true" />;
}
