"use client";

import * as React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import type { QueryKey } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/public/desact/src/components/ui/dialog";
import { Button } from "@/public/desact/src/components/ui/button";
import {
  PeoplePicker,
  officeColumn,
  legalEntityColumn,
  departmentColumn,
  teamColumn,
  rolesColumn,
  calendarColumn,
  type PeopleColumn,
} from "@/components/audience/PeoplePicker";
import { useUserFields } from "@/components/modules/organization/hooks/useUserFields/useUserFields";
import {
  useApplyAssignment,
  useApplySegment,
  useAssignmentJob,
} from "@/components/audience/assignment/hooks/useAssignment";
import { PEOPLE_SEARCH_QK } from "@/components/modules/organization/hooks/usePeopleSearch/usePeopleSearch";
import { isTerminalJobStatus } from "@/api/modules/assignments/dto/SegmentAssignmentDTO";
import type { FilterDTO } from "@/models/user/fields";
import type { Segment, UserRefDTO } from "@/models/segment/Segment";

const MANUAL_CAP = 300;

type ResultSummary = { total: number; created: number; skipped: number; failed: number };
type ResultLike = {
  summary: ResultSummary;
  failed?: { userId: string; email: string; errorDetail?: string | null }[];
};

export type AssignPeopleModalProps = {
  isOpen: boolean;
  onCloseAction: () => void;
  basePath: string;
  assignableId: string;
  assignableName?: string;
  noun: string;
  semantics: "add" | "replace";
  temporal?: boolean;
  invalidateKeys?: QueryKey[];
};

const DOMAIN_CONFIG: Record<string, { column: PeopleColumn; excludeField: string }> = {
  "/offices": { column: officeColumn, excludeField: "sys:office" },
  "/legal-entities": { column: legalEntityColumn, excludeField: "sys:legal_entity" },
  "/roles": { column: rolesColumn, excludeField: "sys:role" },
  "/teams": { column: teamColumn, excludeField: "sys:team" },
  "/departments": { column: departmentColumn, excludeField: "sys:department" },
  "/public-holiday-calendars": { column: calendarColumn, excludeField: "sys:calendar" },
};

export const AssignPeopleModal: React.FC<AssignPeopleModalProps> = ({
  isOpen,
  onCloseAction,
  basePath,
  assignableId,
  assignableName,
  noun,
  semantics,
  temporal = false,
  invalidateKeys = [],
}) => {
  const { data: fields } = useUserFields();
  const queryClient = useQueryClient();

  const [filters, setFilters] = React.useState<FilterDTO[]>([]);
  const [includeInactive, setIncludeInactive] = React.useState(false);
  const [mode, setMode] = React.useState<"manual" | "all">("manual");
  const [manual, setManual] = React.useState<Set<string>>(new Set());
  const [excluded, setExcluded] = React.useState<Set<string>>(new Set());
  const [total, setTotal] = React.useState(0);
  const [jobId, setJobId] = React.useState<string | null>(null);
  const [effectiveFrom, setEffectiveFrom] = React.useState("");
  const [effectiveTo, setEffectiveTo] = React.useState("");

  const domain = DOMAIN_CONFIG[basePath];
  const pickerColumns = domain ? [domain.column] : undefined;
  // "Not already assigned to this one" — which must keep people who are assigned to nothing at all,
  // hence includeEmpty. Without it the default negation semantics would hide exactly the people a
  // first assignment is usually aimed at.
  const exclusionFilters: FilterDTO[] = domain
    ? [{ field: domain.excludeField, op: "neq", value: assignableId, includeEmpty: true }]
    : [];

  const applyManual = useApplyAssignment(basePath, assignableId, invalidateKeys);
  const applySegment = useApplySegment(basePath, assignableId);
  const job = useAssignmentJob(basePath, assignableId, jobId);

  const reset = React.useCallback(() => {
    setFilters([]);
    setMode("manual");
    setManual(new Set());
    setExcluded(new Set());
    setTotal(0);
    setJobId(null);
    setEffectiveFrom("");
    setEffectiveTo("");
    applyManual.reset();
    applySegment.reset();
  }, [applyManual, applySegment]);

  React.useEffect(() => {
    if (isOpen) reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const isSelected = React.useCallback(
    (u: UserRefDTO) => (mode === "all" ? !excluded.has(u.id) : manual.has(u.id)),
    [mode, excluded, manual],
  );

  const onToggle = React.useCallback(
    (u: UserRefDTO) => {
      if (mode === "all") {
        setExcluded((s) => {
          const next = new Set(s);
          if (next.has(u.id)) {
            next.delete(u.id);
          } else {
            next.add(u.id);
          }
          return next;
        });
      } else {
        setManual((s) => {
          const next = new Set(s);
          if (next.has(u.id)) {
            next.delete(u.id);
          } else {
            next.add(u.id);
          }
          return next;
        });
      }
    },
    [mode],
  );

  const onToggleAllMatching = React.useCallback((checked: boolean) => {
    if (checked) {
      setMode("all");
      setExcluded(new Set());
    } else {
      setMode("manual");
      setManual(new Set());
    }
  }, []);

  const onMetaChange = React.useCallback((meta: { total: number }) => setTotal(meta.total), []);

  const willAffect = mode === "all" ? Math.max(total - excluded.size, 0) : manual.size;
  const overCap = mode === "manual" && manual.size > MANUAL_CAP;
  const needsDate = temporal && !effectiveFrom;

  const jobStatus = job.data?.status;
  const running = Boolean(jobId) && !(jobStatus && isTerminalJobStatus(jobStatus));
  React.useEffect(() => {
    if (jobStatus && isTerminalJobStatus(jobStatus)) {
      for (const key of invalidateKeys) void queryClient.invalidateQueries({ queryKey: key });
      void queryClient.invalidateQueries({ queryKey: [PEOPLE_SEARCH_QK] });
    }
    // invalidateKeys is a prop array rebuilt by the parent each render; depending on it would
    // re-run this on every render. The job status is what should drive the invalidation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobStatus, queryClient]);

  const manualDone = applyManual.isSuccess ? applyManual.data : null;
  const segmentDone = jobStatus && isTerminalJobStatus(jobStatus) ? job.data : null;
  const result: ResultLike | null = manualDone ?? segmentDone ?? null;
  const done = Boolean(result);

  React.useEffect(() => {
    if (done) onCloseAction();
  }, [done, onCloseAction]);

  const busy = applyManual.isPending || applySegment.isPending;
  const errorMessage =
    applyManual.error?.message ??
    applySegment.error?.message ??
    (jobStatus === "FAILED" ? job.data?.errorDetail ?? "The job failed." : undefined);

  const handleApply = async () => {
    if (willAffect === 0 || overCap || needsDate) return;
    const from = temporal ? effectiveFrom || null : null;
    const to = temporal ? effectiveTo || null : null;
    try {
      if (mode === "all") {
        const segment: Segment = {
          filters: [...filters, ...exclusionFilters],
          excludeUserIds: [...excluded],
          includeInactive,
        };
        const res = await applySegment.mutateAsync({ segment, effectiveFrom: from, effectiveTo: to });
        setJobId(res.jobId);
      } else {
        await applyManual.mutateAsync({
          targetType: "USER",
          targetPayload: { userIds: [...manual] },
          effectiveFrom: from,
          effectiveTo: to,
        });
      }
    } catch {
    }
  };

  const closeGuarded = () => {
    if (!busy && !running) onCloseAction();
  };

  const description =
    semantics === "add"
      ? `This only adds the ${noun} — nobody is removed. The audience is captured once, now.`
      : `A person can belong to one ${noun} only, so anyone who already has one leaves it — this is a move, not an addition.`;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) closeGuarded(); }}>
      <DialogContent className="sm:max-w-3xl max-h-[88vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add people to {assignableName ?? noun}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {running ? (
            <RunningView
              created={job.data?.summary.created ?? 0}
              total={job.data?.summary.total ?? willAffect}
              semantics={semantics}
            />
          ) : (
            <div className="space-y-3">
              {temporal && (
                <div className="flex flex-wrap gap-4 rounded-md border border-brown-200 px-4 py-3">
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="text-muted-foreground">Effective from *</span>
                    <input
                      type="date"
                      value={effectiveFrom}
                      onChange={(e) => setEffectiveFrom(e.target.value)}
                      className="rounded-md border border-brown-200 px-2 py-1"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="text-muted-foreground">Effective to</span>
                    <input
                      type="date"
                      value={effectiveTo}
                      onChange={(e) => setEffectiveTo(e.target.value)}
                      className="rounded-md border border-brown-200 px-2 py-1"
                    />
                  </label>
                </div>
              )}

              <PeoplePicker
                fields={fields}
                filters={filters}
                onFiltersChange={setFilters}
                columns={pickerColumns}
                extraFilters={exclusionFilters}
                isSelected={isSelected}
                onToggle={onToggle}
                allMatchingSelected={mode === "all"}
                onToggleAllMatching={onToggleAllMatching}
                onMetaChange={onMetaChange}
                includeInactive={includeInactive}
                onIncludeInactiveChange={setIncludeInactive}
              />

              {overCap && (
                <p className="flex items-start gap-2 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" />
                  You’ve selected {manual.size}. Add up to {MANUAL_CAP} manually, or use “select
                  everyone who matches” for larger groups.
                </p>
              )}

              {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
            </div>
          )}
        </div>

        <DialogFooter>
          {running ? (
            <Button disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding…
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={onCloseAction} disabled={busy}>
                Cancel
              </Button>
              <Button
                onClick={handleApply}
                disabled={busy || willAffect === 0 || overCap || needsDate}
              >
                {busy ? "Starting…" : `Add ${willAffect} ${willAffect === 1 ? "person" : "people"}`}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const RunningView: React.FC<{ created: number; total: number; semantics: "add" | "replace" }> = ({
  created,
  total,
  semantics,
}) => {
  const pct = total > 0 ? Math.min(Math.round((created / total) * 100), 100) : 0;
  return (
    <div className="space-y-3 py-6">
      <div className="flex items-center gap-2 text-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        Adding people… {created} of {total}
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-brown-100">
        <div className="h-full bg-brown-400 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-muted-foreground">
        You can keep this open — it finishes on its own.{" "}
        {semantics === "add" ? "Already-assigned people are skipped." : "Existing assignments are reassigned."}
      </p>
    </div>
  );
};

