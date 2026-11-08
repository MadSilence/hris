"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { useTranslations } from "next-intl";

import { Button } from "@/components/desact/button";
import { Icon } from "@/components/desact/icon";
import { Tabs, TabsList, TabsTrigger } from "@/components/desact/tabs";
import { useCanAccess } from "@/components/auth/useAccess";
import { ActivityTab, isActivityChip } from "@/components/modules/automations/activity";
import { AutomationsListContainer } from "./AutomationsListContainer";
import { NewAutomationDialog } from "./NewAutomationDialog";

type Tab = "automations" | "activity";

/**
 * Sidebar → Automations (`automations-list`, `automations-activity`): the header, the tabs Automations | Activity, and
 * the tab. The page title stays "Automations" on both tabs (NAMING § 3). The address carries the tab and Activity's
 * deep link — `?tab=activity&automation=<id>&run=<id>` (`&chip=FAILED&why=1` from a card's "See why").
 *
 * Gated by the page (`SETTINGS.AUTOMATIONS` VIEW); MANAGE decides the Add button, the menus and the card buttons.
 */
export const AutomationsPage: React.FC = () => {
  const t = useTranslations("automationsList");
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const canManage = useCanAccess("SETTINGS.AUTOMATIONS", "MANAGE");

  const tab: Tab = params.get("tab") === "activity" ? "activity" : "automations";
  const automationId = params.get("automation");
  const runId = params.get("run");
  const chip = params.get("chip");

  const [newOpen, setNewOpen] = React.useState(false);
  const [atTemplates, setAtTemplates] = React.useState(false);

  /** Rewrites the address in place: `null` removes a parameter. */
  const setParams = React.useCallback(
    (changes: Record<string, string | null>) => {
      const next = new URLSearchParams(params.toString());
      Object.entries(changes).forEach(([key, value]) => (value === null ? next.delete(key) : next.set(key, value)));
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  const openNew = (templates: boolean) => {
    setAtTemplates(templates);
    setNewOpen(true);
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-page-title text-primary">{t("page.title")}</h1>
          <p className="text-body text-secondary">{t("page.description")}</p>
          {!canManage ? <p className="mt-2 text-body text-tertiary">{t("page.viewOnly")}</p> : null}
        </div>
        {canManage && tab === "automations" ? (
          <Button type="button" onClick={() => openNew(false)}>
            <Icon icon={Add01Icon} size="sm" />
            {t("page.add")}
          </Button>
        ) : null}
      </header>

      <Tabs
        value={tab}
        onValueChange={(value) =>
          setParams(
            value === "activity"
              ? { tab: "activity" }
              : { tab: null, automation: null, run: null, chip: null, why: null },
          )
        }
      >
        <TabsList>
          <TabsTrigger value="automations">{t("page.tabs.automations")}</TabsTrigger>
          <TabsTrigger value="activity">{t("page.tabs.activity")}</TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "automations" ? (
        <AutomationsListContainer canManage={canManage} onOpenNew={openNew} />
      ) : (
        <ActivityTab
          // A new chip from the address (a card's "See why") starts the tab afresh. The automation pill does not: keyed
          // by it too, picking an automation threw away the search and the filters (walk of 2026-11-07).
          key={chip ?? ""}
          automationId={automationId}
          runId={runId}
          initialChip={isActivityChip(chip) ? chip : "ALL"}
          openLatest={params.get("why") === "1"}
          canManage={canManage}
          onAutomationChange={(id) => setParams({ automation: id, run: null, why: null, chip: null })}
          onRunChange={(id) => setParams({ run: id, why: null })}
          onGoToAutomations={() => setParams({ tab: null, automation: null, run: null, chip: null, why: null })}
        />
      )}

      {canManage ? <NewAutomationDialog open={newOpen} atTemplates={atTemplates} onOpenChange={setNewOpen} /> : null}
    </div>
  );
};
