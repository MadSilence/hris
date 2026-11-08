"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { ArrowRight01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Input } from "@/components/desact/input";
import { STEP_TYPE_ICONS } from "@/components/modules/automations/shared";
import type { AutomationStepType } from "@/models/automations";
import { COMMON_STEPS, filterGroups } from "./stepCatalogue";

/** The "+" on a connector (D4): Search, the common steps, and All steps (the Add a step window). */
export const QuickAdd: React.FC<{
  actions: AutomationStepType[];
  onPick: (type: AutomationStepType) => void;
  onAllSteps: () => void;
}> = ({ actions, onPick, onAllSteps }) => {
  const t = useTranslations("automationsEditor");
  const tShared = useTranslations("automations");
  const [query, setQuery] = React.useState("");
  const nameOf = (type: AutomationStepType) => tShared(`stepType.${type}`);
  const found = query.trim()
    ? filterGroups(actions, query, nameOf).flatMap((g) => g.types)
    : COMMON_STEPS.filter((type) => actions.includes(type));

  return (
    <div className="flex flex-col gap-1">
      <div className="relative mb-1">
        <Icon icon={Search01Icon} size="sm" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-tertiary" />
        <Input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          placeholder={t("addStep.search")}
          aria-label={t("addStep.search")}
          className="h-8 pl-9"
        />
      </div>
      {found.length === 0 && <p className="px-2.5 py-2 text-hint text-tertiary">{t("addStep.noMatchTitle")}</p>}
      {found.map((type) => (
        <button
          key={type}
          type="button"
          onClick={() => onPick(type)}
          className="flex items-center gap-2.5 rounded-control px-2.5 py-1.5 text-left text-body text-primary hover:bg-mist focus-visible:bg-mist outline-none"
        >
          <Icon icon={STEP_TYPE_ICONS[type]} size="sm" className="text-tertiary" />
          {nameOf(type)}
        </button>
      ))}
      <button
        type="button"
        onClick={onAllSteps}
        className="mt-1 flex items-center justify-between rounded-control border-t border-divider px-2.5 py-2 text-left text-body text-accent-text hover:bg-mist outline-none focus-visible:bg-mist"
      >
        {t("addStep.allSteps")}
        <Icon icon={ArrowRight01Icon} size="sm" />
      </button>
    </div>
  );
};
