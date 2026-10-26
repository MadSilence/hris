"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Zap } from "lucide-react";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { formatMoment } from "@/models/automations";
import { usePersonAutomationRuns } from "@/components/modules/automations/hooks";
import { RunStatusBadge } from "@/components/modules/automations/shared/AutomationStatusBadge";
import { RunSteps, runReason } from "./RunLog";

/**
 * A person's automation runs — "why did Anna get this" answered on Anna (research § A.10: a run log
 * per rule *and* per person). The caller shows it only to readers of `SETTINGS.AUTOMATIONS`, which is
 * the right the run log is behind (design § 9.11).
 */
export function PersonAutomationRuns({ personId }: { personId: string }) {
  const runs = usePersonAutomationRuns(personId);
  const [open, setOpen] = useState<string | null>(null);
  const rows = runs.data?.content ?? [];

  if (runs.error) return <ErrorState error={runs.error} compact onRetry={() => void runs.refetch()} />;

  if (runs.isLoading) {
    return (
      <div className="space-y-2 py-2">
        {[0, 1].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        className="my-4"
        icon={<Zap className="h-6 w-6" />}
        title="No automation runs"
        description="When an automation does something for this person, it is listed here with what each step did."
      />
    );
  }

  return (
    <ul className="m-0 list-none divide-y divide-brown-100 p-0">
      {rows.map((run) => {
        const isOpen = open === run.id;
        return (
          <li key={run.id} className="py-2.5">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="flex min-w-0 flex-1 items-center gap-2 text-left"
                onClick={() => setOpen(isOpen ? null : run.id)}
                aria-expanded={isOpen}
              >
                {isOpen ? <ChevronDown className="h-4 w-4 flex-none text-muted-foreground" /> : <ChevronRight className="h-4 w-4 flex-none text-muted-foreground" />}
                <span className="min-w-0">
                  <span className="block truncate text-sm text-foreground">{run.ruleName ?? "Automation"}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {[runReason(run), formatMoment(run.finishedAt ?? run.createdAt)].filter(Boolean).join(" · ")}
                  </span>
                </span>
              </button>
              <RunStatusBadge status={run.status} />
              <Link
                href={`/settings/automation/automations/${run.ruleId}`}
                className="text-xs text-muted-foreground no-underline hover:text-foreground hover:underline"
              >
                Open Rule
              </Link>
            </div>
            {isOpen && <div className="mt-3 pl-6"><RunSteps run={run} /></div>}
          </li>
        );
      })}
    </ul>
  );
}
