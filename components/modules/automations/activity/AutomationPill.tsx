"use client";

import * as React from "react";
import { ArrowDown01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { useTranslations } from "next-intl";

import { Icon } from "@/components/desact/icon";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/desact/popover";
import { SearchBox } from "@/components/ui/SearchBox";
import { FilterChip } from "@/components/ui/FilterChip";
import { AutomationIcon } from "@/components/modules/automations/shared";
import type { AutomationSummary } from "@/models/automations";

/**
 * The Automation filter pill (V8 → V8b, PRODUCT-RULES § Controls): empty it reads "All automations ▾"; picked it
 * turns accent-subtle and reads "Automation: <name> ▾ | ×". The list it opens is searchable.
 */
export const AutomationPill: React.FC<{
  automations: AutomationSummary[];
  value: string | null;
  /** The picked automation's name, when it is not on the list (an archived one). */
  pickedName: string | null;
  onChange: (automationId: string | null) => void;
}> = ({ automations, value, pickedName, onChange }) => {
  const t = useTranslations("automationsList");
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const name = automations.find((automation) => automation.id === value)?.name ?? pickedName ?? "";
  const shown = automations.filter((automation) => automation.name.toLowerCase().includes(q.trim().toLowerCase()));

  const list = (
    <PopoverContent align="start" className="w-80 p-2">
      <SearchBox value={q} onChange={setQ} fullWidth aria-label={t("activity.searchAutomations")} />
      <ul className="mt-2 max-h-72 overflow-y-auto" role="listbox">
        {shown.length === 0 ? (
          <li className="px-2.5 py-3 text-body text-tertiary">{t("activity.noAutomationMatches")}</li>
        ) : (
          shown.map((automation) => (
            <li key={automation.id} role="option" aria-selected={automation.id === value}>
              <button
                type="button"
                className="flex w-full items-center gap-2.5 rounded-control px-2.5 py-1.5 text-left text-body text-primary hover:bg-subtle"
                onClick={() => {
                  onChange(automation.id);
                  setOpen(false);
                  setQ("");
                }}
              >
                <AutomationIcon icon={automation.icon} trigger={automation.trigger} size={16} className="text-tertiary" />
                <span className="truncate">{automation.name}</span>
              </button>
            </li>
          ))
        )}
      </ul>
    </PopoverContent>
  );

  if (!value) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <FilterChip withArrow>{t("activity.allAutomations")}</FilterChip>
        </PopoverTrigger>
        {list}
      </Popover>
    );
  }

  return (
    <span className="inline-flex h-8 max-w-[360px] shrink-0 items-center rounded-pill border border-accent-ring bg-accent-subtle text-body font-medium text-accent-text">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button type="button" className="flex min-w-0 items-center gap-1.5 pr-2 pl-3">
            <span className="shrink-0 font-normal text-secondary">{t("activity.automationLabel")}</span>
            <span className="truncate">{name}</span>
            <Icon icon={ArrowDown01Icon} size="sm" className="shrink-0" />
          </button>
        </PopoverTrigger>
        {list}
      </Popover>
      <span aria-hidden className="h-4 w-px bg-accent-ring" />
      <button
        type="button"
        aria-label={t("activity.clearAutomation")}
        className="inline-flex h-full items-center pr-3 pl-2"
        onClick={() => onChange(null)}
      >
        <Icon icon={Cancel01Icon} size="sm" />
      </button>
    </span>
  );
};
