"use client";

import * as React from "react";
import { FormError } from "@/components/feedback/FormError";
import { AlertTriangle, Check, Loader2 } from "lucide-react";
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
import { DatePicker } from "@/components/ui/DatePicker";
import { describeSkips } from "@/components/audience/assignment/assignmentSkips";
import type { AssignmentSkippedUser } from "@/api/modules/assignments/dto/AssignmentDTO";

const MANUAL_CAP = 300;

type ResultSummary = { total: number; created: number; skipped: number; failed: number };
type ResultLike = {
  summary: ResultSummary;
  failed?: { userId: string; email: string; errorDetail?: string | null }[];
  /** Only the manual path reports these per person; the segment job returns a count alone. */
  skipped?: AssignmentSkippedUser[];
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
  /**
   * A warning about the people picked by hand, shown before Add — the impact-before-action contract.
   * The domain supplies it because only the domain knows what a pair can get wrong (a leave policy
   * whose approval chain resolves to nobody for this person). Not called for "everyone who matches":
   * there is no list to ask about, and the result screen reports who was skipped.
   */
  renderSelectionWarning?: (userIds: string[]) => React.ReactNode;
};

/**
 * `column` is what the picker shows about the person's current assignment; `excludeField` keeps
 * people who already have this one out of the list.
 *
 * Jobs carry no `column`: the resolver builds its extras from a fixed set that has no `job`, so a
 * "Current position" cell would need a backend change. The exclusion filter works without it, which
 * is the half that matters — and a duplicate the filter misses is skipped by the engine and now
 * reported on the result screen.
 */
const DOMAIN_CONFIG: Record<string, { column?: PeopleColumn; excludeField: string }> = {
  "/jobs": { excludeField: "sys:job" },
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
  renderSelectionWarning,
}) => {
  const { data: fields, isLoading: fieldsLoading } = useUserFields();
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
  const pickerColumns = domain?.column ? [domain.column] : undefined;
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
  /* The poll stopped answering. The job itself is running or finished on the server — what ended is
     this browser's right to ask, which is what a bulk assignment that includes the person making it
     does to their own token (`technical_documentation/ACCESS.md` § 8). Saying so beats a progress
     bar that never moves again. */
  const lostTheThread = Boolean(jobId) && job.isError;
  const running = Boolean(jobId) && !lostTheThread && !(jobStatus && isTerminalJobStatus(jobStatus));
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
  /*
   * The modal used to close itself here, in an effect on `done`.
   *
   * Everything below — how many were added, how many were passed over and why, which ones the engine
   * could not write — was computed, handed to this component, and thrown away in the same tick. **The
   * engine's characteristic bug is not a wrong answer, it is a correct answer nobody sees**: drag an
   * archived colleague onto a team, confirm, and watch the chip stay where it was.
   *
   * It stays open on a result and the reader closes it. `assignmentSkips.ts` — written for exactly
   * this and wired to two drag-and-drop hooks and nothing else — supplies the words.
   */

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
        // Must be the same segment the picker previewed, `drafts` included, or the count on the
        // button and the people the job touches are two different sets.
        const segment: Segment = {
          filters: [...filters, ...exclusionFilters],
          excludeUserIds: [...excluded],
          includeInactive,
          drafts: includeInactive ? "INCLUDE" : "EXCLUDE",
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
          {result ? (
            <ResultView result={result} noun={noun} />
          ) : lostTheThread ? (
            <div className="space-y-2 py-6 text-sm">
              <p className="font-medium">This is still running, and we cannot follow it from here.</p>
              <p className="text-muted-foreground">
                Reload the page to see the result. If your own access changed with this assignment, sign in
                again first — the change itself is not affected.
              </p>
            </div>
          ) : running ? (
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
                    <DatePicker
                      value={effectiveFrom}
                      onChange={setEffectiveFrom}
                      ariaLabel="Effective from"
                      className="w-44"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="text-muted-foreground">Effective to</span>
                    <DatePicker
                      value={effectiveTo}
                      onChange={setEffectiveTo}
                      ariaLabel="Effective to"
                      className="w-44"
                    />
                  </label>
                </div>
              )}

              <PeoplePicker
                fields={fields}
                isLoadingFields={fieldsLoading}
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

              {/*
                The checkbox widens the *search* in two directions, and the engine treats the two
                halves differently. `AssignmentRuleService` skips `!user.isActive()` — a leaver —
                unconditionally, and no flag reaches it. Somebody who has not started, draft or not,
                is not a leaver: assigning them a department or a calendar ahead of day one is the
                whole point, and `ResolvedUser.isActive` says so.

                Said here rather than fixed in the engine, because "may a terminated employee be
                assigned to an office" is a product decision and not one to take from a checkbox
                label. The result screen shows the skips either way; this stops them being a surprise.
              */}
              {includeInactive && (
                <p className="flex items-start gap-2 rounded-md bg-brown-50 px-4 py-3 text-sm text-brown-800">
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" />
                  People who have left can be found this way but not assigned — they will be listed as
                  skipped. People who have not started yet, drafts included, are assigned normally.
                </p>
              )}

              {mode === "manual" && manual.size > 0 && !overCap && renderSelectionWarning
                ? renderSelectionWarning([...manual])
                : null}

              {overCap && (
                <p className="flex items-start gap-2 rounded-md bg-warning-50 px-4 py-3 text-sm text-warning-800">
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" />
                  You’ve selected {manual.size}. Add up to {MANUAL_CAP} manually, or use “select
                  everyone who matches” for larger groups.
                </p>
              )}

              <FormError message={errorMessage} />
            </div>
          )}
        </div>

        <DialogFooter>
          {result ? (
            <Button onClick={onCloseAction}>Done</Button>
          ) : lostTheThread ? (
            <Button onClick={onCloseAction}>Close</Button>
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

/**
 * What the apply actually did.
 *
 * Three numbers, and the two that are not "created" carry their reasons. The manual path returns
 * `skipped[]` per person, so those get named or counted by reason; the segment job returns only a
 * count for skips, so it says the count and stops rather than inventing a reason for it.
 *
 * **A skip is not a failure and they are not shown alike.** "Already there" and "archived" are the
 * engine doing its job; a `failed` row is the engine unable to write, which is the only line here
 * anybody has to act on.
 */
const ResultView: React.FC<{ result: ResultLike; noun: string }> = ({ result, noun }) => {
  const { total, created, skipped, failed } = result.summary;
  const skippedDetail = result.skipped ? describeSkips(result.skipped) : null;

  return (
    <div className="space-y-4 px-1 py-6">
      <div className="flex items-start gap-3">
        {failed > 0 ? (
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-none text-warning-600" />
        ) : (
          <Check className="mt-0.5 h-5 w-5 flex-none text-success-600" />
        )}
        <div>
          <p className="font-medium text-foreground">
            {created} of {total} {total === 1 ? "person" : "people"} added to the {noun}.
          </p>
          {created === 0 && (
            <p className="mt-1 text-sm text-muted-foreground">Nothing changed.</p>
          )}
        </div>
      </div>

      {skipped > 0 && (
        <div className="rounded-md bg-brown-50 px-4 py-3 text-sm text-brown-800">
          {skippedDetail ?? `${skipped} ${skipped === 1 ? "person was" : "people were"} skipped.`}
        </div>
      )}

      {failed > 0 && (
        <div className="space-y-2 rounded-md bg-danger-50 px-4 py-3 text-sm text-danger-800">
          <p className="font-medium">
            {failed} {failed === 1 ? "person" : "people"} could not be added.
          </p>
          <ul className="space-y-1">
            {(result.failed ?? []).map((f) => (
              <li key={f.userId}>
                {f.email}
                {f.errorDetail ? ` \u2014 ${f.errorDetail}` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
