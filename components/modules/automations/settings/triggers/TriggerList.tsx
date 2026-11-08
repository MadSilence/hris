"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/desact/icon";
import { Skeleton } from "@/components/desact/skeleton";
import { SearchBox } from "@/components/ui/SearchBox";
import { Illustration } from "@/components/illustrations";
import { cn } from "@/lib/cn";
import type { TriggerListProps } from "../../contracts";
import { TRIGGER_CHOICES, TRIGGER_GROUPS, choiceOf, defaultTrigger, offered, type TriggerChoiceKey } from "./triggerChoices";

/**
 * The trigger list (F2), inside the "What starts it" tool window: Search, then the events in their groups — People,
 * Dates, Time off, Processes. Each row 36 high, radius 8, accent-subtle on hover (§ 13.7 menu item). Picking one
 * hands the editor the trigger with its defaults; picking the row already in use keeps its settings.
 */
export const TriggerList: React.FC<TriggerListProps> = ({ catalog, current, onPick }) => {
  const t = useTranslations("automationsSettings");
  const tA = useTranslations("automations");
  const [query, setQuery] = React.useState("");
  const currentKey = choiceOf(current);
  const q = query.trim().toLocaleLowerCase();

  const groups = TRIGGER_GROUPS.map((group) => ({
    group,
    rows: TRIGGER_CHOICES.filter((c) => c.group === group && offered(catalog, c.key)).filter(
      (c) => !q || tA(`trigger.${c.key}`).toLocaleLowerCase().includes(q),
    ),
  })).filter((g) => g.rows.length > 0);

  const pick = (key: TriggerChoiceKey) => onPick(key === currentKey && current ? current : defaultTrigger(key));

  return (
    <div className="flex flex-col gap-3">
      <SearchBox fullWidth value={query} onChange={setQuery} aria-label={t("triggerList.search")} />
      {groups.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 text-body text-secondary">
          <Illustration scene="no-results-s" size="s" />
          {t("triggerList.noResults")}
        </div>
      ) : (
        groups.map(({ group, rows }) => (
          <div key={group} role="group" aria-label={tA(`triggerGroup.${group}`)} className="flex flex-col gap-0.5">
            <p className="px-2 pb-1 text-label text-tertiary">{tA(`triggerGroup.${group}`)}</p>
            {rows.map((row) => (
              <button
                key={row.key}
                type="button"
                aria-current={row.key === currentKey || undefined}
                onClick={() => pick(row.key)}
                className={cn(
                  "flex h-9 w-full items-center gap-2.5 rounded-control px-2 text-left text-body text-primary",
                  "hover:bg-accent-subtle focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent",
                  row.key === currentKey && "bg-accent-subtle",
                )}
              >
                <Icon icon={row.icon} className="shrink-0 text-secondary" />
                <span className="truncate">{tA(`trigger.${row.key}`)}</span>
              </button>
            ))}
          </div>
        ))
      )}
    </div>
  );
};

/** The list while the catalogue loads: three groups of skeleton rows. */
export const TriggerListSkeleton: React.FC = () => (
  <div className="flex flex-col gap-4" aria-hidden>
    {[3, 2, 3].map((n, g) => (
      <div key={g} className="flex flex-col gap-2">
        <Skeleton className="h-4 w-20" />
        {Array.from({ length: n }, (_, i) => (
          <Skeleton key={i} className="h-9 w-full" />
        ))}
      </div>
    ))}
  </div>
);
