"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { SearchBox } from "@/components/ui/SearchBox";
import { NoResults } from "@/components/feedback/EmptyState";
import { Icon } from "@/components/desact/icon";
import { STEP_TYPE_ICONS } from "@/components/modules/automations/shared";
import type { AutomationStepType } from "@/models/automations";
import { filterGroups, STEP_DRAG_TYPE } from "../canvas/stepCatalogue";

/**
 * Add a step (D2): Search, then the four groups from the catalogue's steps. Drag a step onto the canvas, or click it to
 * add after the selected step (or at the end of the trunk).
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
    <div className="flex flex-col gap-4">
      <SearchBox value={query} onChange={setQuery} fullWidth aria-label={t("addStep.search")} />
      {groups.length === 0 ? (
        <NoResults scene="no-results-s" title={t("addStep.noMatchTitle")} hint={t("addStep.noMatchHint")} />
      ) : (
        groups.map((group) => (
          <div key={group.key} className="flex flex-col gap-0.5">
            <p className="px-2 pb-1 text-hint text-tertiary">{tShared(`stepGroup.${group.key}`)}</p>
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
                className="flex h-10 cursor-grab items-center gap-3 rounded-control px-2 text-left text-body text-primary outline-none transition-colors duration-(--duration-hover) hover:bg-subtle focus-visible:bg-subtle active:cursor-grabbing"
              >
                <Icon icon={STEP_TYPE_ICONS[type]} className="text-secondary" />
                {nameOf(type)}
              </button>
            ))}
          </div>
        ))
      )}
      <p className="text-hint text-tertiary">{t("addStep.hint")}</p>
    </div>
  );
};
