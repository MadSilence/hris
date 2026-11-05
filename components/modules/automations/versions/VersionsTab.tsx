"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useDisplayLanguage } from "@/lib/date";
import { ArrowDown01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Skeleton } from "@/components/desact/skeleton";
import { Badge } from "@/components/desact/badge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { formatMoment } from "@/models/automations";
import { useAutomationVersions } from "@/components/modules/automations/hooks";
import { DefinitionView } from "@/components/modules/automations/shared/DefinitionView";

/**
 * Every published version, newest first, with who published it — a version is never edited, so an old
 * one is read here exactly as it ran. The run log names the version each run followed.
 */
export function VersionsTab({ ruleId, currentVersionNo }: { ruleId: string; currentVersionNo: number }) {
  const t = useTranslations("automations");
  const language = useDisplayLanguage();
  const versions = useAutomationVersions(ruleId);
  const [open, setOpen] = useState<number | null>(null);

  if (versions.error) return <ErrorState error={versions.error} compact onRetry={() => void versions.refetch()} />;
  if (versions.isLoading) {
    return <div className="space-y-2">{[0, 1].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>;
  }
  const list = versions.data ?? [];
  if (list.length === 0) {
    return <EmptyState scene="automations" title={t("versions.emptyTitle")} description={t("versions.emptyDescription")} />;
  }

  return (
    <ul className="m-0 list-none divide-y divide-divider rounded-popover border border-divider bg-card p-0">
      {list.map((v) => {
        const isOpen = open === v.versionNo;
        return (
          <li key={v.versionNo} className="px-4 py-3">
            <button
              type="button"
              className="flex w-full items-center gap-3 text-left"
              onClick={() => setOpen(isOpen ? null : v.versionNo)}
              aria-expanded={isOpen}
            >
              {isOpen ? <Icon icon={ArrowDown01Icon} size="sm" className="text-tertiary" /> : <Icon icon={ArrowRight01Icon} size="sm" className="text-tertiary" />}
              <span className="font-medium text-primary">{t("versions.version", { version: v.versionNo })}</span>
              {v.versionNo === currentVersionNo && <Badge variant="outline">{t("versions.current")}</Badge>}
              <span className="ml-auto text-body text-tertiary">
                {[v.createdBy?.name, formatMoment(v.createdAt, language)].filter(Boolean).join(" · ")}
              </span>
            </button>
            {isOpen && <div className="mt-3 pl-7"><DefinitionView definition={v.definition} /></div>}
          </li>
        );
      })}
    </ul>
  );
}
