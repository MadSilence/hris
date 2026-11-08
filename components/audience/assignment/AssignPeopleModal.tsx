"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { FormError } from "@/components/feedback/FormError";
import { FieldError } from "@/components/desact/field-error";
import { Alert02Icon, ArrowLeft02Icon, RepeatIcon, Tick02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import type { QueryKey } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/desact/dialog";
import { Button } from "@/components/desact/button";
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

/** The kinds of target people are assigned to here; each has its own phrasing in `audience.assign.*`. */
export type AssignTargetKind =
  | "policy"
  | "calendar"
  | "team"
  | "department"
  | "position"
  | "role"
  | "legalEntity"
  | "office";

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
  /** What people are added to — chooses the wording, which in Russian also chooses the case. */
  kind: AssignTargetKind;
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
  /**
   * People who already hold the target — the fallback for a reader who may not filter by the domain's
   * field. A time off policy's holders are filtered out by `sys:policy`, but that field is sensitive:
   * a reader who manages policies without seeing the field company-wide would have the filter refused,
   * so for them the holders stay in the list, greyed and unpickable.
   */
  currentHolderIds?: string[];
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
  "/time-off/policies": { excludeField: "sys:policy" },
};

/**
 * Assign people to one target — eight surfaces, one modal (DECISIONS.md, 2026-10-16, decision 7).
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
  kind,
  semantics,
  temporal = false,
  invalidateKeys = [],
  renderSelectionWarning,
  currentHolderIds,
}) => {
  const t = useTranslations("access");
  const tCommon = useTranslations("common");
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
  const [tried, setTried] = React.useState(false);
  const [applyTried, setApplyTried] = React.useState(false);

  const assignableType = assignableTypeOf(basePath);
  const domain = DOMAIN_CONFIG[basePath];
  // A domain without its own column shows none. `undefined` fell back to the picker's default, the
  // roles column, so assigning a leave policy or a job listed everybody's roles (SWEEP S4).
  const pickerColumns = domain?.column ? [domain.column] : [];
  // "Not already assigned to this one" — which must keep people who are assigned to nothing at all,
  // hence includeEmpty. The picker only: see `liveSegment` for why the rule must not carry it.
  // A sensitive field filters only for a reader who sees it company-wide; the server refuses it otherwise.
  const excludeFieldDto = domain ? fields?.find((f) => f.id === domain.excludeField) : undefined;
  const canExcludeByField =
    !!domain && (domain.excludeField !== "sys:policy" || (excludeFieldDto?.viewScopes ?? []).includes("COMPANY"));
  const exclusionFilters: FilterDTO[] = domain && canExcludeByField
    ? [{ field: domain.excludeField, op: "neq", value: assignableId, includeEmpty: true }]
    : [];

  const holders = React.useMemo(() => new Set(currentHolderIds ?? []), [currentHolderIds]);
  const unavailableReason = React.useCallback(
    (user: UserRefDTO) => (holders.has(user.id) ? t("audience.assign.alreadyAssigned") : null),
    [holders, t],
  );

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
    setTried(false);
    setApplyTried(false);
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
    setTried(true);
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
      setApplyTried(false);
      setStep("preview");
    } catch {
      // The error is on the mutation, and the form shows it.
    }
  };

  const handleApply = async () => {
    setApplyTried(true);
    if (!live && (previewSummary?.willAssign ?? 0) === 0) return;
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
      ? t("audience.assign.descriptionAdd", { kind })
      : t("audience.assign.descriptionReplace", { kind });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) closeGuarded(); }}>
      <DialogContent className="sm:max-w-3xl max-h-[88vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{assignableName
            ? t("audience.assign.title", { name: assignableName })
            : t("audience.assign.titleKind", { kind })}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {liveResult ? (
            <LiveResultView result={liveResult} kind={kind} />
          ) : manualResult ? (
            <ResultView result={manualResult} kind={kind} />
          ) : step === "preview" && previewSummary ? (
            <PreviewView
              summary={previewSummary}
              live={live}
              kind={kind}
              errorMessage={errorMessage}
              nobodyError={applyTried && !live && previewSummary.willAssign === 0 ? t("audience.assign.preview.nobodyToAssign") : null}
            />
          ) : (
            <div className="space-y-3">
              {temporal && !live && (
                <div className="flex flex-wrap gap-4 rounded-control border border-divider px-4 py-3">
                  <label className="flex flex-col gap-1 text-body">
                    <span className="text-tertiary">{t("audience.assign.effectiveFromRequired")}</span>
                    <DatePicker value={effectiveFrom} onChange={setEffectiveFrom} ariaLabel={t("audience.assign.effectiveFrom")} className="w-44" />
                    <FieldError>{tried && needsDate ? tCommon("validation.required") : null}</FieldError>
                  </label>
                  <label className="flex flex-col gap-1 text-body">
                    <span className="text-tertiary">{t("audience.assign.effectiveTo")}</span>
                    <DatePicker value={effectiveTo} onChange={setEffectiveTo} ariaLabel={t("audience.assign.effectiveTo")} className="w-44" />
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
                unavailableReason={currentHolderIds && !canExcludeByField ? unavailableReason : undefined}
              />
              <FieldError>{tried && willAffect === 0 ? t("audience.assign.pickSomeone") : null}</FieldError>

              {/*
                The checkbox widens the *search* in two directions, and the engine treats the two
                halves differently. `AssignmentRuleService` skips `!user.isActive()` — a leaver —
                unconditionally, and no flag reaches it. Somebody who has not started, draft or not,
                is not a leaver: assigning them a department or a calendar ahead of day one is the
                whole point, and `ResolvedUser.isActive` says so.
              */}
              {includeInactive && (
                <p className="flex items-start gap-2 rounded-control bg-subtle px-4 py-3 text-body text-primary">
                  <Icon icon={Alert02Icon} size="sm" className="mt-0.5 flex-none" />
                  {t("audience.assign.inactiveNote")}
                </p>
              )}

              {!live && manual.size > 0 && !overCap && renderSelectionWarning
                ? renderSelectionWarning([...manual])
                : null}

              {overCap && (
                <p className="flex items-start gap-2 rounded-control bg-status-pending-bg px-4 py-3 text-body text-status-pending-text">
                  <Icon icon={Alert02Icon} size="sm" className="mt-0.5 flex-none" />
                  {t("audience.assign.overCap", { count: manual.size, cap: MANUAL_CAP })}
                </p>
              )}

              <FormError message={errorMessage} />
            </div>
          )}
        </div>

        <DialogFooter>
          {done ? (
            <Button type="button" onClick={onCloseAction}>{tCommon("actions.done")}</Button>
          ) : step === "preview" ? (
            <>
              <Button type="button" variant="secondary" className="gap-1.5" onClick={() => setStep("pick")} disabled={busy}>
                <Icon icon={ArrowLeft02Icon} size="sm" />
                {tCommon("actions.back")}
              </Button>
              <Button type="button" onClick={handleApply} disabled={busy}>
                {busy
                  ? t("audience.assign.applying")
                  : live
                    ? t("audience.assign.createLiveRule")
                    : t("audience.assign.addPeople", { count: previewSummary?.willAssign ?? 0 })}
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="secondary" onClick={onCloseAction} disabled={busy}>
                {tCommon("actions.cancel")}
              </Button>
              <Button type="button" onClick={handlePreview} disabled={busy || (live && !assignableType)}>
                {busy ? t("audience.assign.checking") : t("audience.assign.reviewPeople", { count: willAffect })}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/** Said plainly, where the reader chooses it: a filter here is a promise about the future too. */
const LiveRuleNote: React.FC<{ temporal: boolean }> = ({ temporal }) => {
  const t = useTranslations("access");
  return (
  <div className="flex items-start gap-3 rounded-control bg-status-info-bg px-4 py-3 text-body text-status-info-text" data-test="live-rule-note">
    <Icon icon={RepeatIcon} size="sm" className="mt-0.5 flex-none" />
    <div>
      <p className="m-0 font-medium">{t("audience.assign.liveNote.title")}</p>
      <p className="m-0">
        {temporal ? t("audience.assign.liveNote.bodyTemporal") : t("audience.assign.liveNote.body")}
      </p>
    </div>
  </div>
  );
};

/** "N will be assigned, M skipped" — and why — before anything is written. */
const PreviewView: React.FC<{
  summary: PreviewSummary;
  live: boolean;
  kind: AssignTargetKind;
  errorMessage?: string;
  nobodyError: string | null;
}> = ({ summary, live, kind, errorMessage, nobodyError }) => {
  const t = useTranslations("access");
  const lines = skipCountLines(summary.skippedByReason, t);
  return (
    <div className="space-y-4 px-1 py-6" data-test="assignment-preview">
      <p className="m-0 text-body font-medium text-primary">
        {summary.skipped > 0
          ? t("audience.assign.preview.willAssignSkipped", { count: summary.willAssign, skipped: summary.skipped })
          : t("audience.assign.preview.willAssign", { count: summary.willAssign })}
      </p>
      <FieldError>{nobodyError}</FieldError>
      {lines.length > 0 && (
        <ul className="m-0 list-none space-y-1 rounded-control bg-subtle px-4 py-3 text-body text-primary">
          {lines.map((l) => <li key={l.reason}>{l.text}</li>)}
        </ul>
      )}
      {summary.conflicts > 0 && (
        <p className="m-0 rounded-control bg-status-pending-bg px-4 py-3 text-body text-status-pending-text">
          {t("audience.assign.preview.conflicts", { count: summary.conflicts, kind })}
        </p>
      )}
      {live ? (
        <p className="m-0 text-body text-tertiary">
          {t("audience.assign.preview.live")}
        </p>
      ) : (
        <p className="m-0 text-body text-tertiary">
          {t("audience.assign.preview.manual")}
        </p>
      )}
      <FormError message={errorMessage} />
    </div>
  );
};

const LiveResultView: React.FC<{ result: LiveAssignmentCreated; kind: AssignTargetKind }> = ({ result, kind }) => {
  const t = useTranslations("access");
  const lines = skipCountLines(result.skippedByReason, t);
  return (
    <div className="space-y-4 px-1 py-6">
      <div className="flex items-start gap-3">
        <Icon icon={Tick02Icon} className="mt-0.5 flex-none text-status-approved-icon" />
        <div>
          <p className="m-0 font-medium text-primary">
            {t("audience.assign.liveResult.created", { name: result.ruleName })}
          </p>
          <p className="m-0 mt-1 text-body text-tertiary">
            {result.willAssign > result.appliedNow
              ? t("audience.assign.liveResult.addedWithLater", {
                  count: result.appliedNow,
                  kind,
                  later: result.willAssign - result.appliedNow,
                })
              : t("audience.assign.liveResult.added", { count: result.appliedNow, kind })}
          </p>
        </div>
      </div>
      {lines.length > 0 && (
        <ul className="m-0 list-none space-y-1 rounded-control bg-subtle px-4 py-3 text-body text-primary">
          {lines.map((l) => <li key={l.reason}>{l.text}</li>)}
        </ul>
      )}
      <PermissionGate resource="SETTINGS.AUTOMATIONS" action="VIEW">
        <Link href={`/automations/${result.ruleId}`} className="text-body">
          {t("audience.assign.liveResult.openRule")}
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
const ResultView: React.FC<{ result: ResultLike; kind: AssignTargetKind }> = ({ result, kind }) => {
  const t = useTranslations("access");
  const { total, created, skipped, failed } = result.summary;
  const skippedDetail = result.skipped ? describeSkips(result.skipped, t) : null;

  return (
    <div className="space-y-4 px-1 py-6">
      <div className="flex items-start gap-3">
        {failed > 0 ? (
          <Icon icon={Alert02Icon} className="mt-0.5 flex-none text-status-pending-icon" />
        ) : (
          <Icon icon={Tick02Icon} className="mt-0.5 flex-none text-status-approved-icon" />
        )}
        <div>
          <p className="font-medium text-primary">
            {t("audience.assign.result.added", { created, total, kind })}
          </p>
          {created === 0 && (
            <p className="mt-1 text-body text-tertiary">{t("audience.assign.result.nothingChanged")}</p>
          )}
        </div>
      </div>

      {skipped > 0 && (
        <div className="rounded-control bg-subtle px-4 py-3 text-body text-primary">
          {skippedDetail ?? t("audience.assign.result.skipped", { count: skipped })}
        </div>
      )}

      {failed > 0 && (
        <div className="space-y-2 rounded-control bg-status-declined-bg px-4 py-3 text-body text-status-declined-text">
          <p className="font-medium">
            {t("audience.assign.result.failed", { count: failed })}
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
