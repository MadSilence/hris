"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/desact/table";
import { ListToolbar } from "@/components/ui/ListToolbar";
import { ListEmptyState } from "@/components/feedback/ListEmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useDateFormatter } from "@/lib/date";
import { useLifecycleProcesses } from "@/components/modules/lifecycle/hooks";
import { ProcessStatusBadge } from "./ProcessStatusBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";

/**
 * Running processes. An overdue process stays here, open and visible — a date passing completes
 * nothing, and this page is where that is noticed (design § 3.1).
 */
export function ProcessesListContainer() {
  const formatDisplayDate = useDateFormatter();
  const t = useTranslations("lifecycle");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const active = useLifecycleProcesses(false);
  const archived = useLifecycleProcesses(true);
  const source = showArchived ? archived : active;

  const rows = useMemo(() => (source.data ?? []).filter((p) => {
    const q = query.trim().toLowerCase();
    return !q || (p.target.name ?? "").toLowerCase().includes(q) || p.templateName.toLowerCase().includes(q);
  }), [source.data, query]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <ListToolbar
        search={{ value: query, onChange: setQuery }}
        archived={(archived.data?.length ?? 0) > 0
          ? { count: archived.data?.length ?? 0, showing: showArchived, onChange: setShowArchived }
          : undefined}
      />

      {/* The table scrolls; the empty state fills what is left instead of sitting under the toolbar. */}
      <div className="min-h-0 flex-1 overflow-y-auto">
      {source.error ? (
        <ErrorState error={source.error} />
      ) : source.isLoading ? (
        <div className="space-y-2">{[0, 1, 2].map((i) => <div key={i} className="h-10 shimmer rounded-control bg-mist" />)}</div>
      ) : rows.length === 0 ? (
        <ListEmptyState
          fill
          query={query}
          onClearSearch={() => setQuery("")}
          archivedView={showArchived}
          scene="automations"
          title={t("processes.emptyTitle")}
          description={t("processes.emptyDescription")}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("processes.columnPerson")}</TableHead>
              <TableHead>{t("processes.columnProcess")}</TableHead>
              <TableHead>{t("processes.columnStarts")}</TableHead>
              <TableHead>{t("processes.columnManager")}</TableHead>
              <TableHead>{t("processes.columnTasks")}</TableHead>
              <TableHead>{tCommon("fields.status")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((p) => (
              <TableRow key={p.id} className="cursor-pointer" onClick={() => router.push(`/processes/${p.id}`)}>
                <TableCell className="font-medium">{p.target.name}</TableCell>
                <TableCell>
                  <div>{t(`processType.${p.type}`)}</div>
                  <div className="text-hint text-tertiary">{p.templateName}</div>
                </TableCell>
                <TableCell>{formatDisplayDate(p.anchorDate)}</TableCell>
                <TableCell>{p.manager?.name}</TableCell>
                <TableCell>
                  <span>{p.taskCount - p.openTaskCount} / {p.taskCount}</span>
                  {p.overdueTaskCount > 0 && (
                    <StatusBadge status="pending" label={t("processes.dueCount", { count: p.overdueTaskCount })} size="sm" className="ml-2" />
                  )}
                </TableCell>
                <TableCell><ProcessStatusBadge status={p.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      </div>
    </div>
  );
}
