"use client";

import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ErrorState } from "@/components/feedback/ErrorState";
import type { AutomationSummary } from "@/models/automations";
import { useAutomations } from "@/components/modules/automations/hooks";
import { automationsHref } from "@/components/modules/automations/list";
import { HomeCard, HomeCardLink, HomeEmpty, HomeRowsSkeleton } from "@/components/modules/home/components/HomeCard";

export const AUTOMATIONS_LIMIT = 5;

/** An automation somebody should look at: paused, or its last run failed. */
const needsAttention = (automation: AutomationSummary) =>
  automation.status === "PAUSED" || Boolean(automation.lastRun?.failed);

/** A failed last run first, then a pause the system made, then a pause by hand. */
const urgency = (automation: AutomationSummary) =>
  automation.lastRun?.failed ? 0 : automation.pause && automation.pause.reason !== "MANUAL" ? 1 : 2;

/**
 * The company's automations at a glance: how many are on, how many runs wait on somebody, how many last runs failed —
 * and the automations that need a look. Each opens the automation; a failed one opens Activity with its failures.
 */
export const AutomationsWidget: React.FC = () => {
  const t = useTranslations("home");
  const query = useAutomations(false);
  const automations = query.data ?? [];
  const active = automations.filter((automation) => automation.status === "ACTIVE").length;
  const waiting = automations.reduce((sum, automation) => sum + automation.waiting, 0);
  const failed = automations.filter((automation) => automation.lastRun?.failed).length;
  const attention = automations.filter(needsAttention).sort((a, b) => urgency(a) - urgency(b));

  return (
    <HomeCard title={t("widgets.automations.title")} action={<HomeCardLink href={automationsHref.list}>{t("card.seeAll")}</HomeCardLink>}>
      {query.isLoading ? (
        <HomeRowsSkeleton rows={2} avatar={false} />
      ) : query.error ? (
        <ErrorState error={query.error} compact onRetry={() => void query.refetch()} />
      ) : automations.length === 0 ? (
        <HomeEmpty>{t("automations.empty")}</HomeEmpty>
      ) : (
        <>
          <dl className="grid grid-cols-3 gap-2 text-center">
            {[
              { key: "active", label: t("automations.active"), value: active },
              { key: "waiting", label: t("automations.waitingRuns"), value: waiting },
              { key: "failed", label: t("automations.failedLastRuns"), value: failed },
            ].map((stat) => (
              <div key={stat.key} className="rounded-control bg-subtle px-2 py-2">
                <dd className="text-section-title text-primary">{stat.value}</dd>
                <dt className="text-hint text-tertiary">{stat.label}</dt>
              </div>
            ))}
          </dl>
          {attention.length === 0 ? (
            <HomeEmpty>{t("automations.allGood")}</HomeEmpty>
          ) : (
            <ul className="flex flex-col gap-1">
              {attention.slice(0, AUTOMATIONS_LIMIT).map((automation) => (
                <li key={automation.id}>
                  <Link
                    href={automation.lastRun?.failed ? automationsHref.seeWhy(automation.id) : automationsHref.open(automation.id)}
                    className="-mx-2 flex items-center justify-between gap-3 rounded-control px-2 py-1.5 hover:bg-subtle"
                  >
                    <span className="truncate text-body font-medium text-primary">{automation.name}</span>
                    <span className="shrink-0 text-hint font-medium text-danger-text">
                      {automation.lastRun?.failed ? t("automations.lastRunFailed") : t("automations.paused")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </HomeCard>
  );
};
