"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/desact/button";
import { Skeleton } from "@/components/desact/skeleton";
import { EmptyState } from "@/components/feedback/EmptyState";
import { cn } from "@/lib/cn";
import { useAutomationVersions } from "@/components/modules/automations/hooks";
import type { VersionsWindowProps } from "@/components/modules/automations/contracts";
import type { AutomationVersion } from "@/models/automations";
import { useRunWords } from "./runWords";
import { ToolWindow } from "./ToolWindow";
import { versionChanges, type VersionChange } from "./versionSummary";

/** The words of one version's changes, each its own phrase: "Changed what starts it", "Added 1 step". */
export const useVersionWords = () => {
  const t = useTranslations("automationsRuns");
  return (change: VersionChange): string => {
    switch (change.kind) {
      case "turnedOn":
        return t("versions.turnedOn");
      case "trigger":
        return t("versions.trigger");
      case "whoItRunsFor":
        return t("versions.whoItRunsFor");
      case "noChanges":
        return t("versions.noChanges");
      default:
        return t(`versions.${change.kind}`, { count: change.count });
    }
  };
};

/** Versions (V5): newest first, what changed, who and when, the runs still on each. */
export const VersionsWindow: React.FC<VersionsWindowProps> = ({ automationId, onView, onClose }) => {
  const t = useTranslations("automationsRuns");
  const tCommon = useTranslations("common");
  const versions = useAutomationVersions(automationId);
  const list = [...(versions.data ?? [])].sort((a, b) => b.versionNo - a.versionNo);

  let body: React.ReactNode;
  if (automationId && versions.isLoading) {
    body = (
      <div className="flex flex-col gap-3 px-4 pb-4" aria-hidden>
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <Skeleton className="size-6 rounded-tag" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  } else if (versions.error) {
    body = (
      <EmptyState
        compact
        scene="something-broke"
        title={t("versions.errorTitle")}
        description={t("history.errorDescription")}
        action={
          <Button type="button" variant="secondary" size="sm" onClick={() => void versions.refetch()}>
            {tCommon("actions.retry")}
          </Button>
        }
      />
    );
  } else if (list.length === 0) {
    body = (
      <EmptyState compact scene="history-s" title={t("versions.emptyTitle")} description={t("versions.emptyDescription")} />
    );
  } else {
    body = (
      <ul className="m-0 flex list-none flex-col gap-1 p-0">
        {list.map((version) => (
          <VersionRow key={version.versionNo} version={version} onView={() => onView(version)} />
        ))}
      </ul>
    );
  }

  return (
    <ToolWindow title={t("versions.title")} width={320} onClose={onClose}>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">{body}</div>
    </ToolWindow>
  );
};

const VersionRow: React.FC<{ version: AutomationVersion; onView: () => void }> = ({ version, onView }) => {
  const t = useTranslations("automationsRuns");
  const words = useRunWords();
  const changeWords = useVersionWords();
  const changes = versionChanges(version.summary).map(changeWords);
  return (
    <li className="flex items-start gap-2.5 rounded-control px-2 py-2">
      <span
        className={cn(
          "inline-flex size-6 shrink-0 items-center justify-center rounded-tag text-hint font-semibold",
          version.current ? "bg-status-approved-bg text-status-approved-text" : "bg-subtle text-secondary",
        )}
        title={version.current ? t("versions.current") : undefined}
      >
        {t("versions.badge", { version: version.versionNo })}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        {changes.map((change) => (
          <p key={change} className="text-body font-medium text-primary">
            {change}
          </p>
        ))}
        <p className="text-hint text-tertiary">
          {t("versions.byWhen", {
            who: version.createdBy?.name ?? t("versions.someone"),
            when: words.recent(version.createdAt),
          })}
        </p>
        {version.runsOnIt > 0 && (
          <p className="text-hint text-status-pending-text">{t("versions.runsOnIt", { count: version.runsOnIt })}</p>
        )}
      </div>
      <Button type="button" variant="link" size="sm" onClick={onView}>
        {t("versions.view")}
      </Button>
    </li>
  );
};
