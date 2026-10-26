"use client";

import * as React from "react";
import Link from "next/link";
import { History } from "lucide-react";
import { Button } from "@/public/desact/src/components/ui/button";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { cn } from "@/public/desact/src/components/ui/utils";
import { skipReasonText } from "@/components/audience/assignment/assignmentSkips";
import { useAssignmentHistory } from "@/components/modules/automations/hooks";
import { formatMoment, type AssignableType, type AssignmentHistoryItem } from "@/models/automations";

const VERB: Record<AssignmentHistoryItem["status"], string> = {
  CREATED: "Assigned",
  SCHEDULED: "Scheduled",
  SKIPPED: "Skipped",
  FAILED: "Failed",
  REMOVED: "Removed",
};

/** "by rule Berlin office", "by hand · Anna Schmidt". */
export const historySource = (item: AssignmentHistoryItem): React.ReactNode => {
  if (item.origin === "RULE") {
    return item.rule ? (
      <>
        by rule{" "}
        <Link href={`/settings/automation/automations/${item.rule.id}`} className="text-foreground no-underline hover:underline">
          {item.rule.name}
        </Link>
      </>
    ) : "by a rule";
  }
  return item.by?.name ? `by hand · ${item.by.name}` : "by hand";
};

/**
 * The quiet switch between who has a target now and who had it when — the same place, a second view.
 * Ghost and small: the roster is what the panel is for; the history is there when somebody asks.
 */
export const HistoryToggle: React.FC<{ showing: boolean; onChange: (showing: boolean) => void; className?: string }> = ({
  showing,
  onChange,
  className,
}) => (
  <Button
    type="button"
    variant="ghost"
    size="sm"
    aria-pressed={showing}
    onClick={() => onChange(!showing)}
    className={cn("flex-none gap-1.5 text-muted-foreground", showing && "bg-brown-50 text-foreground", className)}
  >
    <History className="h-4 w-4" />
    History
  </Button>
);

/**
 * Who was assigned to one target, by which rule or by hand, and when — removals included (design
 * § 7: "assigned by rule *Berlin office* on 1 June, removed by hand on 3 July"). Newest first.
 */
export const AssignmentHistoryList: React.FC<{ assignableType: AssignableType; assignableId: string; className?: string }> = ({
  assignableType,
  assignableId,
  className,
}) => {
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
        icon={<History className="h-6 w-6" />}
        title="No history yet"
        description="Every assignment and removal here is listed, with the rule or the person who made it."
      />
    );
  }

  return (
    <ul className={cn("m-0 list-none divide-y divide-brown-100 p-0", className)} aria-label="Assignment history">
      {items.map((item) => (
        <li key={item.recordId} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 px-1 py-2 text-sm">
          <span className="min-w-0">
            <span className="text-foreground">{item.person?.name}</span>
            <span className="text-muted-foreground">
              {" · "}
              {VERB[item.status]} {historySource(item)}
              {item.status === "SKIPPED" && item.skipReason ? ` — ${skipReasonText(item.skipReason)}` : ""}
            </span>
          </span>
          <span className="text-xs tabular-nums text-muted-foreground">{formatMoment(item.at)}</span>
        </li>
      ))}
    </ul>
  );
};
