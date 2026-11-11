"use client";

import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";
import { useShortDates } from "@/lib/date";
import type { ProcessSummary } from "@/models/lifecycle";
import { useLifecycleProcesses } from "@/components/modules/lifecycle/hooks";
import { useUserSettings } from "@/components/modules/firstRun/hooks";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { isoDateInZone } from "@/components/modules/home/utils/zonedTime";
import {
  BigNumber,
  CounterPill,
  PersonFace,
  WidgetCard,
  WidgetEmpty,
  WidgetError,
  WidgetLink,
  WidgetScroll,
  WidgetSkeleton,
} from "@/components/modules/home/components/WidgetCard";
import type { HomeWidgetProps } from "./catalogue";

const IN_FLIGHT = new Set<ProcessSummary["status"]>(["PLANNED", "IN_PROGRESS", "PARTIALLY_FAILED"]);

/** The bar's colour by type: onboarding the accent, offboarding Ink at 70 %, preboarding Scheduled teal. */
const BAR = {
  ONBOARDING: "bg-accent",
  OFFBOARDING: "bg-primary/70",
  PREBOARDING: "bg-status-scheduled-fill",
} as const satisfies Record<ProcessSummary["type"], string>;

const addDays = (iso: string, days: number) => {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

/**
 * Preboarding, onboarding and offboarding in flight within the reader's scope (`home-widgets` § 9): steps done out of
 * all, and the overdue ones — in Pending amber, never red. Preboarding that has not started reads "starts {date}".
 */
export const ProcessesWidget: React.FC<HomeWidgetProps> = ({ size, preview }) => {
  const t = useTranslations("home");
  const dates = useShortDates();
  const settings = useUserSettings();
  const query = useLifecycleProcesses(false);
  const today = isoDateInZone(new Date(), settings.data?.companyTimeZone);
  const open = (query.data ?? [])
    .filter((p) => IN_FLIGHT.has(p.status))
    .sort((a, b) => b.overdueTaskCount - a.overdueTaskCount || a.anchorDate.localeCompare(b.anchorDate));
  const overdue = open.filter((p) => p.overdueTaskCount > 0).length;
  const title = t("widgets.processes.title");

  if (query.isLoading) {
    return (
      <WidgetCard title={title} size={size}>
        <WidgetSkeleton number={size === "S"} rows={size === "S" ? 0 : 3} />
      </WidgetCard>
    );
  }
  if (query.error) {
    return (
      <WidgetCard title={title} size={size}>
        <WidgetError size={size} message={t("card.couldNotLoad", { thing: "processes" })} onRetry={() => void query.refetch()} />
      </WidgetCard>
    );
  }
  if (open.length === 0) {
    return (
      <WidgetCard title={title} size={size}>
        <WidgetEmpty size={size} scene="onboarding" title={t("processes.emptyTitle")} line={t("processes.emptyLine")} />
      </WidgetCard>
    );
  }

  if (size === "S") {
    return (
      <WidgetCard title={title} size={size} aside={<WidgetLink href="/processes">{t("processes.all")}</WidgetLink>}>
        <BigNumber size="s" value={open.length} word={t("processes.inProgress")} />
        {overdue > 0 && <StatusBadge status="pending" size="sm" label={t("processes.overdue", { count: overdue })} />}
      </WidgetCard>
    );
  }

  const typeLine = (p: ProcessSummary) => {
    const type = t(`processes.types.${p.type}`);
    if (p.overdueTaskCount > 0) return t("processes.withOverdue", { type, overdue: t("processes.overdue", { count: p.overdueTaskCount }) });
    if (p.anchorDate > today) return t("processes.startsOn", { type, date: dates.date(p.anchorDate) });
    return type;
  };

  const rows = (
    <ul className="flex flex-col divide-y divide-divider">
      {open.map((p) => {
        const done = p.taskCount - p.openTaskCount;
        const share = p.taskCount === 0 ? 0 : Math.round((done / p.taskCount) * 100);
        const name = p.target.name ?? t("card.unnamed");
        return (
          <li key={p.id}>
            <Link
              href={`/processes/${p.id}`}
              tabIndex={preview ? -1 : undefined}
              className="-mx-2 flex items-center gap-3 rounded-control px-2 py-2.5 hover:bg-subtle"
            >
              <PersonFace name={name} size={28} />
              <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-body font-medium text-primary">{name}</span>
                  <span className="shrink-0 text-hint tabular-nums text-tertiary">
                    {t("processes.progress", { done, total: p.taskCount })}
                  </span>
                </span>
                <span className={cn("truncate text-hint", p.overdueTaskCount > 0 ? "text-status-pending-text" : "text-tertiary")}>
                  {typeLine(p)}
                </span>
                <span className="relative h-1 w-full overflow-hidden rounded-pill bg-mist" aria-hidden>
                  <span className={cn("absolute inset-y-0 left-0 rounded-pill", BAR[p.type])} style={{ width: `${share}%` }} />
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );

  const onboarding = open.filter((p) => p.type === "ONBOARDING").length;
  const offboarding = open.filter((p) => p.type === "OFFBOARDING").length;
  const nextWeek = open.filter((p) => p.anchorDate > today && p.anchorDate <= addDays(today, 7)).length;

  return (
    <WidgetCard
      title={title}
      size={size}
      titleExtra={<CounterPill count={open.length} />}
      aside={<WidgetLink href="/processes">{size === "L" ? t("processes.allProcesses") : t("processes.all")}</WidgetLink>}
    >
      <WidgetScroll>{rows}</WidgetScroll>
      {size === "L" && (
        <div className="flex flex-wrap gap-2">
          {onboarding > 0 && <StatusBadge status="in-progress" size="sm" label={t("processes.chips.onboarding", { count: onboarding })} />}
          {offboarding > 0 && <StatusBadge status="in-progress" size="sm" label={t("processes.chips.offboarding", { count: offboarding })} />}
          {nextWeek > 0 && <StatusBadge status="scheduled" size="sm" label={t("processes.chips.startsNextWeek", { count: nextWeek })} />}
          {overdue > 0 && <StatusBadge status="pending" size="sm" label={t("processes.chips.overdue", { count: overdue })} />}
        </div>
      )}
    </WidgetCard>
  );
};
