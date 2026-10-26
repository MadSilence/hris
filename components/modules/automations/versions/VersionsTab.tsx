"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, GitCommitVertical } from "lucide-react";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
import { Badge } from "@/public/desact/src/components/ui/badge";
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
  const versions = useAutomationVersions(ruleId);
  const [open, setOpen] = useState<number | null>(null);

  if (versions.error) return <ErrorState error={versions.error} compact onRetry={() => void versions.refetch()} />;
  if (versions.isLoading) {
    return <div className="space-y-2">{[0, 1].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>;
  }
  const list = versions.data ?? [];
  if (list.length === 0) {
    return <EmptyState icon={<GitCommitVertical className="h-6 w-6" />} title="No versions yet" description="Each publish adds a version here." />;
  }

  return (
    <ul className="m-0 list-none divide-y divide-brown-100 rounded-xl border border-brown-100 bg-white p-0">
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
              {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              <span className="font-medium text-foreground">Version {v.versionNo}</span>
              {v.versionNo === currentVersionNo && <Badge variant="outline">Current</Badge>}
              <span className="ml-auto text-sm text-muted-foreground">
                {[v.createdBy?.name, formatMoment(v.createdAt)].filter(Boolean).join(" · ")}
              </span>
            </button>
            {isOpen && <div className="mt-3 pl-7"><DefinitionView definition={v.definition} /></div>}
          </li>
        );
      })}
    </ul>
  );
}
