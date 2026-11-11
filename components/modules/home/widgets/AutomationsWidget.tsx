"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { CancelCircleIcon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/desact/tooltip";
import { cn } from "@/lib/cn";
import { useDisplayLocale, useShortDates } from "@/lib/date";
import type { AutomationRunDay, AutomationsWeek } from "@/models/home";
import { useAutomationsWeek } from "@/components/modules/home/hooks";
import { automationsHref } from "@/components/modules/automations/list";
import { useRunWords } from "@/components/modules/automations/runs";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  BigNumber,
  WidgetCard,
  WidgetEmpty,
  WidgetError,
  WidgetInfo,
  WidgetLink,
  WidgetSkeleton,
} from "@/components/modules/home/components/WidgetCard";
import type { HomeWidgetProps } from "./catalogue";

const total = (day: AutomationRunDay) => day.done + day.failed + day.skipped;
/** A column of the dot chart holds at most this many dots — one per run; a busier week is scaled to fit. */
const DOTS = 8;

/**
 * How many dots a day's column draws, and how many of them are red. A dot is a run; only a week whose busiest day has
 * more runs than a column holds is scaled down (walk of 2026-11-11: one failure was drawn as four red dots).
 */
export const dotsFor = (day: AutomationRunDay, busiest: number) => {
  const count = total(day);
  const scale = busiest > DOTS ? DOTS / busiest : 1;
  const dots = count === 0 ? 0 : Math.max(1, Math.round(count * scale));
  const failedDots = day.failed === 0 ? 0 : Math.min(dots, Math.max(1, Math.round(day.failed * scale)));
  return { dots, failedDots };
};

const weekday = (iso: string, locale?: string) =>
  new Intl.DateTimeFormat(locale, { weekday: "narrow", timeZone: "UTC" }).format(new Date(`${iso}T12:00:00Z`));

/** The failure of today, in a red soft block, and Fix it on it. */
const FailureBlock: React.FC<{ week: AutomationsWeek; preview?: boolean }> = ({ week, preview }) => {
  const t = useTranslations("home");
  const words = useRunWords();
  const router = useRouter();
  const run = week.failedToday[0];
  if (!run) {
    return (
      <div className="flex flex-col gap-0.5 rounded-tint bg-status-approved-bg px-3.5 py-3">
        <p className="flex items-center gap-1.5 text-label text-status-approved-text">
          <Icon icon={CheckmarkCircle02Icon} size="sm" />
          {t("automations.allFine")}
        </p>
        <p className="text-hint text-secondary">{t("automations.noFailures")}</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-1 rounded-tint bg-status-declined-bg px-3.5 py-3">
      <p className="flex items-center gap-1.5 text-label text-status-declined-text">
        <Icon icon={CancelCircleIcon} size="sm" />
        {t("automations.failedToday", { count: week.failedTodayCount })}
      </p>
      <p className="line-clamp-2 text-hint text-secondary">
        {t("automations.failureLine", { name: run.ruleName ?? "", reason: words.reason(run.reason) ?? "" })}
      </p>
      <Button
        type="button"
        variant="link"
        size="sm"
        className="w-fit text-label"
        tabIndex={preview ? -1 : undefined}
        onClick={() => router.push(automationsHref.seeWhy(run.ruleId, run.id))}
      >
        {t("automations.fixIt")}
      </Button>
    </div>
  );
};

/** One dot column per day, today in the accent, a failed run a red dot; hovering a day says what ran. */
const DotChart: React.FC<{ days: AutomationRunDay[] }> = ({ days }) => {
  const t = useTranslations("home");
  const locale = useDisplayLocale();
  const dates = useShortDates();
  const busiest = Math.max(1, ...days.map(total));
  return (
    <div className="flex items-end justify-between gap-1">
      {days.map((day, i) => {
        const isToday = i === days.length - 1;
        const count = total(day);
        const { dots, failedDots } = dotsFor(day, busiest);
        return (
          <Tooltip key={day.date}>
            <TooltipTrigger asChild>
              <Link href={automationsHref.activity()} className="flex flex-1 flex-col items-center gap-1.5" aria-label={t("automations.dayTooltip", { day: dates.date(day.date, { weekday: true }), count })}>
                <span className="flex h-[88px] flex-col-reverse items-center gap-1">
                  {Array.from({ length: dots }, (_, d) => (
                    <span
                      key={d}
                      className={cn(
                        "size-2 rounded-pill",
                        d >= dots - failedDots ? "bg-danger" : isToday ? "bg-accent" : "bg-accent-muted",
                      )}
                    />
                  ))}
                </span>
                <span className={cn("text-hint", isToday ? "font-semibold text-accent-text" : "text-tertiary")}>
                  {isToday ? t("card.today") : weekday(day.date, locale)}
                </span>
              </Link>
            </TooltipTrigger>
            <TooltipContent title={t("automations.dayTooltip", { day: isToday ? t("card.today") : dates.date(day.date, { weekday: true }), count })}>
              <span className="flex flex-col gap-0.5">
                <span className="flex items-center gap-1.5"><span className="size-2 rounded-pill bg-accent" />{t("automations.ranFine")} {day.done}</span>
                <span className="flex items-center gap-1.5"><span className="size-2 rounded-pill bg-danger" />{t("automations.failedLabel")} {day.failed}</span>
                <span className="flex items-center gap-1.5"><span className="size-2 rounded-pill bg-mist" />{t("automations.skipped")} {day.skipped}</span>
              </span>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
};

/** The next step due: which automation, on what day. */
const NextRun: React.FC<{ week: AutomationsWeek }> = ({ week }) => {
  const t = useTranslations("home");
  const dates = useShortDates();
  if (!week.next) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-hint text-tertiary">{t("automations.next")}</p>
      <p className="truncate text-label text-primary">
        {t("automations.nextLine", { name: week.next.ruleName ?? "", date: week.next.date ? dates.date(week.next.date, { weekday: true }) : "" })}
      </p>
    </div>
  );
};

/**
 * What noddo did this week, and what needs a fix (`home-widgets` § 10) — HR and admins only. The runs come from one
 * read of the last seven days; a failure's Fix it opens the failed run in Activity.
 */
export const AutomationsWidget: React.FC<HomeWidgetProps> = ({ size, preview }) => {
  const t = useTranslations("home");
  const query = useAutomationsWeek();
  const title = t("widgets.automations.title");
  const seeAll = <WidgetLink href={automationsHref.list}>{t("card.seeAll")}</WidgetLink>;

  if (query.isLoading) {
    return (
      <WidgetCard title={title} size={size}>
        <WidgetSkeleton number rows={size === "S" ? 0 : 2} />
      </WidgetCard>
    );
  }
  if (query.error || !query.data) {
    return (
      <WidgetCard title={title} size={size}>
        <WidgetError size={size} message={t("card.couldNotLoad", { thing: "automations" })} onRetry={() => void query.refetch()} />
      </WidgetCard>
    );
  }

  const week = query.data;
  const runs = week.days.reduce((sum, day) => sum + total(day), 0);
  if (runs === 0 && !week.next) {
    return (
      <WidgetCard title={title} size={size}>
        <WidgetEmpty
          size={size}
          scene="automations"
          title={t("automations.emptyTitle")}
          line={t("automations.emptyLine")}
          action={
            size === "S" ? undefined : (
              <Button asChild variant="secondary" size="sm" tabIndex={preview ? -1 : undefined}>
                <Link href={automationsHref.list}>{t("automations.create")}</Link>
              </Button>
            )
          }
        />
      </WidgetCard>
    );
  }

  if (size === "S") {
    return (
      <WidgetCard title={title} size={size}>
        <BigNumber size="s" value={runs} word={t("automations.runs", { count: runs })} />
        {week.failedTodayCount > 0 && (
          <StatusBadge status="declined" size="sm" label={t("automations.failed", { count: week.failedTodayCount })} />
        )}
      </WidgetCard>
    );
  }

  if (size === "M") {
    return (
      <WidgetCard title={title} size={size} aside={seeAll}>
        <BigNumber size="m" value={runs} word={t("automations.runsThisWeek", { count: runs })} />
        <FailureBlock week={week} preview={preview} />
        <div className="mt-auto">
          <NextRun week={week} />
        </div>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard title={title} size={size} aside={seeAll}>
      <WidgetInfo>{t("automations.thisWeekRuns", { count: runs })}</WidgetInfo>
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_200px] gap-5">
        <div className="flex flex-col justify-end">
          <DotChart days={week.days} />
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <FailureBlock week={week} preview={preview} />
          <NextRun week={week} />
        </div>
      </div>
    </WidgetCard>
  );
};
