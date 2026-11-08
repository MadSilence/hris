"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/desact/skeleton";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { usePersonAutomationRuns } from "@/components/modules/automations/hooks";
import { RunStatusBadge } from "./RunStatusBadge";
import { runDay, useRunWords } from "./runWords";

/**
 * A person's last runs, on the profile — "why did Anna get this" answered on Anna. Parked by the designers (N10):
 * rows of status, automation and date; a row opens the automation with that run's window. The caller shows it only
 * to readers of `SETTINGS.AUTOMATIONS`.
 */
export function PersonAutomationRuns({ personId }: { personId: string }) {
  const t = useTranslations("automationsRuns");
  const words = useRunWords();
  const runs = usePersonAutomationRuns(personId);
  const rows = runs.data ?? [];

  if (runs.error) return <ErrorState error={runs.error} compact onRetry={() => void runs.refetch()} />;

  if (runs.isLoading) {
    return (
      <div className="flex flex-col gap-2 py-2" aria-hidden>
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        compact
        scene="automations"
        title={t("person.emptyTitle")}
        description={t("person.emptyDescription")}
      />
    );
  }

  return (
    <ul className="m-0 flex list-none flex-col divide-y divide-divider p-0">
      {rows.map((run) => {
        const name = run.ruleName ?? t("person.unnamed");
        return (
          <li key={run.id}>
            <Link
              href={`/automations/${run.ruleId}?run=${run.id}`}
              className="flex items-center gap-3 rounded-control px-2 py-2.5 no-underline transition-colors duration-(--duration-hover) hover:bg-row-hover"
            >
              <RunStatusBadge status={run.status} />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-body text-primary" title={name}>
                  {name}
                </span>
                {words.about(run) && <span className="truncate text-hint text-tertiary">{words.about(run)}</span>}
              </span>
              <span className="shrink-0 text-hint text-tertiary">{words.day(runDay(run))}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
