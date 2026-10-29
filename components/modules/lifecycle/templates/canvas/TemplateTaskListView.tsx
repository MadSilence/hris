"use client";

import React from "react";
import { Hourglass, Plus, TriangleAlert } from "lucide-react";
import { Button } from "@/public/desact/src/components/ui/button";
import { cn } from "@/public/desact/src/components/ui/utils";
import { TASK_KIND_LABELS } from "@/models/lifecycle";
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
export function TemplateTaskListView({ items, lanes, selectedKey, readOnly, onSelectAction, onAddAction }: Props) {
  const laneLabel = (i: DraftItem) => lanes.find((l) => l.id === laneIdOf(i))?.label ?? "";
  const titleOf = (key: string) => items.find((i) => i.key === key)?.title || "Untitled task";

  return (
    <div className="space-y-6 px-1" data-test="template-list-view">
      {!readOnly && (
        <div className="flex justify-end">
          <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={onAddAction}>
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        </div>
      )}

      {items.length === 0 && (
        <p className="py-10 text-center text-sm text-muted-foreground">
          No tasks yet. A process started from this template would have nothing to do.
        </p>
      )}

      {PHASES.map((phase) => {
        const inPhase = items.filter((i) => phaseOf(i) === phase).sort(timelineOrder);
        if (inPhase.length === 0) return null;
        return (
          <section key={phase} aria-labelledby={`phase-${phase}`} className="space-y-2">
            <h3 id={`phase-${phase}`} className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {PHASE_LABELS[phase]}
            </h3>
            <ul className="divide-y divide-brown-100 overflow-hidden rounded-lg border border-brown-100 bg-white">
              {inPhase.map((item) => {
                const Icon = TASK_KIND_ICON[item.kind];
                return (
                  <li key={item.key}>
                    <button
                      type="button"
                      onClick={() => onSelectAction(item.key)}
                      aria-current={selectedKey === item.key ? "true" : undefined}
                      className={cn(
                        "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-brown-50",
                        selectedKey === item.key && "bg-brown-50",
                      )}
                    >
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-label={TASK_KIND_LABELS[item.kind]} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-brown-900">{item.title || "Untitled task"}</span>
                        <span className="block text-xs text-muted-foreground">
                          {dayLabel(item)} · {laneLabel(item)}
                        </span>
                        {item.waitsFor.length > 0 && (
                          <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                            <Hourglass className="h-3 w-3" />
                            Waits for {item.waitsFor.map(titleOf).join(", ")}
                          </span>
                        )}
                      </span>
                      {item.assigneeKind === "SPECIFIC_USER" && (item.assigneeProblem || !item.assigneeUserId) && (
                        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning-700" aria-label="Needs a person who can take it" />
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
