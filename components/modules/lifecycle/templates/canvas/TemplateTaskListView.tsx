"use client";

import React from "react";
import { Add01Icon, Alert02Icon, HourglassIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Button } from "@/components/desact/button";
import { cn } from "@/lib/cn";
import { TASK_KIND_LABELS, type ProcessType } from "@/models/lifecycle";
import {
  dayLabel,
  laneIdOf,
  PHASE_LABELS,
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
  const laneLabel = (i: DraftItem) => lanes.find((l) => l.id === laneIdOf(i))?.label ?? "";
  const titleOf = (key: string) => items.find((i) => i.key === key)?.title || "Untitled task";

  // Nothing yet: the whole place is the invitation, as every empty list in the product is — and the only way
  // to add, so there is no Add Task button above it.
  if (items.length === 0) {
    return (
      <div className="h-full" data-test="template-list-view">
        <EmptyState
          scene="onboarding"
          title="No tasks yet"
          description="A process started from this template would have nothing to do. Add the first task."
          onCreate={readOnly ? undefined : onAddAction}
          createLabel="Add task"
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
            Add task
          </Button>
        </div>
      )}

      {PHASES.map((phase) => {
        const inPhase = items.filter((i) => phaseOf(i) === phase).sort(timelineOrder);
        if (inPhase.length === 0) return null;
        return (
          <section key={phase} aria-labelledby={`phase-${phase}`} className="space-y-2">
            <h3 id={`phase-${phase}`} className="text-hint font-medium text-tertiary">
              {phase === "BEFORE_START" && type === "OFFBOARDING" ? "By the last day" : PHASE_LABELS[phase]}
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
                      <Icon icon={kindIcon} size="sm" className="mt-0.5 text-tertiary" label={TASK_KIND_LABELS[item.kind]} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-primary">{item.title || "Untitled task"}</span>
                        <span className="block text-hint text-tertiary">
                          {dayLabel(item, type)} · {laneLabel(item)}
                        </span>
                        {item.waitsFor.length > 0 && (
                          <span className="mt-0.5 flex items-center gap-1 text-hint text-tertiary">
                            <Icon icon={HourglassIcon} size="sm" />
                            Waits for {item.waitsFor.map(titleOf).join(", ")}
                          </span>
                        )}
                      </span>
                      {item.assigneeKind === "SPECIFIC_USER" && (item.assigneeProblem || !item.assigneeUserId) && (
                        <Icon icon={Alert02Icon} size="sm" className="mt-0.5 shrink-0 text-status-pending-text" label="Needs a person who can take it" />
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
