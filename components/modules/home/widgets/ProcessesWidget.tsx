"use client";

import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useDateFormatter } from "@/lib/date";
import type { ProcessSummary } from "@/models/lifecycle";
import { useLifecycleProcesses } from "@/components/modules/lifecycle/hooks";
import { HomeCard, HomeCardLink, HomeEmpty, HomeRowsSkeleton } from "@/components/modules/home/components/HomeCard";

export const PROCESSES_LIMIT = 5;
const IN_FLIGHT = new Set<ProcessSummary["status"]>(["PLANNED", "IN_PROGRESS", "PARTIALLY_FAILED"]);
const TYPE_LABEL_KEYS = {
  PREBOARDING: "processes.types.PREBOARDING", ONBOARDING: "processes.types.ONBOARDING", OFFBOARDING: "processes.types.OFFBOARDING",
} as const satisfies Record<ProcessSummary["type"], string>;

/**
 * Preboarding, onboarding and offboarding in flight within the reader's scope — the list `/processes` shows,
 * open only, soonest date first.
 */
export const ProcessesWidget: React.FC = () => {
  const formatDisplayDate = useDateFormatter();
  const t = useTranslations("home");
  const query = useLifecycleProcesses(false);
  const open = (query.data ?? [])
    .filter((p) => IN_FLIGHT.has(p.status))
    .sort((a, b) => a.anchorDate.localeCompare(b.anchorDate));

  return (
    <HomeCard title={t("widgets.processes.title")} action={<HomeCardLink href="/processes">{t("card.seeAll")}</HomeCardLink>}>
      {query.isLoading ? (
        <HomeRowsSkeleton rows={3} avatar={false} />
      ) : query.error ? (
        <ErrorState error={query.error} compact onRetry={() => void query.refetch()} />
      ) : open.length === 0 ? (
        <HomeEmpty>{t("processes.empty")}</HomeEmpty>
      ) : (
        <ul className="flex flex-col gap-1">
          {open.slice(0, PROCESSES_LIMIT).map((process) => {
            const done = process.taskCount - process.openTaskCount;
            return (
              <li key={process.id}>
                <Link href={`/processes/${process.id}`} className="-mx-2 flex items-center justify-between gap-3 rounded-control px-2 py-1.5 hover:bg-subtle">
                  <span className="min-w-0">
                    <span className="block truncate text-body font-medium text-primary">{process.target.name ?? t("card.unnamed")}</span>
                    <span className="block truncate text-hint text-tertiary">
                      {t(TYPE_LABEL_KEYS[process.type])} · {formatDisplayDate(process.anchorDate, { style: "medium" })}
                    </span>
                  </span>
                  <span className="shrink-0 text-right text-hint text-secondary">
                    {t("processes.progress", { done, total: process.taskCount })}
                    {process.overdueTaskCount > 0 && (
                      <span className="block font-medium text-danger-text">{t("processes.overdue", { count: process.overdueTaskCount })}</span>
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
