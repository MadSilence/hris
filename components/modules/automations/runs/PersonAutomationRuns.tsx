"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowDown01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Skeleton } from "@/components/desact/skeleton";
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
        scene="automations"
        title="No automation runs"
        description="When an automation does something for this person, it is listed here with what each step did."
      />
    );
  }

  return (
    <ul className="m-0 list-none divide-y divide-divider p-0">
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
                {isOpen ? <Icon icon={ArrowDown01Icon} size="sm" className="flex-none text-tertiary" /> : <Icon icon={ArrowRight01Icon} size="sm" className="flex-none text-tertiary" />}
                <span className="min-w-0">
                  <span className="block truncate text-body text-primary">{run.ruleName ?? "Automation"}</span>
                  <span className="block truncate text-hint text-tertiary">
                    {[runReason(run), formatMoment(run.finishedAt ?? run.createdAt)].filter(Boolean).join(" · ")}
                  </span>
                </span>
              </button>
              <RunStatusBadge status={run.status} />
              <Link
                href={`/settings/automation/automations/${run.ruleId}`}
                className="text-hint text-tertiary no-underline hover:text-primary hover:underline"
              >
                Open rule
              </Link>
            </div>
            {isOpen && <div className="mt-3 pl-6"><RunSteps run={run} /></div>}
          </li>
        );
      })}
    </ul>
  );
}
