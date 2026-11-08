"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowExpand01Icon,
  ArrowShrink01Icon,
  Cancel01Icon,
  FlashIcon,
  PlayIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { InlineAlert } from "@/components/desact/alert";
import { Button } from "@/components/desact/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/desact/dialog";
import { Icon } from "@/components/desact/icon";
import { NodRing } from "@/components/desact/nod";
import { Skeleton } from "@/components/desact/skeleton";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { showError, showSuccess } from "@/lib/errors/errorToast";
import { useDisplayLocale, useShortDates } from "@/lib/date";
import { cn } from "@/lib/cn";
import { unwrapAction } from "@/components/modules/automations/hooks";
import {
  automationTestCasesAction,
  automationTestRunAction,
  automationTestSendAction,
  deleteAutomationTestItemsAction,
} from "@/components/modules/automations/actions/automationActions";
import { allSteps, APPROVED, branchList, DECLINED, findStep, numbers } from "@/components/modules/automations/model/tree";
import type { TestRunWindowProps } from "@/components/modules/automations/contracts";
import type {
  ApprovalPick,
  AutomationDefinition,
  StepSpec,
  TestCase,
  TestRun,
  TestRunRequest,
  TestRunStep,
  TestSendRequest,
  TestSent,
} from "@/models/automations";
import { ToolWindow } from "./ToolWindow";
import { SegmentedControl, useAutomationWords } from "./seams";

const PICKS: ApprovalPick[] = ["APPROVES", "DECLINES", "NO_ANSWER"];

/** The approval steps of a definition, each asked about once (G1: "one question per approval"). */
export const approvalSteps = (definition: AutomationDefinition): StepSpec[] =>
  allSteps(definition).filter((step) => step.type === "REQUEST_APPROVAL");

/** The decisions sent with a test run: every approval's pick, Approves where nothing was picked. */
export const decisionsFor = (
  definition: AutomationDefinition,
  picked: Record<string, ApprovalPick>,
): Record<string, ApprovalPick> =>
  Object.fromEntries(approvalSteps(definition).map((step) => [step.id, picked[step.id] ?? "APPROVES"]));

/** A path's name by its key, among the definition's splits; null for the approval's two paths and an unnamed one. */
const pathName = (definition: AutomationDefinition, key: string | null): string | null => {
  if (!key) return null;
  for (const step of allSteps(definition)) {
    if (step.type !== "SPLIT") continue;
    const branch = branchList(step).find((b) => b.key === key);
    if (branch) return branch.name?.trim() || null;
  }
  return null;
};

const SKIPPED = new Set(["SKIPPED_PATH", "SKIPPED_CONDITION", "SKIPPED_FOR_NOW", "NOT_CONNECTED"]);

/** The test run (G1a, G1, G1b) as a tool window 400, and as an 800 dialog when expanded (G1m). */
export const TestRunWindow: React.FC<TestRunWindowProps> = ({
  automationId,
  name,
  definition,
  expanded,
  onExpand,
  onClose,
}) => {
  const t = useTranslations("automationsRuns");
  const state = useTestRun(automationId, definition);

  const body = <TestRunBody definition={definition} state={state} />;

  if (expanded) {
    return (
      <Dialog open onOpenChange={(open) => !open && onClose()}>
        <DialogContent size="lg" hideClose className="max-h-[calc(100vh-4rem)] grid-rows-[auto_minmax(0,1fr)] gap-4">
          <div className="flex items-start gap-2">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <DialogTitle className="truncate">{t("test.dialogTitle", { name })}</DialogTitle>
              <DialogDescription className="text-hint text-tertiary">{t("test.nothingSent")}</DialogDescription>
            </div>
            <Button type="button" variant="ghost" size="icon-sm" onClick={() => onExpand(false)} aria-label={t("window.shrink")}>
              <Icon icon={ArrowShrink01Icon} size="sm" />
            </Button>
            <Button type="button" variant="ghost" size="icon-sm" onClick={onClose} aria-label={t("window.close")}>
              <Icon icon={Cancel01Icon} size="sm" />
            </Button>
          </div>
          <div className="min-h-0 overflow-y-auto">{body}</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <ToolWindow
      title={t("test.title")}
      width={400}
      onClose={onClose}
      actions={
        <Button type="button" variant="ghost" size="icon-sm" onClick={() => onExpand(true)} aria-label={t("window.expand")}>
          <Icon icon={ArrowExpand01Icon} size="sm" />
        </Button>
      }
    >
      <p className="-mt-1 px-4 pb-2 text-hint text-tertiary">{t("test.nothingSent")}</p>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">{body}</div>
    </ToolWindow>
  );
};

type TestRunState = ReturnType<typeof useTestRun>;

/** The test's state, kept above the window and the dialog so expanding keeps what was picked and run. */
const useTestRun = (automationId: string | null, definition: AutomationDefinition) => {
  const t = useTranslations("automationsRuns");
  const cases = useQuery<TestCase[]>({
    queryKey: ["AUTOMATIONS", "TEST_CASES", automationId, definition.trigger, definition.conditions],
    queryFn: async () => unwrapAction(await automationTestCasesAction(definition)),
  });
  const [caseId, setCaseId] = React.useState<string | null>(null);
  const [picked, setPicked] = React.useState<Record<string, ApprovalPick>>({});
  const [sent, setSent] = React.useState<Record<string, TestSent["outcome"]>>({});
  const [items, setItems] = React.useState<number | null>(null);
  const [sending, setSending] = React.useState<string | null>(null);

  const chosen = caseId && cases.data?.some((c) => c.id === caseId) ? caseId : cases.data?.[0]?.id ?? null;

  const run = useMutation<TestRun, Error, TestRunRequest>({
    mutationFn: async (request) => unwrapAction(await automationTestRunAction(request)),
    onSuccess: (result) => {
      setSent({});
      setItems(result.testItems);
    },
  });
  const send = useMutation<TestSent, Error, TestSendRequest>({
    mutationFn: async (request) => unwrapAction(await automationTestSendAction(request)),
  });
  const remove = useMutation<{ deleted: number }, Error, string | null>({
    mutationFn: async (id) => unwrapAction(await deleteAutomationTestItemsAction(id)),
  });

  const start = () => {
    if (!chosen) return;
    run.mutate({ automationId, definition, caseId: chosen, decisions: decisionsFor(definition, picked) });
  };

  const sendToMe = async (stepId: string) => {
    if (!chosen) return;
    setSending(stepId);
    try {
      const result = await send.mutateAsync({ automationId, definition, caseId: chosen, stepId });
      setSent((before) => ({ ...before, [stepId]: result.outcome }));
      setItems(result.testItems);
    } catch (error) {
      showError(error);
    } finally {
      setSending(null);
    }
  };

  const deleteItems = async () => {
    try {
      await remove.mutateAsync(automationId);
      setItems(0);
      setSent({});
      showSuccess(t("test.itemsDeleted"));
    } catch (error) {
      showError(error);
    }
  };

  return {
    cases,
    chosen,
    setCaseId,
    picked,
    pick: (stepId: string, value: ApprovalPick) => setPicked((before) => ({ ...before, [stepId]: value })),
    run,
    start,
    sent,
    sending,
    sendToMe,
    items: items ?? run.data?.testItems ?? 0,
    deleting: remove.isPending,
    deleteItems,
  };
};

const TestRunBody: React.FC<{ definition: AutomationDefinition; state: TestRunState }> = ({ definition, state }) => {
  const t = useTranslations("automationsRuns");
  const tCommon = useTranslations("common");
  const dates = useShortDates();
  const approvals = approvalSteps(definition);
  const numbered = numbers(definition);
  const cases = state.cases.data ?? [];
  const chosenCase = cases.find((c) => c.id === state.chosen) ?? null;
  const family = definition.trigger?.type === "EVENT" ? definition.trigger.event ?? null : null;

  const caseHint = cases.some((c) => c.example)
    ? t("test.hintExample")
    : family === "PROCESS_COMPLETED"
      ? t("test.hintProcess")
      : family
        ? t("test.hintRequest")
        : t("test.hintPerson");

  const options = cases.map((c) => ({
    value: c.id,
    label: c.startDate ? t("test.caseLabel", { label: c.label, dates: dates.range(c.startDate, c.endDate) }) : c.label,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <p className="text-label text-primary">{t("test.tryItOn")}</p>
        {state.cases.isLoading ? (
          <div className="flex h-9 items-center rounded-control border border-field px-3">
            <NodRing size="sm" />
          </div>
        ) : state.cases.error ? (
          <InlineAlert
            tone="declined"
            action={
              <Button type="button" variant="secondary" size="sm" onClick={() => void state.cases.refetch()}>
                {tCommon("actions.retry")}
              </Button>
            }
          >
            {t("test.casesError")}
          </InlineAlert>
        ) : (
          <>
            <SearchableSelect
              aria-label={t("test.tryItOn")}
              options={options}
              value={state.chosen}
              onChange={(value) => value && state.setCaseId(value)}
              placeholder={t("test.pickCase")}
              emptyLabel={t("test.noCaseMatch")}
              clearable={false}
              className="w-full"
            />
            <p className="text-hint text-tertiary">{caseHint}</p>
          </>
        )}
      </div>

      {approvals.map((step) => {
        const manager = !step.assignee || step.assignee.kind === "MANAGER";
        const label =
          approvals.length > 1
            ? manager
              ? t("test.questionNumbered", { number: numbered[step.id] ?? "" })
              : t("test.questionApproverNumbered", { number: numbered[step.id] ?? "" })
            : manager
              ? t("test.question")
              : t("test.questionApprover");
        return (
          <div key={step.id} className="flex flex-col gap-1.5">
            <p className="text-label text-primary">{label}</p>
            <SegmentedControl<ApprovalPick>
              aria-label={label}
              value={state.picked[step.id] ?? "APPROVES"}
              onChange={(value) => state.pick(step.id, value)}
              options={PICKS.map((pick) => ({ value: pick, label: t(`test.pick.${pick}`) }))}
            />
          </div>
        );
      })}

      {!state.run.data && !state.run.isPending && !state.run.error && (
        <p className="text-body text-secondary">{approvals.length > 0 ? t("test.before") : t("test.beforeNoApproval")}</p>
      )}

      <div>
        <Button
          type="button"
          onClick={state.start}
          disabled={!state.chosen || state.run.isPending}
          loading={state.run.isPending}
        >
          {state.run.isPending ? (
            t("test.running")
          ) : (
            <>
              <Icon icon={PlayIcon} size="sm" />
              {t("test.run")}
            </>
          )}
        </Button>
      </div>

      {state.run.error && !state.run.isPending && (
        <InlineAlert
          tone="declined"
          action={
            <Button type="button" variant="secondary" size="sm" onClick={state.start}>
              {tCommon("actions.retry")}
            </Button>
          }
        >
          {t("test.error")}
        </InlineAlert>
      )}

      {state.run.isPending && (
        <div className="flex flex-col gap-3" aria-hidden>
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <Skeleton className="size-5 rounded-tag" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {state.run.data && !state.run.isPending && (
        <TestRunResult
          definition={definition}
          result={state.run.data}
          caseLabel={chosenCase?.label ?? state.run.data.triggerLine}
          sent={state.sent}
          sending={state.sending}
          onSend={(stepId) => void state.sendToMe(stepId)}
        />
      )}

      {state.items > 0 && (
        <div className="flex flex-col items-start gap-2 rounded-popover bg-mist p-3">
          <p className="text-body font-medium text-primary">{t("test.items", { count: state.items })}</p>
          <p className="text-hint text-secondary">{t("test.itemsHint")}</p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            loading={state.deleting}
            disabled={state.deleting}
            onClick={() => void state.deleteItems()}
          >
            {t("test.deleteItems")}
          </Button>
        </div>
      )}
    </div>
  );
};

/** What would happen (TestRunResult): the trigger, then each step with its badge, title and hint. */
const TestRunResult: React.FC<{
  definition: AutomationDefinition;
  result: TestRun;
  caseLabel: string;
  sent: Record<string, TestSent["outcome"]>;
  sending: string | null;
  onSend: (stepId: string) => void;
}> = ({ definition, result, caseLabel, sent, sending, onSend }) => {
  const t = useTranslations("automationsRuns");
  const tShared = useTranslations("automations");
  const words = useAutomationWords();
  const hint = useOutcomeHint(definition);
  const numbered = numbers(definition);

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-label text-primary">{t("test.result")}</h3>
      <ol className="m-0 flex list-none flex-col gap-3 p-0">
        <ResultLine
          badge={<Icon icon={FlashIcon} size="sm" className="size-3" />}
          title={result.triggerLine || caseLabel}
          hint={definition.trigger ? [t("test.startsIt", { trigger: words.triggerTitle(definition.trigger) })] : []}
        />
        {result.steps.map((step) => {
          const spec = findStep(definition, step.stepId);
          const skipped = SKIPPED.has(step.outcome);
          const outcome = sent[step.stepId];
          return (
            <ResultLine
              key={step.stepId}
              badge={numbered[step.stepId] ?? ""}
              title={spec ? words.stepTitle(spec) : step.title ?? tShared(`stepType.${step.actionType}`)}
              hint={hint(step)}
              muted={skipped}
              action={
                step.sendable && !skipped ? (
                  outcome === "NO_EMAIL" ? (
                    <p className="text-hint text-tertiary">{t("test.noEmail")}</p>
                  ) : outcome ? (
                    <span className="inline-flex items-center gap-1 text-hint font-medium text-status-approved-text">
                      <Icon icon={Tick02Icon} size="sm" />
                      {t("test.sent")}
                    </span>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      loading={sending === step.stepId}
                      disabled={sending !== null}
                      onClick={() => onSend(step.stepId)}
                    >
                      {t("test.sendToMe")}
                    </Button>
                  )
                ) : null
              }
            />
          );
        })}
      </ol>
    </section>
  );
};

const ResultLine: React.FC<{
  badge: React.ReactNode;
  title: string;
  hint: string[];
  muted?: boolean;
  action?: React.ReactNode;
}> = ({ badge, title, hint, muted, action }) => (
  <li className="flex items-start gap-2.5">
    <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-tag bg-tertiary text-hint font-semibold text-on-accent">
      {badge}
    </span>
    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
      <p className={cn("text-body font-medium", muted ? "text-secondary" : "text-primary")}>{title}</p>
      {hint.map((line) => (
        <p key={line} className="text-hint text-tertiary">
          {line}
        </p>
      ))}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </li>
);

/** A step's hint by its outcome: "Would go to …", "Would be created: …, due …", "Skipped: only when declined". */
const useOutcomeHint = (definition: AutomationDefinition) => {
  const t = useTranslations("automationsRuns");
  const tShared = useTranslations("automations");
  const dates = useShortDates();
  const locale = useDisplayLocale();
  const list = (names: string[]) => new Intl.ListFormat(locale, { type: "conjunction" }).format(names);

  return (step: TestRunStep): string[] => {
    const names = step.recipients.map((r) => r.name).filter((n): n is string => Boolean(n));
    const main = ((): string | null => {
      switch (step.outcome) {
        case "WOULD_SEND":
          return names.length > 0 ? t("test.outcome.wouldSendTo", { names: list(names) }) : t("test.outcome.wouldSend");
        case "WOULD_CREATE":
          if (step.title && step.detail) return t("test.outcome.wouldCreateDue", { title: step.title, date: dates.date(step.detail) });
          if (step.title) return t("test.outcome.wouldCreate", { title: step.title });
          return names.length > 0 ? t("test.outcome.wouldCreateFor", { names: list(names) }) : t("test.outcome.wouldCreateBare");
        case "WOULD_ASSIGN":
          if (!step.title) return t("test.outcome.wouldAssignBare");
          return step.actionType === "UNASSIGN"
            ? t("test.outcome.wouldUnassign", { target: step.title })
            : step.actionType === "GRANT_TIME_OFF_POLICY"
              ? t("test.outcome.wouldGrant", { target: step.title })
              : t("test.outcome.wouldAssign", { target: step.title });
        case "WOULD_WAIT":
          return t("test.outcome.wouldWait");
        case "DECIDED":
          return t("test.outcome.decided", { pick: step.title ?? "APPROVES" });
        case "PATH": {
          const name = step.pathName?.trim() || pathName(definition, step.path);
          return name ? t("test.outcome.path", { name }) : t("test.outcome.pathOther");
        }
        case "SKIPPED_PATH": {
          if (step.path === APPROVED) return t("test.outcome.skippedApproved");
          if (step.path === DECLINED) return t("test.outcome.skippedDeclined");
          const name = pathName(definition, step.path);
          return name ? t("test.outcome.skippedPath", { name }) : t("test.outcome.skippedOtherPath");
        }
        case "SKIPPED_CONDITION":
          return t("test.outcome.skippedCondition");
        case "SKIPPED_FOR_NOW":
          return t("test.outcome.skippedForNow");
        case "NOT_CONNECTED":
          return t("test.outcome.notConnected");
        case "NO_RECIPIENT":
          return t("test.outcome.noRecipient");
        case "MISSING_DETAILS":
          return t("test.outcome.missingDetails");
        default:
          return null;
      }
    })();
    if (step.missingPlaceholders.length === 0) return main ? [main] : [];
    const fields = list(
      step.missingPlaceholders.map((p) => {
        const key = p as keyof typeof PLACEHOLDER_KEYS;
        return key in PLACEHOLDER_KEYS ? tShared(`placeholder.${key}`) : p;
      }),
    );
    const missing = t("test.outcome.missingPlaceholders", { fields });
    return main ? [main, missing] : [missing];
  };
};

/** The placeholders the shared catalogue names. */
const PLACEHOLDER_KEYS = {
  firstName: true,
  lastName: true,
  fullName: true,
  startDate: true,
  lastWorkingDay: true,
  managerName: true,
  companyName: true,
  jobTitle: true,
  office: true,
  department: true,
  leaveType: true,
  leaveStart: true,
  leaveEnd: true,
  leaveDays: true,
  processName: true,
  processType: true,
} as const;
