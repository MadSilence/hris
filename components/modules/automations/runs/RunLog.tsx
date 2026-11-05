"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { ArrowDown01Icon, ArrowRight01Icon, ArrowTurnBackwardIcon, CancelCircleIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { Skeleton } from "@/components/desact/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/desact/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/desact/table";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { showError, showSuccess } from "@/lib/errors/errorToast";
import { useDateFormatter, useDisplayLanguage } from "@/lib/date";
import { formatMoment, type AutomationRun, type AutomationRunStatus } from "@/models/automations";
import { reasonText, type AutomationsT } from "@/components/modules/automations/shared/vocabulary";
import { cancelAutomationRunAction, retryAutomationRunAction } from "@/components/modules/automations/actions/automationActions";
import { unwrapAction, useAutomationRuns, useInvalidateAutomations } from "@/components/modules/automations/hooks";
import { RunStatusBadge, StepStatusBadge } from "@/components/modules/automations/shared/AutomationStatusBadge";

const ALL = "ALL";
const STATUSES: AutomationRunStatus[] = ["SCHEDULED", "IN_PROGRESS", "DONE", "SKIPPED", "FAILED", "CANCELLED"];
const PAGE_SIZE = 50;

/** Why a run is where it is, in one line: its reason, and that it ran late or by backfill. */
export const runReason = (t: AutomationsT, run: AutomationRun, language?: string): string => {
  const parts = [reasonText(t, run.reason, language)];
  if (run.ranLate && !(run.reason ?? "").startsWith("LATE_DATA")) parts.push(t("runs.ranLate"));
  if (run.backfill) parts.push(t("runs.backfill"));
  return parts.filter(Boolean).join(" · ");
};

/** Retry where it failed, Cancel where it has not run yet — the two the engine allows (AU00013). */
function RunActions({ run, onDone }: { run: AutomationRun; onDone: () => void }) {
  const t = useTranslations("automations");
  const [busy, setBusy] = useState(false);
  const act = async (kind: "retry" | "cancel") => {
    setBusy(true);
    try {
      unwrapAction(await (kind === "retry" ? retryAutomationRunAction(run.id) : cancelAutomationRunAction(run.id)));
      showSuccess(kind === "retry" ? t("runs.retried") : t("runs.cancelled"));
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
        <Button type="button" variant="ghost" size="sm" className="gap-1.5" disabled={busy} onClick={(e) => { e.stopPropagation(); void act("retry"); }}>
          <Icon icon={ArrowTurnBackwardIcon} size="sm" />
          {t("runs.retry")}
        </Button>
      ) : (
        <Button type="button" variant="ghost" size="sm" className="gap-1.5" disabled={busy} onClick={(e) => { e.stopPropagation(); void act("cancel"); }}>
          <Icon icon={CancelCircleIcon} size="sm" />
          {t("runs.cancelRun")}
        </Button>
      )}
    </PermissionGate>
  );
}

/** Each step of a run: what it did, when it was planned and when it ran, and why it ended where it did. */
export function RunSteps({ run }: { run: AutomationRun }) {
  const formatDisplayDate = useDateFormatter();
  const language = useDisplayLanguage();
  const t = useTranslations("automations");
  return (
    <ol className="m-0 list-none space-y-2 p-0" aria-label={t("runs.steps")}>
      {run.steps.map((s) => (
        <li key={s.id} className="grid grid-cols-[6rem_1fr_auto] items-start gap-3 text-body">
          <span className="tabular-nums text-tertiary">{formatDisplayDate(s.effectiveDate ?? s.plannedDate, { style: "medium" })}</span>
          <span className="min-w-0">
            <span className="block text-primary">{s.summary}</span>
            {(s.reason || s.ranLate) && (
              <span className={`block text-hint ${s.status === "FAILED" ? "text-status-declined-text" : "text-tertiary"}`}>
                {reasonText(t, s.reason, language) || t("runs.ranLate")}
              </span>
            )}
            {s.plannedDate && s.effectiveDate && s.plannedDate !== s.effectiveDate && (
              <span className="block text-hint text-tertiary">
                {t("runs.plannedFor", { date: formatDisplayDate(s.plannedDate, { style: "medium" }) })}
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
  const t = useTranslations("automations");
  const language = useDisplayLanguage();
  const tCommon = useTranslations("common");
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
          <SelectTrigger className="h-9 w-48" aria-label={tCommon("fields.status")}><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("runs.allStatuses")}</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{t(`runStatus.${s}`)}</SelectItem>)}
          </SelectContent>
        </Select>
        {runs.data && (
          <span className="text-body text-tertiary">
            {t("runs.total", { count: runs.data.totalElements })}
            {(runs.data.outsideScope ?? 0) > 0 && (
              <span data-test="outside-scope">{t("runs.outsideScope", { count: runs.data.outsideScope ?? 0 })}</span>
            )}
          </span>
        )}
      </div>

      {runs.error ? (
        <ErrorState error={runs.error} compact onRetry={() => void runs.refetch()} />
      ) : !runs.isLoading && rows.length === 0 ? (
        <EmptyState
          scene="automations"
          title={status ? t(`runs.emptyFor.${status}`) : t("runs.emptyTitle")}
          description={status ? t("runs.tryAnotherStatus") : t("runs.emptyDescription")}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>{t("runs.columns.person")}</TableHead>
              <TableHead>{t("runs.columns.version")}</TableHead>
              <TableHead>{tCommon("fields.status")}</TableHead>
              <TableHead>{t("runs.columns.reason")}</TableHead>
              <TableHead>{t("runs.columns.started")}</TableHead>
              <TableHead>{t("runs.columns.finished")}</TableHead>
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
                  <TableCell><Skeleton className="h-5 w-16 rounded-pill" /></TableCell>
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
                      <TableCell className="text-tertiary">
                        {isOpen ? <Icon icon={ArrowDown01Icon} size="sm" /> : <Icon icon={ArrowRight01Icon} size="sm" />}
                      </TableCell>
                      <TableCell className="font-medium">
                        {run.person ? (
                          <Link href={`/organization/people/${run.person.id}`} onClick={(e) => e.stopPropagation()} className="text-primary no-underline hover:underline">
                            {run.person.name}
                          </Link>
                        ) : null}
                      </TableCell>
                      <TableCell className="tabular-nums text-tertiary">v{run.versionNo}</TableCell>
                      <TableCell><RunStatusBadge status={run.status} /></TableCell>
                      <TableCell className="max-w-72 text-body text-tertiary">
                        <span className={run.status === "FAILED" ? "text-status-declined-text" : undefined}>{runReason(t, run, language)}</span>
                      </TableCell>
                      <TableCell className="text-body text-tertiary">{formatMoment(run.createdAt, language)}</TableCell>
                      <TableCell className="text-body text-tertiary">{formatMoment(run.finishedAt, language)}</TableCell>
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
          <Button type="button" variant="secondary" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>{t("runs.previous")}</Button>
          <span className="text-body text-tertiary">{page + 1} / {totalPages}</span>
          <Button type="button" variant="secondary" size="sm" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>{tCommon("actions.next")}</Button>
        </div>
      )}
    </div>
  );
}
