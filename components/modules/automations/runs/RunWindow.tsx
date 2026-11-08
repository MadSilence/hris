"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  CancelCircleIcon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  HourglassIcon,
  MinusSignCircleIcon,
  RotateLeft01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/desact/button";
import { Icon, type IconSvgElement } from "@/components/desact/icon";
import { Skeleton } from "@/components/desact/skeleton";
import { EmptyState } from "@/components/feedback/EmptyState";
import { showError, showSuccess } from "@/lib/errors/errorToast";
import { showUndoToast } from "@/lib/feedback/undoToast";
import { useShortDates } from "@/lib/date";
import { cn } from "@/lib/cn";
import { useAutomationMutation, useAutomationRun } from "@/components/modules/automations/hooks";
import {
  cancelAutomationRunAction,
  reassignAutomationStepAction,
  restoreAutomationRunAction,
  retryAutomationRunAction,
  skipAutomationStepAction,
} from "@/components/modules/automations/actions/automationActions";
import { findStep, numbers } from "@/components/modules/automations/model/tree";
import type { RunWindowProps } from "@/components/modules/automations/contracts";
import type { AutomationDefinition, AutomationRun, AutomationRunStep, StepSpec } from "@/models/automations";
import { OwnerPicker } from "./OwnerPicker";
import { useRunWords, type RunWords } from "./runWords";
import { ToolWindow } from "./ToolWindow";
import { useAutomationWords } from "./seams";

export type StepState = "DONE" | "WAITING" | "FAILED" | "NOT_STARTED" | "SKIPPED";

/** A run step's state as the window draws it. Steps on a path the run did not take are not drawn at all. */
export const stepState = (step: AutomationRunStep): StepState | null => {
  if (step.status === "SKIPPED" && step.reason?.startsWith("NOT_THIS_PATH")) return null;
  switch (step.status) {
    case "DONE":
      return "DONE";
    case "WAITING":
      return "WAITING";
    case "FAILED":
      return "FAILED";
    case "SKIPPED":
      return "SKIPPED";
    default:
      return "NOT_STARTED";
  }
};

/** Steps a person can mend in place when they fail: the ones that give somebody work. */
const OWNED: ReadonlySet<string> = new Set(["CREATE_TASK", "START_REVIEW"]);

const STATE_ICONS: Record<StepState, { icon: IconSvgElement; className: string }> = {
  DONE: { icon: CheckmarkCircle02Icon, className: "text-status-approved-icon" },
  WAITING: { icon: HourglassIcon, className: "text-status-pending-icon" },
  FAILED: { icon: CancelCircleIcon, className: "text-status-declined-icon" },
  NOT_STARTED: { icon: Clock01Icon, className: "text-tertiary" },
  SKIPPED: { icon: MinusSignCircleIcon, className: "text-tertiary" },
};

const str = (value: unknown): string | null => (typeof value === "string" && value.trim() ? value : null);

/** One run's window (V1, V1b, G2): the steps in run order, a failed step's fixes, the run's own actions. */
export const RunWindow: React.FC<RunWindowProps> = ({ runId, definition, canManage, onRun, onClose }) => {
  const t = useTranslations("automationsRuns");
  const tCommon = useTranslations("common");
  const words = useRunWords();
  const run = useAutomationRun(runId);

  const skip = useAutomationMutation(skipAutomationStepAction);
  const reassign = useAutomationMutation(reassignAutomationStepAction);
  const retry = useAutomationMutation(retryAutomationRunAction);
  const cancel = useAutomationMutation(cancelAutomationRunAction);
  const restore = useAutomationMutation(restoreAutomationRunAction);

  const onRunRef = React.useRef(onRun);
  onRunRef.current = onRun;
  React.useEffect(() => {
    onRunRef.current?.(run.data ?? null);
  }, [run.data]);
  React.useEffect(() => () => onRunRef.current?.(null), [runId]);

  const data = run.data;

  if (run.isLoading) {
    return (
      <ToolWindow title={<Skeleton className="h-5 w-40" />} width={340} onClose={onClose}>
        <div className="flex flex-col gap-3 px-4 pb-4" aria-hidden>
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <Skeleton className="size-4 rounded-pill" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-3 w-14" />
            </div>
          ))}
        </div>
      </ToolWindow>
    );
  }

  if (run.error || !data) {
    return (
      <ToolWindow title={t("history.title")} width={340} onClose={onClose}>
        <EmptyState
          compact
          scene="something-broke"
          title={t("run.errorTitle")}
          description={t("history.errorDescription")}
          action={
            <Button type="button" variant="secondary" size="sm" onClick={() => void run.refetch()}>
              {tCommon("actions.retry")}
            </Button>
          }
        />
      </ToolWindow>
    );
  }

  const act = async (work: () => Promise<unknown>, done: string) => {
    try {
      await work();
      showSuccess(done);
    } catch (error) {
      showError(error);
    }
  };

  const onCancel = async () => {
    const wasScheduled = data.status === "SCHEDULED";
    try {
      await cancel.mutateAsync(data.id);
    } catch (error) {
      showError(error);
      return;
    }
    if (wasScheduled) {
      showUndoToast({ message: t("run.cancelled"), onUndo: () => restore.mutateAsync(data.id) });
    } else {
      showSuccess(t("run.cancelled"));
    }
  };

  const busy = skip.isPending || reassign.isPending || retry.isPending || cancel.isPending;

  return (
    <ToolWindow
      eyebrow={t("run.header", { when: words.moment(data.createdAt, true), version: data.versionNo })}
      title={<span title={words.title(data)}>{words.title(data)}</span>}
      width={340}
      onClose={onClose}
    >
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        <RunSteps
          run={data}
          definition={definition}
          canManage={canManage}
          busy={busy}
          onSkip={(step) => void act(() => skip.mutateAsync({ runId: data.id, stepId: step.id }), t("run.stepSkipped"))}
          onReassign={(step, userId) =>
            void act(() => reassign.mutateAsync({ runId: data.id, stepId: step.id, userId }), t("run.ownerChosen"))
          }
        />
        {canManage && data.status === "FAILED" && (
          <div className="mt-4 flex flex-col items-start gap-2 border-t border-divider pt-4">
            <p className="text-body text-secondary">{t("run.retryHint")}</p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              loading={retry.isPending}
              disabled={busy}
              onClick={() => void act(() => retry.mutateAsync(data.id), t("run.retried"))}
            >
              <Icon icon={RotateLeft01Icon} size="sm" />
              {t("run.retry")}
            </Button>
          </div>
        )}
        {canManage && (data.status === "WAITING" || data.status === "SCHEDULED") && (
          <div className="mt-4 border-t border-divider pt-4">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              loading={cancel.isPending}
              disabled={busy}
              onClick={() => void onCancel()}
            >
              {t("run.cancel")}
            </Button>
          </div>
        )}
      </div>
    </ToolWindow>
  );
};

type RunStepsProps = {
  run: AutomationRun;
  definition: AutomationDefinition | null;
  canManage: boolean;
  busy: boolean;
  onSkip: (step: AutomationRunStep) => void;
  onReassign: (step: AutomationRunStep, userId: string) => void;
};

/** The run's steps (RunStepList): the trigger first, then each step in run order. */
const RunSteps: React.FC<RunStepsProps> = ({ run, definition, canManage, busy, onSkip, onReassign }) => {
  const t = useTranslations("automationsRuns");
  const tShared = useTranslations("automations");
  const words = useRunWords();
  const automationWords = useAutomationWords();
  const dates = useShortDates();
  const numbered = React.useMemo(() => numbers(definition), [definition]);

  const steps = [...(run.steps ?? [])].sort((a, b) => a.position - b.position);
  let blocked = false;

  const triggerTitle = definition?.trigger ? automationWords.triggerTitle(definition.trigger) : words.about(run);

  return (
    <ol className="m-0 flex list-none flex-col gap-3 p-0">
      <StepLine state="DONE" title={triggerTitle} time={words.moment(run.createdAt)} />
      {steps.map((step) => {
        const state = stepState(step);
        if (!state) return null;
        const spec = findStep(definition, step.stepId);
        const number = numbered[step.stepId];
        const title = spec ? automationWords.stepTitle(spec) : tShared(`stepType.${step.actionType}`);

        let time: string;
        if (state === "WAITING") {
          time = t("run.since", { date: dates.date(step.runAt ?? step.effectiveDate) });
        } else if (state === "NOT_STARTED") {
          const day = step.effectiveDate ?? step.plannedDate;
          time = blocked || !day ? t("run.afterThat") : dates.date(day);
        } else {
          time = words.moment(step.finishedAt ?? step.runAt);
        }
        if (state === "WAITING" || state === "FAILED" || state === "NOT_STARTED") blocked = true;

        const reason =
          state === "WAITING" ? (
            <WaitingReason step={step} spec={spec} words={words} />
          ) : state === "FAILED" || state === "SKIPPED" ? (
            words.reason(step.reason)
          ) : null;

        return (
          <StepLine
            key={step.id}
            state={state}
            number={number}
            title={title}
            time={time}
            reason={reason}
            actions={
              canManage && state === "FAILED" ? (
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="secondary" size="sm" disabled={busy} onClick={() => onSkip(step)}>
                    {t("run.skipStep")}
                  </Button>
                  {OWNED.has(step.actionType) && (
                    <OwnerPicker busy={busy} onPick={(userId) => onReassign(step, userId)} />
                  )}
                </div>
              ) : null
            }
          />
        );
      })}
    </ol>
  );
};

const StepLine: React.FC<{
  state: StepState;
  number?: string;
  title: string;
  time: string;
  reason?: React.ReactNode;
  actions?: React.ReactNode;
}> = ({ state, number, title, time, reason, actions }) => {
  const t = useTranslations("automationsRuns");
  const icon = STATE_ICONS[state];
  return (
    <li className="flex items-start gap-2.5" data-state={state}>
      <Icon icon={icon.icon} size="sm" label={t(`run.status.${state}`)} className={cn("mt-0.5 shrink-0", icon.className)} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start gap-2">
          <p className={cn("min-w-0 flex-1 text-body", state === "NOT_STARTED" ? "text-secondary" : "text-primary")}>
            {number && <span className="mr-1.5 text-hint font-semibold text-tertiary">{number}</span>}
            {title}
          </p>
          {time && <span className="shrink-0 text-hint text-tertiary">{time}</span>}
        </div>
        {reason && <p className="text-hint text-tertiary">{reason}</p>}
        {actions}
      </div>
    </li>
  );
};

/** "Waiting for Marta. Asks her manager on 6 Nov." — from the step's result. */
const WaitingReason: React.FC<{ step: AutomationRunStep; spec: StepSpec | null; words: RunWords }> = ({
  step,
  spec,
  words,
}) => {
  const t = useTranslations("automationsRuns");
  const dates = useShortDates();
  const result = step.result ?? {};
  const until = str(result.until);
  const deadline = str(result.waitingUntil);
  const escalated = result.escalated === true;

  let first: string;
  let second: string | null = null;
  if (until === "APPROVAL") {
    const name = str(result.approverName);
    first = name ? t("run.waitingFor", { name }) : t("run.waitingForAnswer");
    if (deadline) {
      const date = dates.date(deadline);
      const noAnswer = spec?.ifNoAnswer ?? null;
      second =
        noAnswer === "ASK_THEIR_MANAGER" && !escalated
          ? t("run.asksManagerOn", { date })
          : noAnswer === "DECLINE"
            ? t("run.declinesOn", { date })
            : t("run.stopsOn", { date });
    }
  } else if (until === "TASK_DONE" || until === "FIELD_FILLED") {
    first = until === "TASK_DONE" ? t("run.waitingTask") : t("run.waitingField");
    if (deadline) second = t("run.givesUpOn", { date: dates.date(deadline) });
  } else if (until === "TIME" && step.runAt) {
    // A step held for its time of day (K3). It read "Waiting for an answer." (walk of 2026-11-07).
    first = t("run.waitingTime", { time: words.time(step.runAt), date: dates.date(step.runAt) });
  } else if (until === "PATH") {
    first = t("run.waitingPath");
  } else {
    first = words.reason(step.reason) ?? t("run.waitingForAnswer");
  }
  return (
    <>
      {first}
      {second && <> {second}</>}
    </>
  );
};
