"use client";

import React from "react";
import Link from "next/link";
import { ErrorState } from "@/components/feedback/ErrorState";
import type { AutomationRuleSummary } from "@/models/automations";
import { useAutomations } from "@/components/modules/automations/hooks";
import { HomeCard, HomeCardLink, HomeEmpty, HomeRowsSkeleton } from "@/components/modules/home/components/HomeCard";

export const AUTOMATIONS_LIMIT = 5;
const RULES_HREF = "/settings/automation/automations";

/** A rule somebody should look at: paused by the engine, or with runs that failed. */
const needsAttention = (rule: AutomationRuleSummary) => rule.status === "PAUSED" || rule.runs.failed > 0;

/**
 * The company's automations at a glance: how many run, how many runs failed, and the rules that need a look
 * — paused, or failing — most failures first. Each opens the rule, where its run log is.
 */
export const AutomationsWidget: React.FC = () => {
  const query = useAutomations(false);
  const rules = query.data ?? [];
  const enabled = rules.filter((rule) => rule.status === "ENABLED").length;
  const failed = rules.reduce((sum, rule) => sum + rule.runs.failed, 0);
  const scheduled = rules.reduce((sum, rule) => sum + rule.runs.scheduled, 0);
  const attention = rules.filter(needsAttention).sort((a, b) => b.runs.failed - a.runs.failed);

  return (
    <HomeCard title="Automations" action={<HomeCardLink href={RULES_HREF}>See all</HomeCardLink>}>
      {query.isLoading ? (
        <HomeRowsSkeleton rows={2} avatar={false} />
      ) : query.error ? (
        <ErrorState error={query.error} compact onRetry={() => void query.refetch()} />
      ) : rules.length === 0 ? (
        <HomeEmpty>No automations yet.</HomeEmpty>
      ) : (
        <>
          <dl className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: "Enabled", value: enabled },
              { label: "Scheduled runs", value: scheduled },
              { label: "Failed runs", value: failed },
            ].map((stat) => (
              <div key={stat.label} className="rounded-control bg-subtle px-2 py-2">
                <dd className="text-section-title text-primary">{stat.value}</dd>
                <dt className="text-hint text-tertiary">{stat.label}</dt>
              </div>
            ))}
          </dl>
          {attention.length === 0 ? (
            <HomeEmpty>Nothing needs a look.</HomeEmpty>
          ) : (
            <ul className="flex flex-col gap-1">
              {attention.slice(0, AUTOMATIONS_LIMIT).map((rule) => (
                <li key={rule.id}>
                  <Link href={`${RULES_HREF}/${rule.id}`} className="-mx-2 flex items-center justify-between gap-3 rounded-control px-2 py-1.5 hover:bg-subtle">
                    <span className="truncate text-body font-medium text-primary">{rule.name}</span>
                    <span className="shrink-0 text-hint font-medium text-danger-text">
                      {rule.status === "PAUSED" ? "Paused" : `${rule.runs.failed} failed`}
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
