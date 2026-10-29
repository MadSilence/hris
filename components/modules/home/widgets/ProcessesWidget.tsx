"use client";

import React from "react";
import Link from "next/link";
import { ErrorState } from "@/components/feedback/ErrorState";
import { formatDisplayDate } from "@/lib/date";
import type { ProcessSummary } from "@/models/lifecycle";
import { useLifecycleProcesses } from "@/components/modules/lifecycle/hooks";
import { HomeCard, HomeCardLink, HomeEmpty, HomeRowsSkeleton } from "@/components/modules/home/components/HomeCard";

export const PROCESSES_LIMIT = 5;
const IN_FLIGHT = new Set<ProcessSummary["status"]>(["PLANNED", "IN_PROGRESS", "PARTIALLY_FAILED"]);
const TYPE_LABELS: Record<ProcessSummary["type"], string> = { PREBOARDING: "Preboarding", ONBOARDING: "Onboarding" };

/**
 * Preboarding and onboarding in flight within the reader's scope — the list `/processes` shows, open only,
 * soonest start first. (There is no offboarding process in the product: leaving is a status, not a process.)
 */
export const ProcessesWidget: React.FC = () => {
  const query = useLifecycleProcesses(false);
  const open = (query.data ?? [])
    .filter((p) => IN_FLIGHT.has(p.status))
    .sort((a, b) => a.anchorDate.localeCompare(b.anchorDate));

  return (
    <HomeCard title="Processes in Progress" action={<HomeCardLink href="/processes">See All</HomeCardLink>}>
      {query.isLoading ? (
        <HomeRowsSkeleton rows={3} avatar={false} />
      ) : query.error ? (
        <ErrorState error={query.error} compact onRetry={() => void query.refetch()} />
      ) : open.length === 0 ? (
        <HomeEmpty>No onboarding or preboarding in progress.</HomeEmpty>
      ) : (
        <ul className="flex flex-col gap-1">
          {open.slice(0, PROCESSES_LIMIT).map((process) => {
            const done = process.taskCount - process.openTaskCount;
            return (
              <li key={process.id}>
                <Link href={`/processes/${process.id}`} className="-mx-2 flex items-center justify-between gap-3 rounded-md px-2 py-1.5 hover:bg-brown-50">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-brown-900">{process.target.name ?? "Unnamed"}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {TYPE_LABELS[process.type]} · {formatDisplayDate(process.anchorDate, { style: "medium" })}
                    </span>
                  </span>
                  <span className="shrink-0 text-right text-xs text-brown-700">
                    {done}/{process.taskCount} done
                    {process.overdueTaskCount > 0 && (
                      <span className="block font-medium text-danger-600">{process.overdueTaskCount} overdue</span>
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </HomeCard>
  );
};
