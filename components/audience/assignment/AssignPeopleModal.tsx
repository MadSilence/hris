"use client";

import * as React from "react";
import Link from "next/link";
import { FormError } from "@/components/feedback/FormError";
import { AlertTriangle, ArrowLeft, Check, Repeat } from "lucide-react";
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
import { useApplyAssignment, useAssignmentPreview } from "@/components/audience/assignment/hooks/useAssignment";
import { PEOPLE_SEARCH_QK } from "@/components/modules/organization/hooks/usePeopleSearch/usePeopleSearch";
import type { FilterDTO } from "@/models/user/fields";
import type { Segment, UserRefDTO } from "@/models/segment/Segment";
import { DatePicker } from "@/components/ui/DatePicker";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { countSkips, describeSkips, skipCountLines } from "@/components/audience/assignment/assignmentSkips";
import { assignableTypeOf } from "@/components/audience/assignment/assignableTypes";
import type { AssignmentSkippedUser, AssignmentSkipReason } from "@/api/modules/assignments/dto/AssignmentDTO";
import { useCreateLiveRule, useLiveRulePreview } from "@/components/modules/automations/hooks";
import type { LiveAssignmentCreated } from "@/models/automations";

const MANUAL_CAP = 300;

type ResultSummary = { total: number; created: number; skipped: number; failed: number };
type ResultLike = {
  summary: ResultSummary;
  failed?: { userId: string; email: string; errorDetail?: string | null }[];
  skipped?: AssignmentSkippedUser[];
};

/** What the preview step shows, whichever path produced it. */
type PreviewSummary = {
  willAssign: number;
  skipped: number;
  skippedByReason: Partial<Record<AssignmentSkipReason, number>>;
  /** Live rules only: people another live rule already places here. */
  conflicts: number;
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
   * there is no list to ask about, and the preview step counts who would be skipped.
   */
  renderSelectionWarning?: (userIds: string[]) => React.ReactNode;
};

/**
 * `column` is what the picker shows about the person's current assignment; `excludeField` keeps
 * people who already have this one out of the list.
 *
 * Jobs carry no `column`: the resolver builds its extras from a fixed set that has no `job`, so a
 * "Current position" cell would need a backend change. The exclusion filter works without it, which
 * is the half that matters — and a duplicate the filter misses is skipped by the engine and reported.
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

const people = (n: number) => `${n} ${n === 1 ? "person" : "people"}`;

/**
 * Assign people to one target — eight surfaces, one modal (ASSIGNMENT_PLAN 4.1, owner decision 7).
 *
 * Two steps: pick, then **preview** ("N will be assigned, M skipped, and why") before Apply, on every
 * surface. Two modes, and they are different promises:
 *
 * - **Picked people** are assigned by hand, once, through the module's own `/apply` — a hand
 *   assignment, which no rule ever takes away.
 * - **Everyone who matches** creates a **live rule** (`/assignments/live-rules`): everyone who matches
 *   now, and anyone who matches later. The rule is listed in Settings → Automation like any other.
 */
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
  const [effectiveFrom, setEffectiveFrom] = React.useState("");
  const [effectiveTo, setEffectiveTo] = React.useState("");
  const [step, setStep] = React.useState<"pick" | "preview">("pick");
  const [previewSummary, setPreviewSummary] = React.useState<PreviewSummary | null>(null);
  const [liveResult, setLiveResult] = React.useState<LiveAssignmentCreated | null>(null);

  const assignableType = assignableTypeOf(basePath);
  const domain = DOMAIN_CONFIG[basePath];
  // A domain without its own column shows none. `undefined` fell back to the picker's default, the
  // roles column, so assigning a leave policy or a job listed everybody's roles (SWEEP S4).
  const pickerColumns = domain?.column ? [domain.column] : [];
  // "Not already assigned to this one" — which must keep people who are assigned to nothing at all,
  // hence includeEmpty. The picker only: see `liveSegment` for why the rule must not carry it.
  const exclusionFilters: FilterDTO[] = domain
    ? [{ field: domain.excludeField, op: "neq", value: assignableId, includeEmpty: true }]
    : [];

  const previewManual = useAssignmentPreview(basePath, assignableId);
  const applyManual = useApplyAssignment(basePath, assignableId, invalidateKeys);
  const previewLive = useLiveRulePreview();
  const createLive = useCreateLiveRule();

  const reset = React.useCallback(() => {
    setFilters([]);
    setMode("manual");
    setManual(new Set());
    setExcluded(new Set());
    setTotal(0);
    setEffectiveFrom("");
    setEffectiveTo("");
    setStep("pick");
    setPreviewSummary(null);
    setLiveResult(null);
    previewManual.reset();
    applyManual.reset();
    previewLive.reset();
    createLive.reset();
  }, [previewManual, applyManual, previewLive, createLive]);

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
      const flip = (s: Set<string>) => {
        const next = new Set(s);
        if (next.has(u.id)) next.delete(u.id);
        else next.add(u.id);
        return next;
      };
      if (mode === "all") setExcluded(flip);
      else setManual(flip);
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

  const live = mode === "all";
  const willAffect = live ? Math.max(total - excluded.size, 0) : manual.size;
  const overCap = !live && manual.size > MANUAL_CAP;
  // A live rule assigns each person from the day they start matching, so it takes no dates.
  const needsDate = temporal && !live && !effectiveFrom;

  /*
   * The rule's segment is the reader's filters and nothing else. The picker also hides people who
   * already have this target — but a rule whose segment says "does not have it" would see everyone it
   * assigns stop matching at once, and take it back again. Somebody who already has it is skipped as
   * a duplicate instead, and the preview says so.
   */
  const liveSegment = (): Segment => ({
    filters,
    excludeUserIds: [...excluded],
    includeInactive,
    drafts: includeInactive ? "INCLUDE" : "EXCLUDE",
  });
  const manualRequest = () => ({
    targetType: "USER" as const,
    targetPayload: { userIds: [...manual] },
    effectiveFrom: temporal ? effectiveFrom || null : null,
    effectiveTo: temporal ? effectiveTo || null : null,
  });
  const liveRequest = () => ({
    assignableType: assignableType as NonNullable<typeof assignableType>,
    assignableId,
    segment: liveSegment(),
  });

  const handlePreview = async () => {
    if (willAffect === 0 || overCap || needsDate) return;
    try {
      if (live) {
        if (!assignableType) return;
        const p = await previewLive.mutateAsync(liveRequest());
        const skipped = Object.values(p.skippedByReason).reduce((n, x) => n + (x ?? 0), 0);
        setPreviewSummary({ willAssign: p.willAssign, skipped, skippedByReason: p.skippedByReason, conflicts: p.conflicts.length });
      } else {
        const p = await previewManual.mutateAsync(manualRequest());
        const byReason = p.skippedByReason ?? countSkips(p.toSkip);
        setPreviewSummary({ willAssign: p.summary.created, skipped: p.summary.skipped, skippedByReason: byReason, conflicts: 0 });
      }
      setStep("preview");
    } catch {
      // The error is on the mutation, and the form shows it.
    }
  };

  const handleApply = async () => {
    try {
      if (live) {
        const created = await createLive.mutateAsync(liveRequest());
        setLiveResult(created);
        for (const key of invalidateKeys) await queryClient.invalidateQueries({ queryKey: key });
        await queryClient.invalidateQueries({ queryKey: [PEOPLE_SEARCH_QK] });
      } else {
        await applyManual.mutateAsync(manualRequest());
      }
    } catch {
      // Shown in the dialog that asked.
    }
  };

  const busy = previewManual.isPending || previewLive.isPending || applyManual.isPending || createLive.isPending;
  const errorMessage =
    previewManual.error?.message ??
    previewLive.error?.message ??
    applyManual.error?.message ??
    createLive.error?.message;

  /*
   * The modal stays open on a result and the reader closes it. Closing on "success" threw away who
   * was added, who was passed over and why — the engine's characteristic bug is a correct answer
   * nobody sees.
   */
  const manualResult: ResultLike | null = applyManual.isSuccess ? applyManual.data : null;
  const done = Boolean(manualResult || liveResult);

  const closeGuarded = () => {
    if (!busy) onCloseAction();
  };

  const description =
    semantics === "add"
      ? `This only adds the ${noun} — nobody is removed.`
      : `A person can belong to one ${noun} only, so anyone who already has one leaves it — this is a move, not an addition.`;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) closeGuarded(); }}>
      <DialogContent className="sm:max-w-3xl max-h-[88vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add People to {assignableName ?? noun}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {liveResult ? (
            <LiveResultView result={liveResult} noun={noun} />
          ) : manualResult ? (
            <ResultView result={manualResult} noun={noun} />
          ) : step === "preview" && previewSummary ? (
            <PreviewView summary={previewSummary} live={live} noun={noun} errorMessage={errorMessage} />
          ) : (
            <div className="space-y-3">
              {temporal && !live && (
                <div className="flex flex-wrap gap-4 rounded-md border border-brown-200 px-4 py-3">
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="text-muted-foreground">Effective from *</span>
                    <DatePicker value={effectiveFrom} onChange={setEffectiveFrom} ariaLabel="Effective from" className="w-44" />
                  </label>
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="text-muted-foreground">Effective to</span>
                    <DatePicker value={effectiveTo} onChange={setEffectiveTo} ariaLabel="Effective to" className="w-44" />
                  </label>
                </div>
              )}

              {live && <LiveRuleNote temporal={temporal} />}

              <PeoplePicker
                fields={fields}
                isLoadingFields={fieldsLoading}
                filters={filters}
                onFiltersChange={setFilters}
                columns={pickerColumns}
                extraFilters={exclusionFilters}
                isSelected={isSelected}
                onToggle={onToggle}
                allMatchingSelected={live}
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
              */}
              {includeInactive && (
                <p className="flex items-start gap-2 rounded-md bg-brown-50 px-4 py-3 text-sm text-brown-800">
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" />
                  People who have left can be found this way but not assigned — they will be listed as
                  skipped. People who have not started yet, drafts included, are assigned normally.
                </p>
              )}

              {!live && manual.size > 0 && !overCap && renderSelectionWarning
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
          {done ? (
            <Button type="button" onClick={onCloseAction}>Done</Button>
          ) : step === "preview" ? (
            <>
              <Button type="button" variant="outline" className="gap-1.5" onClick={() => setStep("pick")} disabled={busy}>
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button type="button" onClick={handleApply} disabled={busy || (!live && (previewSummary?.willAssign ?? 0) === 0)}>
                {busy ? "Applying…" : live ? "Create Live Rule" : `Add ${people(previewSummary?.willAssign ?? 0)}`}
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={onCloseAction} disabled={busy}>
                Cancel
              </Button>
              <Button type="button" onClick={handlePreview} disabled={busy || willAffect === 0 || overCap || needsDate || (live && !assignableType)}>
                {busy ? "Checking…" : `Review ${people(willAffect)}`}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/** Said plainly, where the reader chooses it: a filter here is a promise about the future too. */
const LiveRuleNote: React.FC<{ temporal: boolean }> = ({ temporal }) => (
  <div className="flex items-start gap-3 rounded-md bg-info-50 px-4 py-3 text-sm text-info-800" data-test="live-rule-note">
    <Repeat className="mt-0.5 h-4 w-4 flex-none" />
    <div>
      <p className="m-0 font-medium">Everyone who matches now, and anyone who matches later.</p>
      <p className="m-0">
        Assigning by filter creates a live rule: people who start matching are assigned, and people who
        stop matching lose only what the rule gave them. A value somebody set by hand is left alone.
        {temporal ? " Each person gets it from the day they start matching — today for everyone who matches now." : ""}
      </p>
    </div>
  </div>
);

/** "N will be assigned, M skipped" — and why — before anything is written. */
const PreviewView: React.FC<{ summary: PreviewSummary; live: boolean; noun: string; errorMessage?: string }> = ({
  summary,
  live,
  noun,
  errorMessage,
}) => {
  const lines = skipCountLines(summary.skippedByReason);
  return (
    <div className="space-y-4 px-1 py-6" data-test="assignment-preview">
      <p className="m-0 text-base font-medium text-foreground">
        {people(summary.willAssign)} will be assigned{summary.skipped > 0 ? `, ${summary.skipped} skipped` : ""}.
      </p>
      {lines.length > 0 && (
        <ul className="m-0 list-none space-y-1 rounded-md bg-brown-50 px-4 py-3 text-sm text-brown-800">
          {lines.map((l) => <li key={l.reason}>{l.text}</li>)}
        </ul>
      )}
      {summary.conflicts > 0 && (
        <p className="m-0 rounded-md bg-warning-50 px-4 py-3 text-sm text-warning-800">
          {people(summary.conflicts)} already {summary.conflicts === 1 ? "has" : "have"} a {noun} from another live
          rule. That rule keeps it; this one does not overwrite it.
        </p>
      )}
      {live ? (
        <p className="m-0 text-sm text-muted-foreground">
          This creates a live rule — everyone who matches now, and anyone who matches later. You can find
          it, change it or switch it off in Settings → Automation.
        </p>
      ) : (
        <p className="m-0 text-sm text-muted-foreground">
          These people are assigned by hand, once. No rule takes a hand assignment away.
        </p>
      )}
      <FormError message={errorMessage} />
    </div>
  );
};

const LiveResultView: React.FC<{ result: LiveAssignmentCreated; noun: string }> = ({ result, noun }) => {
  const lines = skipCountLines(result.skippedByReason);
  return (
    <div className="space-y-4 px-1 py-6">
      <div className="flex items-start gap-3">
        <Check className="mt-0.5 h-5 w-5 flex-none text-success-600" />
        <div>
          <p className="m-0 font-medium text-foreground">
            Live rule “{result.ruleName}” created.
          </p>
          <p className="m-0 mt-1 text-sm text-muted-foreground">
            {people(result.appliedNow)} added to the {noun} now
            {result.willAssign > result.appliedNow ? `, ${result.willAssign - result.appliedNow} more on their own date` : ""}.
            Anyone who matches later is added too.
          </p>
        </div>
      </div>
      {lines.length > 0 && (
        <ul className="m-0 list-none space-y-1 rounded-md bg-brown-50 px-4 py-3 text-sm text-brown-800">
          {lines.map((l) => <li key={l.reason}>{l.text}</li>)}
        </ul>
      )}
      <PermissionGate resource="SETTINGS.AUTOMATIONS" action="VIEW">
        <Link href={`/settings/automation/automations/${result.ruleId}`} className="text-sm">
          Open the Rule
        </Link>
      </PermissionGate>
    </div>
  );
};

/**
 * What the apply actually did.
 *
 * Three numbers, and the two that are not "created" carry their reasons. **A skip is not a failure
 * and they are not shown alike.** "Already there" and "archived" are the engine doing its job; a
 * `failed` row is the engine unable to write, which is the only line here anybody has to act on.
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
                {f.errorDetail ? ` — ${f.errorDetail}` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
