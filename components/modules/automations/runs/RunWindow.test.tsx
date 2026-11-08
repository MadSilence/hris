import * as React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import type { AutomationDefinition, AutomationRun, AutomationRunStep, StepSpec } from "@/models/automations";
import { partialMock } from "@/test/types";
import { ActionStatus } from "@/components/models/ActionStatus";
import * as actions from "@/components/modules/automations/actions/automationActions";
import { showSuccess } from "@/lib/errors/errorToast";
import { showUndoToast } from "@/lib/feedback/undoToast";
import { RunWindow } from "./RunWindow";

jest.mock("@/components/modules/automations/actions/automationActions", () => ({
  skipAutomationStepAction: jest.fn(),
  reassignAutomationStepAction: jest.fn(),
  retryAutomationRunAction: jest.fn(),
  cancelAutomationRunAction: jest.fn(),
  restoreAutomationRunAction: jest.fn(),
}));

let current: AutomationRun | null = null;
jest.mock("@/components/modules/automations/hooks", () => ({
  useAutomationRun: () => ({ data: current, isLoading: false, error: null, refetch: () => undefined }),
  useAutomationMutation:
    <TInput,>(action: (input: TInput) => Promise<{ status: string; data?: unknown }>) => ({
      isPending: false,
      mutateAsync: async (input: TInput) => (await action(input)).data,
    }),
}));

jest.mock("@/lib/errors/errorToast", () => ({ showSuccess: jest.fn(), showError: jest.fn() }));
jest.mock("@/lib/feedback/undoToast", () => ({ showUndoToast: jest.fn() }));

jest.mock("./seams", () => ({
  useAutomationWords: () => ({
    triggerTitle: () => "Time off over 10 days is requested",
    stepTitle: (step: { id: string }) => `Step ${step.id}`,
  }),
}));

jest.mock("@/components/audience/hooks/useSegmentResolve", () => ({
  useSegmentResolve: () => ({
    items: [{ id: "u-9", firstName: "Jonas", lastName: "Petrauskas", email: null }],
    isLoading: false,
    hasNextPage: false,
    isFetchingNextPage: false,
    fetchNextPage: () => Promise.resolve(),
  }),
}));

const ok = { status: ActionStatus.SUCCESS, data: null };

const task = (id: string): StepSpec => ({ id, type: "CREATE_TASK", title: "Plan cover" });
const definition: AutomationDefinition = {
  trigger: { type: "EVENT", event: "TIME_OFF_REQUESTED" },
  conditions: { filters: [], excludeUserIds: [] },
  steps: [{ id: "s1", type: "NOTIFY" }, task("s2"), { id: "s3", type: "SEND_EMAIL" }],
};

const step = (stepId: string, status: AutomationRunStep["status"], extra: Partial<AutomationRunStep> = {}): AutomationRunStep => ({
  id: `row-${stepId}`,
  stepId,
  position: Number(stepId.slice(1)),
  path: "",
  actionType: stepId === "s2" ? "CREATE_TASK" : "NOTIFY",
  plannedDate: null,
  effectiveDate: null,
  runAt: null,
  status,
  reason: null,
  ranLate: false,
  result: {},
  finishedAt: null,
  ...extra,
});

const runOf = (status: AutomationRun["status"], steps: AutomationRunStep[]): AutomationRun =>
  partialMock<AutomationRun>({
    id: "run-1",
    ruleId: "rule-1",
    versionNo: 4,
    person: { id: "p", name: "Ieva Petraitė", avatarUrl: null, jobTitle: null, office: null },
    triggerType: "EVENT",
    about: { kind: "TIME_OFF", leaveType: "Vacation" },
    status,
    ranLate: false,
    daysLate: 0,
    createdAt: "2026-11-03T09:14:00",
    steps,
  });

const show = (run: AutomationRun, canManage = true) => {
  current = run;
  return render(<RunWindow runId="run-1" definition={definition} canManage={canManage} onClose={() => undefined} />);
};

beforeEach(() => {
  for (const fn of Object.values(actions)) if (jest.isMockFunction(fn)) fn.mockResolvedValue(ok);
});

describe("the run window", () => {
  it("offers a failed task step its two fixes, and the run a retry", async () => {
    show(runOf("FAILED", [step("s1", "DONE"), step("s2", "FAILED", { reason: "NO_ASSIGNEE: Marta left" }), step("s3", "SCHEDULED")]));

    expect(screen.getByText("Ieva Petraitė, Vacation")).toBeInTheDocument();
    expect(screen.getByText("We couldn't create the task: there is nobody to give it to.")).toBeInTheDocument();
    expect(screen.getByText("after that")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Cancel this run" })).not.toBeInTheDocument();

    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Skip this step" })));
    expect(actions.skipAutomationStepAction).toHaveBeenCalledWith({ runId: "run-1", stepId: "row-s2" });
    expect(showSuccess).toHaveBeenCalledWith("Step skipped");

    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Retry the run" })));
    expect(actions.retryAutomationRunAction).toHaveBeenCalledWith("run-1");
    expect(showSuccess).toHaveBeenCalledWith("Run retried");
  });

  it("gives a failed task step to the person picked", async () => {
    show(runOf("FAILED", [step("s2", "FAILED", { reason: "NO_ASSIGNEE" })]));
    fireEvent.click(screen.getByRole("button", { name: "Choose an owner" }));
    await act(async () => fireEvent.click(await screen.findByRole("button", { name: /Jonas Petrauskas/ })));
    expect(actions.reassignAutomationStepAction).toHaveBeenCalledWith({ runId: "run-1", stepId: "row-s2", userId: "u-9" });
    expect(showSuccess).toHaveBeenCalledWith("Owner chosen. The step runs again.");
  });

  it("offers only Skip on a failed step that gives nobody work", () => {
    show(runOf("FAILED", [step("s1", "FAILED", { reason: "MISSING_PLACEHOLDER" })]));
    expect(screen.getByRole("button", { name: "Skip this step" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Choose an owner" })).not.toBeInTheDocument();
  });

  it("says who a waiting step waits for, and lets a waiting run be cancelled without an Undo", async () => {
    show(
      runOf("WAITING", [
        step("s1", "WAITING", {
          runAt: "2026-11-03T09:14:00",
          result: { until: "APPROVAL", approverName: "Marta", waitingUntil: "2026-11-06" },
        }),
      ]),
    );
    expect(screen.getByText(/Waiting for Marta\./)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Retry the run" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Skip this step" })).not.toBeInTheDocument();

    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Cancel this run" })));
    expect(actions.cancelAutomationRunAction).toHaveBeenCalledWith("run-1");
    expect(showSuccess).toHaveBeenCalledWith("Run cancelled");
    expect(showUndoToast).not.toHaveBeenCalled();
  });

  it("says when a step held for its time of day runs, not that it waits for an answer (walk of 2026-11-07)", () => {
    show(runOf("WAITING", [step("s1", "WAITING", { runAt: "2026-11-07T20:45:00Z", result: { until: "TIME" } })]));
    expect(screen.getByText(/^Waits until .+ on .+\.$/)).toBeInTheDocument();
    expect(screen.queryByText("Waiting for an answer.")).not.toBeInTheDocument();
  });

  it("cancels a scheduled run with an Undo that restores it", async () => {
    show(runOf("SCHEDULED", [step("s1", "SCHEDULED", { effectiveDate: "2026-11-12" })]));
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Cancel this run" })));
    expect(showUndoToast).toHaveBeenCalledTimes(1);
    const { message, onUndo } = (showUndoToast as jest.Mock).mock.calls[0][0] as { message: string; onUndo: () => Promise<unknown> };
    expect(message).toBe("Run cancelled");
    await act(async () => {
      await onUndo();
    });
    expect(actions.restoreAutomationRunAction).toHaveBeenCalledWith("run-1");
  });

  it("shows a viewer the run with no actions", () => {
    show(runOf("FAILED", [step("s2", "FAILED", { reason: "NO_ASSIGNEE" })]), false);
    expect(screen.queryByRole("button", { name: "Skip this step" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Choose an owner" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Retry the run" })).not.toBeInTheDocument();
  });

  it("tells the editor which run it shows", () => {
    const onRun = jest.fn();
    current = runOf("DONE", []);
    const view = render(<RunWindow runId="run-1" definition={definition} canManage onRun={onRun} onClose={() => undefined} />);
    expect(onRun).toHaveBeenLastCalledWith(current);
    view.unmount();
    expect(onRun).toHaveBeenLastCalledWith(null);
  });
});
