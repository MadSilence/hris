"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useDisplayLanguage } from "@/lib/date";
import { Clock04Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { Skeleton } from "@/components/desact/skeleton";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { cn } from "@/lib/cn";
import { skipReasonText } from "@/components/audience/assignment/assignmentSkips";
import type { AccessTranslator } from "@/components/audience/accessTranslator";
import { useAssignmentHistory } from "@/components/modules/automations/hooks";
import { formatMoment, type AssignableType, type AssignmentHistoryItem } from "@/models/automations";

/** "by rule Berlin office", "by hand · Anna Schmidt". */
export const historySource = (item: AssignmentHistoryItem, t: AccessTranslator): React.ReactNode => {
  if (item.origin === "RULE") {
    const rule = item.rule;
    return rule
      ? t.rich("audience.history.byRule", {
          rule: rule.name ?? "",
          link: (chunks) => (
            <Link href={`/settings/automation/automations/${rule.id}`} className="text-primary no-underline hover:underline">
              {chunks}
            </Link>
          ),
        })
      : t("audience.history.byARule");
  }
  return item.by?.name ? t("audience.history.byHandName", { name: item.by.name }) : t("audience.history.byHand");
};

/**
 * The quiet switch between who has a target now and who had it when — the same place, a second view.
 * Ghost and small: the roster is what the panel is for; the history is there when somebody asks.
 */
export const HistoryToggle: React.FC<{ showing: boolean; onChange: (showing: boolean) => void; className?: string }> = ({
  showing,
  onChange,
  className,
}) => {
  const t = useTranslations("access");
  return (
  <Button
    type="button"
    variant="ghost"
    size="sm"
    aria-pressed={showing}
    onClick={() => onChange(!showing)}
    className={cn("flex-none gap-1.5 text-tertiary", showing && "bg-subtle text-primary", className)}
  >
    <Icon icon={Clock04Icon} size="sm" />
    {t("audience.history.toggle")}
  </Button>
  );
};

/**
 * Who was assigned to one target, by which rule or by hand, and when — removals included (design
 * § 7: "assigned by rule *Berlin office* on 1 June, removed by hand on 3 July"). Newest first.
 */
export const AssignmentHistoryList: React.FC<{ assignableType: AssignableType; assignableId: string; className?: string }> = ({
  assignableType,
  assignableId,
  className,
}) => {
  const t = useTranslations("access");
  const language = useDisplayLanguage();
  const history = useAssignmentHistory(assignableType, assignableId);
  const items = history.data?.content ?? [];

  if (history.error) {
    return <ErrorState error={history.error} compact onRetry={() => void history.refetch()} />;
  }

  if (history.isLoading) {
    return (
      <div className={cn("space-y-1", className)}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 px-1 py-2">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3.5 w-48" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        className={className}
        scene="notes"
        title={t("audience.history.emptyTitle")}
        description={t("audience.history.emptyDescription")}
      />
    );
  }

  return (
    <ul className={cn("m-0 list-none divide-y divide-divider p-0", className)} aria-label={t("audience.history.listLabel")}>
      {items.map((item) => (
        <li key={item.recordId} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 px-1 py-2 text-body">
          <span className="min-w-0">
            <span className="text-primary">{item.person?.name}</span>
            <span className="text-tertiary">
              {" · "}
              {t(`audience.history.verbs.${item.status}`)} {historySource(item, t)}
              {item.status === "SKIPPED" && item.skipReason ? ` — ${skipReasonText(item.skipReason, t)}` : ""}
            </span>
          </span>
          <span className="text-hint tabular-nums text-tertiary">{formatMoment(item.at, language)}</span>
        </li>
      ))}
    </ul>
  );
};
