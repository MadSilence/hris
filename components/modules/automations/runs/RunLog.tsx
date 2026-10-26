"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, History, RotateCcw, XCircle } from "lucide-react";
import { Button } from "@/public/desact/src/components/ui/button";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/public/desact/src/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/public/desact/src/components/ui/table";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { showError, showSuccess } from "@/lib/errors/errorToast";
import { formatDisplayDate } from "@/lib/date";
import {
  RUN_STATUS_LABELS,
  formatMoment,
  reasonText,
  type AutomationRun,
  type AutomationRunStatus,
} from "@/models/automations";
import { cancelAutomationRunAction, retryAutomationRunAction } from "@/components/modules/automations/actions/automationActions";
import { unwrapAction, useAutomationRuns, useInvalidateAutomations } from "@/components/modules/automations/hooks";
import { RunStatusBadge, StepStatusBadge } from "@/components/modules/automations/shared/AutomationStatusBadge";

const ALL = "ALL";
const STATUSES: AutomationRunStatus[] = ["SCHEDULED", "IN_PROGRESS", "DONE", "SKIPPED", "FAILED", "CANCELLED"];
const PAGE_SIZE = 50;

/** Why a run is where it is, in one line: its reason, and that it ran late or by backfill. */
export const runReason = (run: AutomationRun): string => {
  const parts = [reasonText(run.reason)];
  if (run.ranLate && !(run.reason ?? "").startsWith("LATE_DATA")) parts.push("Ran late");
  if (run.backfill) parts.push("Added when the rule was enabled");
  return parts.filter(Boolean).join(" · ");
};

/** Retry where it failed, Cancel where it has not run yet — the two the engine allows (AU00013). */
function RunActions({ run, onDone }: { run: AutomationRun; onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  const act = async (kind: "retry" | "cancel") => {
    setBusy(true);
    try {
      unwrapAction(await (kind === "retry" ? retryAutomationRunAction(run.id) : cancelAutomationRunAction(run.id)));
      showSuccess(kind === "retry" ? "The failed steps were planned again for today." : "The run was cancelled.");
      onDone();
    } catch (error) {
      showError(error);
    } finally {
      setBusy(false);
    }
  };
  if (run.status !== "FAILED" && run.status !== "SCHEDULED") return null;
  return (
    <PermissionGate resource="SETTINGS.AUTOMATIONS" action="MANAGE">
      {run.status === "FAILED" ? (
        <Button variant="ghost" size="sm" className="gap-1.5" disabled={busy} onClick={(e) => { e.stopPropagation(); void act("retry"); }}>
          <RotateCcw className="h-3.5 w-3.5" />
          Retry
        </Button>
      ) : (
        <Button variant="ghost" size="sm" className="gap-1.5" disabled={busy} onClick={(e) => { e.stopPropagation(); void act("cancel"); }}>
          <XCircle className="h-3.5 w-3.5" />
          Cancel
        </Button>
      )}
    </PermissionGate>
  );
}

/** Each step of a run: what it did, when it was planned and when it ran, and why it ended where it did. */
export function RunSteps({ run }: { run: AutomationRun }) {
  return (
    <ol className="m-0 list-none space-y-2 p-0" aria-label="Steps">
      {run.steps.map((s) => (
        <li key={s.id} className="grid grid-cols-[6rem_1fr_auto] items-start gap-3 text-sm">
          <span className="tabular-nums text-muted-foreground">{formatDisplayDate(s.effectiveDate ?? s.plannedDate, { style: "medium" })}</span>
          <span className="min-w-0">
            <span className="block text-foreground">{s.summary}</span>
            {(s.reason || s.ranLate) && (
              <span className={`block text-xs ${s.status === "FAILED" ? "text-danger-700" : "text-muted-foreground"}`}>
                {reasonText(s.reason) || "Ran late"}
              </span>
            )}
            {s.plannedDate && s.effectiveDate && s.plannedDate !== s.effectiveDate && (
              <span className="block text-xs text-muted-foreground">
                Planned for {formatDisplayDate(s.plannedDate, { style: "medium" })}
              </span>
            )}
          </span>
          <StepStatusBadge status={s.status} />
        </li>
      ))}
    </ol>
  );
}

/**
 * The run log of one rule (research § A.10, "Run log"): one row per firing for one person, with the
 * version that produced it and a reason for every skip; each row opens to its steps. Filtered by status.
 */
export function RunLog({ ruleId }: { ruleId: string }) {
  const [status, setStatus] = useState<AutomationRunStatus | null>(null);
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState<string | null>(null);
  const runs = useAutomationRuns(ruleId, status, page, PAGE_SIZE);
  const invalidate = useInvalidateAutomations();
  const rows = runs.data?.content ?? [];
  const totalPages = runs.data?.totalPages ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Select
          value={status ?? ALL}
          onValueChange={(v) => { setStatus(v === ALL ? null : (v as AutomationRunStatus)); setPage(0); }}
        >
          <SelectTrigger className="h-9 w-48" aria-label="Status"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All Statuses</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{RUN_STATUS_LABELS[s]}</SelectItem>)}
          </SelectContent>
        </Select>
        {runs.data && (
          <span className="text-sm text-muted-foreground">
            {runs.data.totalElements} {runs.data.totalElements === 1 ? "run" : "runs"}
          </span>
        )}
      </div>

      {runs.error ? (
        <ErrorState error={runs.error} compact onRetry={() => void runs.refetch()} />
      ) : !runs.isLoading && rows.length === 0 ? (
        <EmptyState
          icon={<History className="h-6 w-6" />}
          title={status ? `No ${RUN_STATUS_LABELS[status].toLowerCase()} runs` : "No runs yet"}
          description={status ? "Try another status." : "Every time the rule fires for somebody, the run is listed here with what each step did."}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>Person</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Started</TableHead>
              <TableHead>Finished</TableHead>
              <TableHead className="w-28" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {runs.isLoading
              ? [0, 1, 2].map((i) => (
                <TableRow key={`run-skeleton-${i}`}>
                  <TableCell />
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell />
                </TableRow>
              ))
              : rows.map((run) => {
                const isOpen = open === run.id;
                return (
                  <React.Fragment key={run.id}>
                    <TableRow className="cursor-pointer" onClick={() => setOpen(isOpen ? null : run.id)} aria-expanded={isOpen}>
                      <TableCell className="text-muted-foreground">
                        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </TableCell>
                      <TableCell className="font-medium">
                        {run.person ? (
                          <Link href={`/organization/people/${run.person.id}`} onClick={(e) => e.stopPropagation()} className="text-foreground no-underline hover:underline">
                            {run.person.name}
                          </Link>
                        ) : null}
                      </TableCell>
                      <TableCell className="tabular-nums text-muted-foreground">v{run.versionNo}</TableCell>
                      <TableCell><RunStatusBadge status={run.status} /></TableCell>
                      <TableCell className="max-w-72 text-sm text-muted-foreground">
                        <span className={run.status === "FAILED" ? "text-danger-700" : undefined}>{runReason(run)}</span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatMoment(run.createdAt)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatMoment(run.finishedAt)}</TableCell>
                      <TableCell className="text-right"><RunActions run={run} onDone={() => void invalidate()} /></TableCell>
                    </TableRow>
                    {isOpen && (
                      <TableRow className="hover:bg-transparent">
                        <TableCell />
                        <TableCell colSpan={7} className="pb-4">
                          <RunSteps run={run} />
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
          </TableBody>
        </Table>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground">{page + 1} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
