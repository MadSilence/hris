"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Add01Icon, Alert02Icon, HourglassIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Button } from "@/components/desact/button";
import { cn } from "@/lib/cn";
import type { ProcessType } from "@/models/lifecycle";
import {
  dayLabel,
  laneIdOf,
  phaseOf,
  timelineOrder,
  type DraftItem,
  type Lane,
  type Phase,
} from "./draft";
import { TASK_KIND_ICON } from "./TaskKindIcon";

type Props = {
  type?: ProcessType;
  items: DraftItem[];
  lanes: Lane[];
  selectedKey: string | null;
  readOnly?: boolean;
  onSelectAction: (key: string) => void;
  onAddAction: () => void;
};

const PHASES: Phase[] = ["BEFORE_START", "WEEK_1", "MONTH_1", "LATER"];

/**
 * The template as a list, grouped by phase — the canvas's twin, the same data and the same side panel.
 * It is the accessible view (the canvas gives keyboard focus but no readable structure) and the only view
 * on a small screen (research § B.5).
 */
export function TemplateTaskListView({ type, items, lanes, selectedKey, readOnly, onSelectAction, onAddAction }: Props) {
  const t = useTranslations("lifecycle");
  const untitled = t("shared.untitledTask");
  const laneLabel = (i: DraftItem) => lanes.find((l) => l.id === laneIdOf(i))?.label ?? "";
  const titleOf = (key: string) => items.find((i) => i.key === key)?.title || untitled;

  // Nothing yet: the whole place is the invitation, as every empty list in the product is — and the only way
  // to add, so there is no Add Task button above it.
  if (items.length === 0) {
    return (
      <div className="h-full" data-test="template-list-view">
        <EmptyState
          scene="onboarding"
          title={t("listView.emptyTitle")}
          description={t("listView.emptyDescription")}
          onCreate={readOnly ? undefined : onAddAction}
          createLabel={t("shared.addTask")}
          fill
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 px-1" data-test="template-list-view">
      {!readOnly && (
        <div className="flex justify-end">
          <Button type="button" variant="secondary" size="sm" className="gap-1.5" onClick={onAddAction}>
            <Icon icon={Add01Icon} size="sm" />
            {t("shared.addTask")}
          </Button>
        </div>
      )}

      {PHASES.map((phase) => {
        const inPhase = items.filter((i) => phaseOf(i) === phase).sort(timelineOrder);
        if (inPhase.length === 0) return null;
        return (
          <section key={phase} aria-labelledby={`phase-${phase}`} className="space-y-2">
            <h3 id={`phase-${phase}`} className="text-hint font-medium text-tertiary">
              {phase === "BEFORE_START" && type === "OFFBOARDING" ? t("due.byLastDay") : t(`phase.${phase}`)}
            </h3>
            <ul className="divide-y divide-divider overflow-hidden rounded-control border border-divider bg-card">
              {inPhase.map((item) => {
                const kindIcon = TASK_KIND_ICON[item.kind];
                return (
                  <li key={item.key}>
                    <button
                      type="button"
                      onClick={() => onSelectAction(item.key)}
                      aria-current={selectedKey === item.key ? "true" : undefined}
                      className={cn(
                        "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-subtle",
                        selectedKey === item.key && "bg-subtle",
                      )}
                    >
                      <Icon icon={kindIcon} size="sm" className="mt-0.5 text-tertiary" label={t(`taskKind.${item.kind}`)} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-primary">{item.title || untitled}</span>
                        <span className="block text-hint text-tertiary">
                          {t("canvas.dayLane", { day: dayLabel(item, t, type), lane: laneLabel(item) })}
                        </span>
                        {item.waitsFor.length > 0 && (
                          <span className="mt-0.5 flex items-center gap-1 text-hint text-tertiary">
                            <Icon icon={HourglassIcon} size="sm" />
                            {t("shared.waitsFor", { names: item.waitsFor.map(titleOf).join(", ") })}
                          </span>
                        )}
                      </span>
                      {item.assigneeKind === "SPECIFIC_USER" && (item.assigneeProblem || !item.assigneeUserId) && (
                        <Icon icon={Alert02Icon} size="sm" className="mt-0.5 shrink-0 text-status-pending-text" label={t("shared.needsPerson")} />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
