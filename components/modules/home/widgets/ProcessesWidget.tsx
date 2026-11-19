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
  CounterPill,
  PersonFace,
  SmallFooter,
  TWO_LINE_ROW,
  WidgetCard,
  WidgetEmpty,
  WidgetError,
  WidgetLink,
  WidgetScroll,
  WidgetSkeleton,
} from "@/components/modules/home/components/WidgetCard";
import type { HomeWidgetProps } from "./catalogue";

/** A status chip on a widget (A2): 24 high, 12/20 500. */
const CHIP = "leading-5 font-medium";

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

  // A2 + A3: no link; the number on the left and the overdue chip (24, 12/20 500) on the right of one bottom row.
  if (size === "S") {
    return (
      <WidgetCard title={title} size={size}>
        <SmallFooter
          value={open.length}
          word={t("processes.inProgress")}
          aside={overdue > 0 && <StatusBadge status="pending" className={CHIP} label={t("processes.overdue", { count: overdue })} />}
        />
      </WidgetCard>
    );
  }

  const typeLine = (p: ProcessSummary) => {
    const type = t(`processes.types.${p.type}`);
    if (p.overdueTaskCount > 0) return t("processes.withOverdue", { type, overdue: t("processes.overdue", { count: p.overdueTaskCount }) });
    // P4: Medium "Preboarding · starts 23 Nov", Large "Preboarding · 23 Nov".
    if (p.anchorDate > today) {
      const date = dates.date(p.anchorDate, { hideYear: true });
      return size === "L" ? t("processes.startsOnShort", { type, date }) : t("processes.startsOn", { type, date });
    }
    return type;
  };
  const lineClass = (p: ProcessSummary) => cn(TWO_LINE_ROW.line, p.overdueTaskCount > 0 ? "text-status-pending-text" : "text-tertiary");

  // P2: Large is one lane per person — the name and line in a 150 column, a 6-high track with the person riding on the
  // end of its fill, and "4/12" on the right.
  const lanes = (
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
              className="-mx-2 flex h-[60px] items-center gap-4 rounded-control px-2 py-3 hover:bg-subtle"
            >
              <span className="flex w-[150px] shrink-0 flex-col">
                <span className={TWO_LINE_ROW.name}>{name}</span>
                <span className={lineClass(p)}>{typeLine(p)}</span>
              </span>
              <span className="relative h-1.5 min-w-0 flex-1 rounded-pill bg-mist" aria-hidden>
                <span className={cn("absolute inset-y-0 left-0 rounded-pill", BAR[p.type])} style={{ width: `${share}%` }} />
                <span className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: `${share}%` }}>
                  <PersonFace name={name} size={28} />
                </span>
              </span>
              <span className="shrink-0 text-body tabular-nums text-secondary">{t("processes.progress", { done, total: p.taskCount })}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );

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
              className={TWO_LINE_ROW.row}
            >
              <PersonFace name={name} size={28} />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className={TWO_LINE_ROW.name}>{name}</span>
                <span className={lineClass(p)}>{typeLine(p)}</span>
                {/* The count sits right of the bar, on its line (H5). */}
                <span className="mt-1.5 flex items-center gap-2">
                  <span className="relative h-1 min-w-0 flex-1 overflow-hidden rounded-pill bg-mist" aria-hidden>
                    <span className={cn("absolute inset-y-0 left-0 rounded-pill", BAR[p.type])} style={{ width: `${share}%` }} />
                  </span>
                  <span className="shrink-0 text-hint tabular-nums text-tertiary">
                    {t("processes.progress", { done, total: p.taskCount })}
                  </span>
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );

  // P3: onboarding, preboarding that starts next week, overdue — an offboarding is not "starting".
  const onboarding = open.filter((p) => p.type === "ONBOARDING").length;
  const nextWeek = open.filter((p) => p.type === "PREBOARDING" && p.anchorDate > today && p.anchorDate <= addDays(today, 7)).length;

  return (
    <WidgetCard
      title={title}
      size={size}
      titleExtra={<CounterPill count={open.length} />}
      aside={<WidgetLink href="/processes">{size === "L" ? t("processes.allProcesses") : t("processes.all")}</WidgetLink>}
    >
      <WidgetScroll>{size === "L" ? lanes : rows}</WidgetScroll>
      {size === "L" && (
        <div className="flex flex-wrap gap-2">
          {onboarding > 0 && <StatusBadge status="in-progress" className={CHIP} label={t("processes.chips.onboarding", { count: onboarding })} />}
          {nextWeek > 0 && <StatusBadge status="scheduled" className={CHIP} label={t("processes.chips.startsNextWeek", { count: nextWeek })} />}
          {overdue > 0 && <StatusBadge status="pending" className={CHIP} label={t("processes.chips.overdue", { count: overdue })} />}
        </div>
      )}
    </WidgetCard>
  );
};
