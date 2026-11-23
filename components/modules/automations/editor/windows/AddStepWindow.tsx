"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { SearchBox } from "@/components/ui/SearchBox";
import { NoResults } from "@/components/feedback/EmptyState";
import { Icon } from "@/components/desact/icon";
import { STEP_TYPE_ICONS } from "@/components/modules/automations/shared";
import { cn } from "@/lib/cn";
import type { AutomationStepType } from "@/models/automations";
import { filterGroups, STEP_DRAG_TYPE } from "../canvas/stepCatalogue";

/**
 * Add a step (D2, the designers' fixes E4–E5): Search, then the four groups from the catalogue's steps. Drag a step
 * onto the canvas, or click it to add after the selected step (or at the end of the trunk). The hint is the window's
 * footer, {@link AddStepHint}.
 */
export const AddStepWindow: React.FC<{
  actions: AutomationStepType[];
  onAdd: (type: AutomationStepType) => void;
  onDragChange: (dragging: boolean) => void;
}> = ({ actions, onAdd, onDragChange }) => {
  const t = useTranslations("automationsEditor");
  const tShared = useTranslations("automations");
  const [query, setQuery] = React.useState("");
  const nameOf = (type: AutomationStepType) => tShared(`stepType.${type}`);
  const groups = filterGroups(actions, query, nameOf);

  return (
    <div className="flex min-h-full flex-col">
      <div className="px-5 pt-4 pb-2">
        <SearchBox value={query} onChange={setQuery} fullWidth size="md" aria-label={t("addStep.search")} />
      </div>
      {groups.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <NoResults variant="panel" scene="no-results-s" title={t("addStep.noMatchTitle")} hint={t("addStep.noMatchHint")} />
        </div>
      ) : (
        <div className="flex flex-col gap-0.5 px-3 py-2">
          {groups.map((group, index) => (
            <div key={group.key} className="flex flex-col gap-0.5">
              <p className={cn("px-2 pb-1 text-hint font-medium text-tertiary", index === 0 ? "pt-2" : "pt-4")}>
                {tShared(`stepGroup.${group.key}`)}
              </p>
              {group.types.map((type) => (
                <button
                  key={type}
                  type="button"
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.setData(STEP_DRAG_TYPE, type);
                    event.dataTransfer.effectAllowed = "copy";
                    onDragChange(true);
                  }}
                  onDragEnd={() => onDragChange(false)}
                  onClick={() => onAdd(type)}
                  className="flex h-11 w-full cursor-grab items-center gap-3 rounded-control px-2 text-left text-body text-primary outline-none transition-colors duration-(--duration-hover) hover:bg-accent-subtle focus-visible:bg-accent-subtle active:cursor-grabbing"
                >
                  <Icon icon={STEP_TYPE_ICONS[type]} className="text-secondary" />
                  {nameOf(type)}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/** E6: the hint, pinned to the bottom of the window under a hairline. */
export const AddStepHint: React.FC = () => {
  const t = useTranslations("automationsEditor");
  return <p className="shrink-0 border-t border-divider px-5 py-4 text-hint text-tertiary">{t("addStep.hint")}</p>;
};
