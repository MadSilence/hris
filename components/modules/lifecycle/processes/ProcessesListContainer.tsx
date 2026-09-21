"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Workflow } from "lucide-react";
import { Badge } from "@/public/desact/src/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/public/desact/src/components/ui/table";
import { ListToolbar } from "@/components/ui/ListToolbar";
import { ListEmptyState } from "@/components/feedback/ListEmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { formatDisplayDate } from "@/lib/date";
import { useLifecycleProcesses } from "@/components/modules/lifecycle/hooks";
import { PROCESS_TYPE_LABELS } from "@/models/lifecycle";
import { ProcessStatusBadge } from "./ProcessStatusBadge";

/**
 * Running processes. An overdue process stays here, open and visible — a date passing completes
 * nothing, and this page is where that is noticed (design § 3.1).
 */
export function ProcessesListContainer() {
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
        <div className="space-y-2">{[0, 1, 2].map((i) => <div key={i} className="h-10 animate-pulse rounded-md bg-muted" />)}</div>
      ) : rows.length === 0 ? (
        <ListEmptyState
          fill
          query={query}
          archivedView={showArchived}
          icon={<Workflow className="h-6 w-6" />}
          title="No processes yet"
          description="Start a preboarding or an onboarding from a person's profile."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Person</TableHead>
              <TableHead>Process</TableHead>
              <TableHead>Starts</TableHead>
              <TableHead>Onboarding Manager</TableHead>
              <TableHead>Tasks</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((p) => (
              <TableRow key={p.id} className="cursor-pointer" onClick={() => router.push(`/processes/${p.id}`)}>
                <TableCell className="font-medium">{p.target.name}</TableCell>
                <TableCell>
                  <div>{PROCESS_TYPE_LABELS[p.type]}</div>
                  <div className="text-xs text-muted-foreground">{p.templateName}</div>
                </TableCell>
                <TableCell>{formatDisplayDate(p.anchorDate)}</TableCell>
                <TableCell>{p.manager?.name}</TableCell>
                <TableCell>
                  <span>{p.taskCount - p.openTaskCount} / {p.taskCount}</span>
                  {p.overdueTaskCount > 0 && (
                    <Badge variant="outline" className="ml-2 border-warning-200 bg-warning-50 text-warning-700">
                      {p.overdueTaskCount} Due
                    </Badge>
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
