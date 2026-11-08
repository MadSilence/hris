"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/desact/avatar";
import { Button } from "@/components/desact/button";
import { NodRing } from "@/components/desact/nod";
import { Skeleton } from "@/components/desact/skeleton";
import { EmptyState, NoResults } from "@/components/feedback/EmptyState";
import { FilterChip } from "@/components/ui/FilterChip";
import { SearchBox } from "@/components/ui/SearchBox";
import { useDebouncedValue } from "@/components/modules/organization/modules/profile/hooks/useDebouncedValue/useDebouncedValue";
import { useAutomation, useAutomationRuns } from "@/components/modules/automations/hooks";
import type { RunHistoryWindowProps } from "@/components/modules/automations/contracts";
import type { AutomationRun, RunChip, RunCounts } from "@/models/automations";
import { cn } from "@/lib/cn";
import { RunStatusBadge } from "./RunStatusBadge";
import { initialsOf, runDay, useRunWords } from "./runWords";
import { ToolWindow } from "./ToolWindow";
import { useAutomationWords } from "./seams";

/** The chips of a run history, in the frame's order, with the count each reads. */
const CHIPS: { chip: Exclude<RunChip, "NEXT_7_DAYS">; count: keyof RunCounts }[] = [
  { chip: "ALL", count: "all" },
  { chip: "FAILED", count: "failed" },
  { chip: "WAITING", count: "waiting" },
  { chip: "SCHEDULED", count: "scheduled" },
  { chip: "DONE", count: "done" },
];

/** Near the bottom of the list, the next slice is asked for. */
const LOAD_AHEAD_PX = 160;

/** Run history (V1–V4b): search, chips with counts, the endless list, the closing line. */
export const RunHistoryWindow: React.FC<RunHistoryWindowProps> = ({ automationId, selectedRunId, onOpenRun, onClose }) => {
  const t = useTranslations("automationsRuns");
  const tCommon = useTranslations("common");
  const [query, setQuery] = React.useState("");
  const [chip, setChip] = React.useState<Exclude<RunChip, "NEXT_7_DAYS">>("ALL");
  const q = useDebouncedValue(query.trim(), 300);

  const runs = useAutomationRuns({ automationId, chip, q: q || null });
  const automation = useAutomation(automationId);
  const words = useAutomationWords();

  const pages = runs.data?.pages ?? [];
  const rows = pages.flatMap((page) => page.content);
  const counts = pages[0]?.counts ?? null;
  const outsideScope = pages[0]?.outsideScope ?? 0;

  const onScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const el = event.currentTarget;
    if (!runs.hasNextPage || runs.isFetchingNextPage) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < LOAD_AHEAD_PX) void runs.fetchNextPage();
  };

  const filtered = chip !== "ALL" || q.length > 0;
  const nothingAtAll = counts ? counts.all === 0 : true;
  const trigger = automation.data?.definition?.trigger ?? null;

  let body: React.ReactNode;
  if (runs.isLoading) {
    body = <RunListSkeleton />;
  } else if (runs.error) {
    body = (
      <EmptyState
        compact
        scene="something-broke"
        title={t("history.errorTitle")}
        description={t("history.errorDescription")}
        action={
          <Button type="button" variant="secondary" size="sm" onClick={() => void runs.refetch()}>
            {tCommon("actions.retry")}
          </Button>
        }
      />
    );
  } else if (rows.length === 0 && (!filtered || nothingAtAll)) {
    body = (
      <EmptyState
        compact
        scene="automations"
        title={t("history.emptyTitle")}
        description={
          trigger
            ? t("history.emptyDescription", { trigger: words.triggerTitle(trigger) })
            : t("history.emptyDescriptionNoTrigger")
        }
      />
    );
  } else if (rows.length === 0) {
    body = (
      <NoResults
        scene={q && chip === "ALL" ? "no-results-s" : "no-match-s"}
        title={t("history.noMatchTitle")}
        hint={q ? t("history.noMatch", { chip, query: q }) : t("history.noMatchChip", { chip })}
        action={
          q ? (
            <Button type="button" variant="secondary" size="sm" onClick={() => setQuery("")}>
              {t("history.clearSearch")}
            </Button>
          ) : (
            <Button type="button" variant="secondary" size="sm" onClick={() => setChip("ALL")}>
              {t("history.showAll")}
            </Button>
          )
        }
      />
    );
  } else {
    body = (
      <ul className="m-0 flex list-none flex-col p-0">
        {rows.map((run) => (
          <RunRow key={run.id} run={run} selected={run.id === selectedRunId} onOpen={() => onOpenRun(run.id)} />
        ))}
      </ul>
    );
  }

  const showToolbar = !runs.error && !(runs.isSuccess && nothingAtAll && !filtered);

  return (
    <ToolWindow title={t("history.title")} width={320} onClose={onClose}>
      {showToolbar && (
        <div className="flex flex-col gap-2 px-4 pb-2">
          <SearchBox value={query} onChange={setQuery} fullWidth />
          {runs.isLoading ? (
            <div className="flex flex-wrap gap-1.5" aria-hidden>
              {["w-16", "w-18", "w-20", "w-22", "w-16"].map((w, i) => (
                <Skeleton key={i} className={cn("h-8 rounded-pill", w)} />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {CHIPS.map(({ chip: c, count }) => (
                <FilterChip key={c} selected={chip === c} onClick={() => setChip(c)}>
                  {t(`history.chip.${c}`, { count: counts?.[count] ?? 0 })}
                </FilterChip>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2" onScroll={onScroll} data-testid="run-list">
        {body}
        {runs.isFetchingNextPage && (
          <div className="flex justify-center py-3">
            <NodRing size="sm" label={t("history.loadingMore")} />
          </div>
        )}
        {rows.length > 0 && !runs.hasNextPage && outsideScope > 0 && (
          <p className="px-2 pt-2 pb-1 text-hint text-tertiary">{t("history.outsideScope", { count: outsideScope })}</p>
        )}
      </div>
    </ToolWindow>
  );
};

const RunRow: React.FC<{ run: AutomationRun; selected: boolean; onOpen: () => void }> = ({ run, selected, onOpen }) => {
  const words = useRunWords();
  const name = run.person?.name ?? "";
  const about = words.about(run);
  const late = words.late(run);
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        aria-current={selected || undefined}
        className={cn(
          "flex min-h-14 w-full items-center gap-2.5 rounded-control px-3 py-2 text-left transition-colors duration-(--duration-hover)",
          selected ? "bg-accent-subtle" : "hover:bg-row-hover",
        )}
      >
        <Avatar className="size-7">
          {run.person?.avatarUrl ? <AvatarImage src={run.person.avatarUrl} alt="" /> : null}
          <AvatarFallback name={name} className="text-hint">
            {initialsOf(name)}
          </AvatarFallback>
        </Avatar>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-body font-medium text-primary" title={name}>
            {name}
          </span>
          {about && (
            <span className="truncate text-hint text-tertiary" title={about}>
              {about}
            </span>
          )}
          {late && <span className="text-hint text-status-pending-fill">{late}</span>}
        </span>
        <span className="flex shrink-0 flex-col items-end gap-0.5">
          <RunStatusBadge status={run.status} />
          <span className="text-hint text-tertiary">{words.day(runDay(run))}</span>
        </span>
      </button>
    </li>
  );
};

const RunListSkeleton: React.FC = () => (
  <div className="flex flex-col" aria-hidden>
    {Array.from({ length: 6 }, (_, i) => (
      <div key={i} className="flex h-14 items-center gap-2.5 px-3">
        <Skeleton className="size-7 rounded-pill" />
        <div className="flex flex-1 flex-col gap-1.5">
          <Skeleton className="h-3.5 w-3/5" />
          <Skeleton className="h-3 w-2/5" />
        </div>
        <Skeleton className="h-6 w-16 rounded-pill" />
      </div>
    ))}
  </div>
);
