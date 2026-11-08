"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FilterHorizontalIcon, PencilEdit02Icon } from "@hugeicons/core-free-icons";
import { useTranslations } from "next-intl";

import { Button } from "@/components/desact/button";
import { Icon } from "@/components/desact/icon";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/desact/popover";
import { Skeleton } from "@/components/desact/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/desact/table";
import { EmptyState, NoResults } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { FilterChip } from "@/components/ui/FilterChip";
import { SearchBox } from "@/components/ui/SearchBox";
import { useAutomation, useAutomationRuns, useAutomations } from "@/components/modules/automations/hooks";
import { ConditionBuilder, RunStatusBadge, RunWindow } from "./seams";
import { AutomationIcon, PersonAvatar } from "@/components/modules/automations/shared";
import { useDebouncedValue } from "@/components/modules/organization/modules/profile/hooks/useDebouncedValue";
import type { AutomationRun, RunChip, RunCounts } from "@/models/automations";
import type { Segment } from "@/models/segment/Segment";
import { formatShortDate, formatShortRange, useDisplayLanguage } from "@/lib/date";
import { cn } from "@/lib/cn";
import { automationsHref } from "../list/listModel";
import { useCount, useWhen } from "../list/format";
import { AutomationPill } from "./AutomationPill";

/** The chips of Activity: All · Needs attention (failed) · Waiting · Next 7 days. */
export type ActivityChip = Extract<RunChip, "ALL" | "FAILED" | "WAITING" | "NEXT_7_DAYS">;

/** The chips of Activity, in order, and the count each reads from `RunSlice.counts`. */
export const ACTIVITY_CHIPS: { chip: ActivityChip; count: keyof RunCounts }[] = [
  { chip: "ALL", count: "all" },
  { chip: "FAILED", count: "failed" },
  { chip: "WAITING", count: "waiting" },
  { chip: "NEXT_7_DAYS", count: "next7Days" },
];

export const isActivityChip = (value: string | null | undefined): value is ActivityChip =>
  ACTIVITY_CHIPS.some((entry) => entry.chip === value);

const PAGE_SIZE = 30;

/** The moment a row is about: what is coming for a run still ahead, what happened for the rest. */
export const runMoment = (run: AutomationRun): string | null =>
  run.status === "SCHEDULED" || run.status === "WAITING"
    ? run.nextDate ?? run.triggerDate ?? run.createdAt
    : run.finishedAt ?? run.createdAt;

/**
 * Activity (`automations-activity`, V8, V8b): every run in the company, or one automation's. Search over people, the
 * condition builder over people in a popover, the Automation pill, chips with counts, and an endless table. A row
 * opens the run in the editor; a run named in the address (`?run=`, "See why" on a card) opens beside the table.
 */
export const ActivityTab: React.FC<{
  automationId: string | null;
  runId: string | null;
  initialChip?: ActivityChip;
  /** "See why" on a card: open the newest failed run once the list is in. */
  openLatest?: boolean;
  canManage: boolean;
  onAutomationChange: (automationId: string | null) => void;
  onRunChange: (runId: string | null) => void;
  onGoToAutomations: () => void;
}> = ({ automationId, runId, initialChip = "ALL", openLatest = false, canManage, onAutomationChange, onRunChange, onGoToAutomations }) => {
  const t = useTranslations("automationsList");
  const router = useRouter();
  const count = useCount();

  const [chip, setChip] = React.useState<ActivityChip>(initialChip);
  const [search, setSearch] = React.useState("");
  const [segment, setSegment] = React.useState<Segment | null>(null);
  const q = useDebouncedValue(search, 300);

  const automations = useAutomations(false);
  const picked = useAutomation(automationId);
  const runs = useAutomationRuns({ automationId, chip, q: q.trim() || null, segment, size: PAGE_SIZE, countsFollowSearch: true });

  const pages = runs.data?.pages ?? [];
  const rows = pages.flatMap((page) => page.content);
  const counts = pages[0]?.counts ?? null;
  const outsideScope = pages[pages.length - 1]?.outsideScope ?? 0;
  const filterCount = segment?.filters.length ?? 0;
  const searching = q.trim() !== "" || filterCount > 0;

  // "See why": the newest failure opens by itself, once.
  const opened = React.useRef(false);
  React.useEffect(() => {
    if (!openLatest || opened.current || runId || !rows[0]) return;
    opened.current = true;
    onRunChange(rows[0].id);
  }, [openLatest, runId, rows, onRunChange]);

  const clearFilters = () => {
    setSearch("");
    setSegment(null);
  };

  const toolbar = (
    <div className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <SearchBox value={search} onChange={setSearch} />
        <Popover>
          <PopoverTrigger asChild>
            <FilterChip selected={filterCount > 0} withArrow={false} className={filterCount > 0 ? undefined : "pl-2.5"}>
              <Icon icon={FilterHorizontalIcon} size="sm" />
              {filterCount > 0 ? t("activity.filtersCount", { count: filterCount }) : t("activity.filters")}
            </FilterChip>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[560px] max-w-[calc(100vw-2rem)]">
            <ConditionBuilder value={segment} onChange={setSegment} />
          </PopoverContent>
        </Popover>
        <AutomationPill
          automations={automations.data ?? []}
          value={automationId}
          pickedName={picked.data?.name ?? null}
          onChange={onAutomationChange}
        />
      </div>
      {automationId ? (
        <Button type="button" variant="secondary" onClick={() => router.push(automationsHref.open(automationId))}>
          <Icon icon={PencilEdit02Icon} size="sm" />
          {t("activity.openInEditor")}
        </Button>
      ) : null}
    </div>
  );

  const chips = (
    <div className="flex flex-wrap items-center gap-2" role="group">
      {ACTIVITY_CHIPS.map((entry) => (
        <FilterChip key={entry.chip} selected={chip === entry.chip} onClick={() => setChip(entry.chip)}>
          {t(`activity.chips.${entry.chip}`)}
          {counts ? (
            <span className={cn("tabular-nums", chip === entry.chip ? "text-on-inverse/70" : "text-tertiary")}>
              {count(counts[entry.count])}
            </span>
          ) : (
            <Skeleton className="h-3 w-5 rounded-pill" />
          )}
        </FilterChip>
      ))}
    </div>
  );

  let body: React.ReactNode;
  if (runs.isLoading) {
    body = <RunsTable oneAutomation={Boolean(automationId)} rows={[]} loading />;
  } else if (runs.error) {
    body = (
      <ErrorState
        error={runs.error}
        title={t("activity.error.title")}
        message={t("activity.error.description")}
        onRetry={() => void runs.refetch()}
      />
    );
  } else if (rows.length === 0 && searching) {
    body = (
      <NoResults
        scene={filterCount > 0 ? "no-match-s" : "no-results-s"}
        title={t("activity.noResults.title")}
        hint={t("activity.noResults.hint")}
        action={
          <Button type="button" variant="secondary" size="sm" onClick={clearFilters}>
            {t("activity.noResults.clear")}
          </Button>
        }
      />
    );
  } else if (rows.length === 0 && chip !== "ALL") {
    body = <EmptyState scene="all-caught-up" title={t(`activity.zero.${chip}`)} description="" compact />;
  } else if (rows.length === 0) {
    body = (
      <EmptyState
        scene="automations"
        title={t("activity.empty.title")}
        description={t("activity.empty.description")}
        action={
          <Button type="button" variant="secondary" onClick={onGoToAutomations}>
            {t("activity.empty.action")}
          </Button>
        }
      />
    );
  } else {
    body = (
      <RunsTable
        oneAutomation={Boolean(automationId)}
        rows={rows}
        selectedRunId={runId}
        hasMore={Boolean(runs.hasNextPage)}
        loadingMore={runs.isFetchingNextPage}
        onLoadMore={() => void runs.fetchNextPage()}
        outsideScope={outsideScope}
      />
    );
  }

  return (
    <div className="flex min-h-0 gap-4">
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        {toolbar}
        {chips}
        {body}
      </div>
      {runId ? (
        <aside className="w-[340px] shrink-0">
          <RunWindow runId={runId} definition={null} canManage={canManage} onClose={() => onRunChange(null)} />
        </aside>
      ) : null}
    </div>
  );
};

/** The endless table (§ 13.5, rows 60): Person · Automation · When · Status · See why; V8b drops Automation. */
const RunsTable: React.FC<{
  oneAutomation: boolean;
  rows: AutomationRun[];
  loading?: boolean;
  selectedRunId?: string | null;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
  outsideScope?: number;
}> = ({ oneAutomation, rows, loading = false, selectedRunId = null, hasMore = false, loadingMore = false, onLoadMore, outsideScope = 0 }) => {
  const t = useTranslations("automationsList");
  const router = useRouter();
  const when = useWhen();
  const about = useAboutLine();
  const sentinel = React.useRef<HTMLTableRowElement>(null);

  React.useEffect(() => {
    const node = sentinel.current;
    if (!node || !hasMore || !onLoadMore) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && !loadingMore) onLoadMore();
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, onLoadMore]);

  const widths = oneAutomation ? ["w-[40%]", "w-[20%]", "w-[20%]", "w-[20%]"] : ["w-[26%]", "w-[30%]", "w-[16%]", "w-[16%]", "w-[12%]"];
  const columns = oneAutomation ? 4 : 5;
  const open = (run: AutomationRun) => router.push(automationsHref.run(run.ruleId, run.id));

  return (
    <div className="flex flex-col">
      <div className="overflow-hidden rounded-t-card border border-b-0 border-divider bg-card">
        <Table className="table-fixed">
          <TableHeader className="sticky top-0 z-10 bg-card">
            <TableRow className="h-9">
              <TableHead className={cn(widths[0], "text-hint font-medium text-tertiary")}>{t("activity.columns.person")}</TableHead>
              {!oneAutomation && (
                <TableHead className={cn(widths[1], "text-hint font-medium text-tertiary")}>{t("activity.columns.automation")}</TableHead>
              )}
              <TableHead className={cn(widths[oneAutomation ? 1 : 2], "text-hint font-medium text-tertiary")}>{t("activity.columns.when")}</TableHead>
              <TableHead className={cn(widths[oneAutomation ? 2 : 3], "text-hint font-medium text-tertiary")}>{t("activity.columns.status")}</TableHead>
              <TableHead className={widths[oneAutomation ? 3 : 4]}>
                <span className="sr-only">{t("activity.seeWhy")}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? [0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <TableRow key={i} className="h-[60px]">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="size-7 rounded-pill" />
                        <div className="flex flex-col gap-1.5">
                          <Skeleton className="h-4 w-28" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                    </TableCell>
                    {Array.from({ length: columns - 1 }, (_, c) => (
                      <TableCell key={c}>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : rows.map((run) => {
                  const subtitle = about(run);
                  return (
                    <TableRow
                      key={run.id}
                      data-test="run-row"
                      tabIndex={0}
                      aria-selected={run.id === selectedRunId}
                      className={cn("h-[60px] cursor-pointer", run.id === selectedRunId && "bg-accent-subtle")}
                      onClick={() => open(run)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") open(run);
                      }}
                    >
                      <TableCell>
                        <div className="flex min-w-0 items-center gap-3">
                          <PersonAvatar name={run.person?.name} avatarUrl={run.person?.avatarUrl} size={28} />
                          <div className="min-w-0">
                            <p className="truncate text-body font-medium text-primary" title={run.person?.name ?? undefined}>
                              {run.person?.name ?? t("card.someone")}
                            </p>
                            {subtitle ? <p className="truncate text-hint text-tertiary">{subtitle}</p> : null}
                          </div>
                        </div>
                      </TableCell>
                      {!oneAutomation && (
                        <TableCell>
                          <span className="flex min-w-0 items-center gap-2 text-body text-primary">
                            <AutomationIcon icon={run.ruleIcon} size={16} className="text-tertiary" />
                            <span className="truncate" title={run.ruleName ?? undefined}>{run.ruleName}</span>
                          </span>
                        </TableCell>
                      )}
                      <TableCell className="text-body text-primary tabular-nums">{when(runMoment(run), true)}</TableCell>
                      <TableCell>
                        <RunStatusBadge status={run.status} />
                      </TableCell>
                      <TableCell>
                        {run.status === "FAILED" ? (
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={(event) => {
                              event.stopPropagation();
                              open(run);
                            }}
                          >
                            {t("activity.seeWhy")}
                          </Button>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  );
                })}
            {hasMore ? (
              <TableRow ref={sentinel} className="h-[60px]">
                <TableCell colSpan={columns}>
                  <Skeleton className="h-4 w-1/3" />
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
      {!hasMore && !loading && outsideScope > 0 ? (
        <p className="px-4 py-3 text-hint text-tertiary">{t("activity.hidden", { count: outsideScope })}</p>
      ) : null}
    </div>
  );
};

/** The row's second line: what the run was about — a leave and its dates, a process, the date it counted from. */
const useAboutLine = () => {
  const t = useTranslations("automationsList");
  const tShared = useTranslations("automations");
  const language = useDisplayLanguage();
  return (run: AutomationRun): string => {
    const about = run.about ?? {};
    const text = (key: string) => (typeof about[key] === "string" ? (about[key] as string) : "");
    if (about.kind === "TIME_OFF") {
      const type = text("leaveType");
      const start = text("start");
      const end = text("end");
      if (start) return t("activity.about.leave", { type, range: formatShortRange(start, end || start, { language }) });
      const days = Number(about.days);
      return Number.isFinite(days) && days > 0 ? t("activity.about.leaveDays", { type, days }) : type;
    }
    if (about.kind === "PROCESS") return text("name");
    const date = text("anchorDate") || text("date");
    const trigger = tShared(`trigger.${run.triggerType === "EVENT" ? "PROCESS_COMPLETED" : run.triggerType}`);
    return date ? t("activity.about.dated", { trigger, date: formatShortDate(date, { language }) }) : trigger;
  };
};
