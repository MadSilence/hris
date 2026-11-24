"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowExpand01Icon,
  ArrowShrink01Icon,
  Cancel01Icon,
  Delete02Icon,
  FlashIcon,
  MailSend01Icon,
  PlayIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { Avatar, AvatarFallback } from "@/components/desact/avatar";
import { InlineAlert } from "@/components/desact/alert";
import { Button } from "@/components/desact/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/desact/dialog";
import { Icon } from "@/components/desact/icon";
import { NodRing } from "@/components/desact/nod";
import { Skeleton } from "@/components/desact/skeleton";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { showError, showSuccess } from "@/lib/errors/errorToast";
import { explain } from "@/lib/feedback/explainToast";
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
import { initialsOf } from "./runWords";
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

  // F1–F2: the right window, where step settings open — 340, radius 16, a hairline and level 3; the header "Test run"
  // over "Nothing is sent or changed.", expand and × beside it.
  return (
    <section
      aria-label={t("test.title")}
      data-test="test-run-window"
      className="flex max-h-full min-h-0 w-[340px] flex-col overflow-hidden rounded-card border border-divider bg-card shadow-dialog"
    >
      <header className="flex shrink-0 items-start gap-0.5 border-b border-divider pt-4 pr-3 pb-3 pl-5">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h2 className="truncate text-card-title text-primary">{t("test.title")}</h2>
          <p className="text-label font-normal text-tertiary">{t("test.nothingSent")}</p>
        </div>
        <Button type="button" variant="ghost" size="icon-sm" onClick={() => onExpand(true)} aria-label={t("window.expand")}>
          <Icon icon={ArrowExpand01Icon} />
        </Button>
        <Button type="button" variant="ghost" size="icon-sm" onClick={onClose} aria-label={t("window.close")}>
          <Icon icon={Cancel01Icon} />
        </Button>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-4 pb-5">{body}</div>
    </section>
  );
};

/**
 * F1: while the test run is open, a small bar over the top left of the canvas, next to the tool block — "Test run ·
 * nothing is sent" and Close.
 */
export const TestRunBar: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const t = useTranslations("automationsRuns");
  return (
    <div role="status" className="flex items-center gap-3 rounded-popover border border-divider bg-card py-2.5 pr-3 pl-4 shadow-bar" data-test="test-run-bar">
      <Icon icon={PlayIcon} className="text-secondary" />
      <span className="whitespace-nowrap text-body text-primary">{t("test.bar")}</span>
      <Button type="button" variant="secondary" size="sm" onClick={onClose}>
        {t("test.close")}
      </Button>
    </div>
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
    // Pressed with no case to try it on, it says so rather than greying out (NEVER-DISABLED).
    if (!chosen) {
      explain(t("test.pickCase"));
      return;
    }
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

  // Nothing real in the last 30 days: the noun follows the trigger, and nothing more is said (the designers' Words).
  const process = definition.trigger?.process ?? null;
  const noneKind =
    family === "PROCESS_COMPLETED"
      ? process === "ANY_ONBOARDING"
        ? "onboarding"
        : process === "ANY_OFFBOARDING"
          ? "offboarding"
          : "process"
      : family
        ? "timeOff"
        : "person";
  const caseHint = cases.some((c) => c.example)
    ? t("test.hintNone", { kind: noneKind })
    : family === "PROCESS_COMPLETED"
      ? t("test.hintProcess")
      : family
        ? t("test.hintRequest")
        : t("test.hintPerson");

  // F3: the person's avatar, then "Name · dates".
  const options = cases.map((c) => ({
    value: c.id,
    label: c.startDate ? t("test.caseLabel", { label: c.label, dates: dates.range(c.startDate, c.endDate) }) : c.label,
    icon: (
      <Avatar className="size-6">
        <AvatarFallback name={c.person.name ?? c.label}>
          {initialsOf(c.person.name ?? c.label)}
        </AvatarFallback>
      </Avatar>
    ),
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
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
        <p className="rounded-control bg-mist p-3 text-label font-normal text-secondary">
          {approvals.length > 0 ? t("test.before") : t("test.beforeNoApproval")}
        </p>
      )}

      {/* F5: full width, no icon. */}
      <Button type="button" className="w-full" onClick={state.start} loading={state.run.isPending}>
        {state.run.isPending ? t("test.running") : t("test.run")}
      </Button>

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

      {/* F7: what was sent to the tester, and the way to take it back. */}
      {state.items > 0 && (
        <div className="flex items-center gap-2 rounded-control bg-mist py-2 pr-2 pl-3">
          <p className="min-w-0 flex-1 text-label font-normal text-secondary" title={t("test.itemsHint")}>
            {t("test.items", { count: state.items })}
          </p>
          <Button type="button" variant="secondary" size="sm" loading={state.deleting} onClick={() => void state.deleteItems()}>
            {!state.deleting && <Icon icon={Delete02Icon} size="sm" className="size-3.5" />}
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
  const happens = useWhatHappens();
  const numbered = numbers(definition);

  return (
    <section className="flex flex-col gap-1">
      <h3 className="text-label text-primary">{t("test.result")}</h3>
      <ol className="m-0 flex list-none flex-col p-0">
        <ResultLine
          badge={<Icon icon={FlashIcon} size="sm" className="size-3.5" />}
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
              title={happens(step) ?? (spec ? words.stepTitle(spec, definition) : step.title ?? tShared(`stepType.${step.actionType}`))}
              hint={hint(step)}
              muted={skipped}
              action={
                step.sendable && !skipped ? (
                  outcome === "NO_EMAIL" ? (
                    <p className="text-hint text-tertiary">{t("test.noEmail")}</p>
                  ) : outcome ? (
                    <span className="inline-flex h-6 items-center gap-1 text-hint text-status-approved-text">
                      <Icon icon={Tick02Icon} size="sm" className="size-3.5" />
                      {t("test.sent")}
                    </span>
                  ) : (
                    <Button
                      type="button"
                      variant="link"
                      loading={sending === step.stepId}
                      onClick={() => {
                        if (sending === null) onSend(step.stepId);
                      }}
                      className="h-6 gap-1 text-hint font-medium"
                    >
                      {sending !== step.stepId && <Icon icon={MailSend01Icon} size="sm" className="size-3.5" />}
                      {step.actionType === "SIGN_DOCUMENT" ? t("test.sendDocumentToMe") : t("test.sendToMe")}
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

/** F6: one row — the badge, what happens, the hint under it, and "Send it to me" under the lines. */
const ResultLine: React.FC<{
  badge: React.ReactNode;
  title: string;
  hint: string[];
  muted?: boolean;
  action?: React.ReactNode;
}> = ({ badge, title, hint, muted, action }) => (
  <li className="flex items-start gap-2.5 border-b border-divider py-2.5">
    <span
      className={cn(
        "inline-flex size-6 shrink-0 items-center justify-center rounded-tag text-hint font-semibold text-on-accent",
        muted ? "bg-strong" : "bg-tertiary",
      )}
    >
      {badge}
    </span>
    <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
      <p className={cn("text-body", muted ? "text-secondary" : "text-primary")}>{title}</p>
      {hint.map((line) => (
        <p key={line} className="text-hint text-tertiary">
          {line}
        </p>
      ))}
      {action}
    </div>
  </li>
);

/** Line 1 of a result (F6): what happens, said of the people it happens to — "Admin gets a notification". */
const useWhatHappens = () => {
  const t = useTranslations("automationsRuns");
  const locale = useDisplayLocale();
  const list = (names: string[]) => new Intl.ListFormat(locale, { type: "conjunction" }).format(names);
  return (step: TestRunStep): string | null => {
    const names = step.recipients.map((r) => r.name).filter((n): n is string => Boolean(n));
    // S9d: said of the step, not of the signers — they are its second line.
    if (step.outcome === "WOULD_SEND_FOR_SIGNATURE") return t("test.happens.SIGN_DOCUMENT");
    if (names.length === 0 || SKIPPED.has(step.outcome)) return null;
    const who = { names: list(names), count: names.length };
    switch (step.actionType) {
      case "NOTIFY":
        return step.outcome === "WOULD_SEND" ? t("test.happens.NOTIFY", who) : null;
      case "SEND_EMAIL":
        return step.outcome === "WOULD_SEND" ? t("test.happens.SEND_EMAIL", who) : null;
      case "CREATE_TASK":
        return step.outcome === "WOULD_CREATE" ? t("test.happens.CREATE_TASK", who) : null;
      case "START_REVIEW":
        return step.outcome === "WOULD_CREATE" ? t("test.happens.START_REVIEW", who) : null;
      case "REQUEST_APPROVAL":
        return t("test.happens.REQUEST_APPROVAL", who);
      default:
        return null;
    }
  };
};

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
        case "WOULD_SEND_FOR_SIGNATURE": {
          // S9d: "Employment contract — Lena Kowalska signs first, then Marta Nowak. 30 days to sign."
          const days = step.detail != null && step.detail !== "" ? Number(step.detail) : null;
          const document = step.title ?? "";
          const who =
            names.length === 0
              ? null
              : names.length === 1
                ? t("test.outcome.signsAlone", { name: names[0] })
                : t("test.outcome.signsFirst", { first: names[0], then: list(names.slice(1)) });
          const parts = [document, who].filter(Boolean).join(" — ");
          return days != null && Number.isFinite(days) ? t("test.outcome.toSign", { what: parts, days }) : parts || null;
        }
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
