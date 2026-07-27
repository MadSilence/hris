"use client";

import * as React from "react";
import { AlertTriangle, Check, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/public/desact/src/components/ui/dialog";
import { Button } from "@/public/desact/src/components/ui/button";
import { Badge } from "@/public/desact/src/components/ui/badge";
import { PeoplePicker } from "@/components/audience/PeoplePicker";
import { useUserFields } from "@/components/modules/organization/hooks/useUserFields/useUserFields";
import {
  useApplyRoleAssignment,
  useApplyRoleSegment,
  useRoleAssignmentJob,
} from "@/components/modules/settings/modules/roles/hooks/useRoleAssignments";
import { rolesQueryKeys } from "@/components/modules/settings/modules/roles/utils/rolesQueryKeys";
import { PEOPLE_SEARCH_QK } from "@/components/modules/organization/hooks/usePeopleSearch/usePeopleSearch";
import { useQueryClient } from "@tanstack/react-query";
import { isTerminalJobStatus } from "@/api/modules/roles/dto/RoleSegmentAssignmentDTO";
import type { FilterDTO } from "@/models/user/fields";
import type { Segment, UserRefDTO } from "@/models/segment/Segment";

const MANUAL_CAP = 300;

type ResultSummary = { total: number; created: number; skipped: number; failed: number };
type ResultLike = {
  summary: ResultSummary;
  failed?: { userId: string; email: string; errorDetail?: string | null }[];
};

export interface AssignUsersModalProps {
  isOpen: boolean;
  roleId: string;
  roleName?: string;
  onCloseAction: () => void;
}

export const AssignUsersModal: React.FC<AssignUsersModalProps> = ({
  isOpen,
  roleId,
  roleName,
  onCloseAction,
}) => {
  const { data: fields } = useUserFields();
  const queryClient = useQueryClient();

  const [filters, setFilters] = React.useState<FilterDTO[]>([]);
  // "all" = assign everyone who matches (async segment, unbounded); "manual" = pick people (sync, ≤300).
  const [mode, setMode] = React.useState<"manual" | "all">("manual");
  const [manual, setManual] = React.useState<Set<string>>(new Set());
  const [excluded, setExcluded] = React.useState<Set<string>>(new Set());
  const [total, setTotal] = React.useState(0);
  const [jobId, setJobId] = React.useState<string | null>(null);

  const applyManual = useApplyRoleAssignment(roleId);
  const applySegment = useApplyRoleSegment(roleId);
  const job = useRoleAssignmentJob(roleId, jobId);

  const reset = React.useCallback(() => {
    setFilters([]);
    setMode("manual");
    setManual(new Set());
    setExcluded(new Set());
    setTotal(0);
    setJobId(null);
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
          next.has(u.id) ? next.delete(u.id) : next.add(u.id);
          return next;
        });
      } else {
        setManual((s) => {
          const next = new Set(s);
          next.has(u.id) ? next.delete(u.id) : next.add(u.id);
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

  // Job lifecycle.
  const jobStatus = job.data?.status;
  const running = Boolean(jobId) && !(jobStatus && isTerminalJobStatus(jobStatus));
  React.useEffect(() => {
    if (jobStatus && isTerminalJobStatus(jobStatus)) {
      void queryClient.invalidateQueries({ queryKey: rolesQueryKeys.roles() });
      void queryClient.invalidateQueries({ queryKey: [PEOPLE_SEARCH_QK] });
    }
  }, [jobStatus, queryClient]);

  const manualDone = applyManual.isSuccess ? applyManual.data : null;
  const segmentDone = jobStatus && isTerminalJobStatus(jobStatus) ? job.data : null;
  const result: ResultLike | null = manualDone ?? segmentDone ?? null;

  const busy = applyManual.isPending || applySegment.isPending;
  const errorMessage =
    applyManual.error?.message ??
    applySegment.error?.message ??
    (jobStatus === "FAILED" ? job.data?.errorDetail ?? "The job failed." : undefined);

  const handleApply = async () => {
    if (willAffect === 0 || overCap) return;
    try {
      if (mode === "all") {
        const segment: Segment = { filters, excludeUserIds: [...excluded] };
        const res = await applySegment.mutateAsync({ segment });
        setJobId(res.jobId);
      } else {
        await applyManual.mutateAsync({
          targetType: "USER",
          targetPayload: { userIds: [...manual] },
        });
      }
    } catch {
      // Surfaced via errorMessage.
    }
  };

  const closeGuarded = () => {
    if (!busy && !running) onCloseAction();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) closeGuarded(); }}>
      <DialogContent className="sm:max-w-3xl max-h-[88vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add people to {roleName ?? "role"}</DialogTitle>
          <DialogDescription>
            This only adds the role — nobody is removed. The audience is captured once, now.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {result ? (
            <ResultView result={result} />
          ) : running ? (
            <RunningView
              created={job.data?.summary.created ?? 0}
              total={job.data?.summary.total ?? willAffect}
            />
          ) : (
            <div className="space-y-3">
              <PeoplePicker
                fields={fields}
                filters={filters}
                onFiltersChange={setFilters}
                isSelected={isSelected}
                onToggle={onToggle}
                allMatchingSelected={mode === "all"}
                onToggleAllMatching={onToggleAllMatching}
                onMetaChange={onMetaChange}
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
          {result ? (
            <Button onClick={onCloseAction}>Done</Button>
          ) : running ? (
            <Button disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding…
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={onCloseAction} disabled={busy}>
                Cancel
              </Button>
              <Button onClick={handleApply} disabled={busy || willAffect === 0 || overCap}>
                {busy ? "Starting…" : `Add ${willAffect} ${willAffect === 1 ? "person" : "people"}`}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ---- running (async job in progress) ------------------------------------

const RunningView: React.FC<{ created: number; total: number }> = ({ created, total }) => {
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
        You can keep this open — it finishes on its own. Already-assigned people are skipped.
      </p>
    </div>
  );
};

// ---- result summary (sync apply or async job) ---------------------------

const ResultView: React.FC<{ result: ResultLike }> = ({ result }) => {
  const failed = result.failed ?? [];
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary" className="gap-1.5 font-normal">
          <Check className="h-3.5 w-3.5" />
          {result.summary.created} added
        </Badge>
        <Badge variant="outline" className="font-normal">{result.summary.skipped} skipped</Badge>
        {result.summary.failed > 0 && (
          <Badge variant="outline" className="font-normal text-red-600">
            {result.summary.failed} failed
          </Badge>
        )}
        <Badge variant="outline" className="font-normal">{result.summary.total} matched</Badge>
      </div>

      {result.summary.created === 0 && failed.length === 0 && (
        <p className="flex items-start gap-2 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" />
          Nobody new was added — everyone selected already has this role.
        </p>
      )}

      {failed.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Failed
          </p>
          <div className="max-h-[200px] divide-y divide-brown-100 overflow-y-auto rounded-lg border border-brown-200">
            {failed.map((f) => (
              <div key={f.userId} className="flex items-center justify-between gap-3 px-3 py-2">
                <p className="min-w-0 truncate text-sm">{f.email}</p>
                <span className="flex-none text-xs text-red-600">{f.errorDetail ?? "Error"}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
