import * as React from "react";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { TooltipProvider } from "@/components/desact/tooltip";
import { ActionStatus } from "@/components/models/ActionStatus";
import { newStep } from "@/components/modules/automations/model/tree";
import type { ActionResult } from "@/lib/errors/withActionError";
import type { Automation, AutomationCatalog, AutomationCheck, AutomationDefinition, StepSpec } from "@/models/automations";
import { partialMock } from "@/test/types";
import * as actions from "@/components/modules/automations/actions/automationActions";
import { showUndoToast } from "@/lib/feedback/undoToast";
import { AutomationEditor, type AutomationEditorInitial } from "./AutomationEditor";

const push = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));
jest.mock("@/components/providers/CompanyDataProvider/CompanyDataProvider", () => ({
  useCompanyData: () => ({ company: { name: "Acme" } }),
}));
jest.mock("@/lib/feedback/undoToast", () => ({ showUndoToast: jest.fn() }));
jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock("@/components/modules/automations/actions/automationActions", () => ({
  createAutomationAction: jest.fn(),
  saveAutomationDraftAction: jest.fn(),
  renameAutomationAction: jest.fn(),
  saveAutomationAction: jest.fn(),
  turnOnAutomationAction: jest.fn(),
  turnOffAutomationAction: jest.fn(),
  undoTurnOnAutomationAction: jest.fn(),
}));

const runCheck = jest.fn<Promise<AutomationCheck>, [unknown]>();
jest.mock("@/components/modules/automations/hooks", () => ({
  useAutomationCheck: () => ({ mutateAsync: (input: unknown) => runCheck(input) }),
  useAutomationMutation: <I, O>(action: (input: I) => Promise<ActionResult<O>>) => ({
      isPending: false,
      mutateAsync: async (input: I) => {
        const result = await action(input);
        if (result.status === "ERROR") throw new Error(result.errorMessage ?? "failed");
        return result.data as O;
      },
  }),
}));

// The other parts' windows, as stand-ins: what they are handed is what is under test here.
jest.mock("./seams", () => ({
  useAutomationWords: () => ({
    triggerTitle: () => "Time off is requested",
    triggerLine: () => "Time off is requested",
    triggerSubtitle: () => "Any time off",
    recipients: (rs: Array<{ kind: string }> | null) => (rs && rs.length ? rs.map((r) => (r.kind === "MANAGER" ? "their manager" : r.kind)).join(" and ") : null),
    stepKind: (s: StepSpec) => s.type,
    stepTitle: (s: StepSpec) => `Title ${s.id}`,
    stepSubtitle: () => null,
    sentence: () => [{ text: "When time off is requested.", stepId: null, chip: false, placeholder: false }],
  }),
  choiceOf: (trigger: { type: string; event?: string } | null) => (trigger ? (trigger.event ?? trigger.type) : null),
  usePlaceholderLabel: () => (name: string) => name,
  TriggerList: () => <div>trigger list</div>,
  TriggerFields: () => <div>trigger fields</div>,
  StepFields: ({ step, problems }: { step: StepSpec; problems: unknown[] }) => (
    <div data-test="step-fields">
      fields {step.id} · {problems.length} problems
    </div>
  ),
  WhoItRunsFor: () => <div>who it runs for</div>,
  RunHistoryWindow: () => <div>run history</div>,
  RunWindow: () => <div>run window</div>,
  VersionsWindow: () => <div>versions</div>,
  // Counts its mounts: expanding must keep the same window, or the pick and the result are lost.
  TestRunWindow: ({ expanded, onExpand }: { expanded: boolean; onExpand: (v: boolean) => void }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const R = require("react") as typeof import("react");
    R.useEffect(() => {
      (globalThis as { testRunMounts?: number }).testRunMounts = ((globalThis as { testRunMounts?: number }).testRunMounts ?? 0) + 1;
    }, []);
    return (
      <div>
        test run {expanded ? "expanded" : "window"}
        <button type="button" onClick={() => onExpand(!expanded)}>toggle test size</button>
      </div>
    );
  },
}));

// The canvas as a list of cards, each with the "Add …" line it would draw.
jest.mock("./canvas/AutomationCanvas", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { allSteps } = require("@/components/modules/automations/model/tree") as typeof import("@/components/modules/automations/model/tree");
  return {
  AutomationCanvas: (props: {
    definition: AutomationDefinition;
    needs: Map<string | null, string>;
    onSelectStep: (id: string) => void;
  }) => (
    <ul>
      {allSteps(props.definition).map((s) => (
        <li key={s.id}>
          <button type="button" onClick={() => props.onSelectStep(s.id)}>
            card {s.id}
          </button>
          {props.needs.get(s.id) && <span>{props.needs.get(s.id)}</span>}
        </li>
      ))}
    </ul>
  ),
  };
});

const ok = <T,>(data: T): ActionResult<T> => ({ status: ActionStatus.SUCCESS, data });

const definition: AutomationDefinition = {
  trigger: { type: "EVENT", event: "TIME_OFF_REQUESTED" },
  conditions: { filters: [], excludeUserIds: [] },
  steps: [{ ...newStep("s1", "REQUEST_APPROVAL"), assignee: null, declined: [newStep("s2", "SEND_EMAIL")] }],
};
const automation = partialMock<Automation>({
  id: "a1",
  name: "Long time off approval",
  description: null,
  icon: null,
  status: "DRAFT",
  origin: "BUILDER",
  versionNo: 0,
  runsGoing: 0,
  definition,
});
const check = (over: Partial<AutomationCheck> = {}): AutomationCheck => ({
  matchingCount: 48,
  matching: [],
  places: [],
  waitingCases: 0,
  messagesPerFiring: 1,
  volumeThreshold: 200,
  audiences: [],
  runsGoing: 0,
  examples: [],
  problems: [],
  ...over,
});
const catalog = partialMock<AutomationCatalog>({ actions: ["NOTIFY", "SEND_EMAIL", "REQUEST_APPROVAL"] });

const renderEditor = (over: Partial<AutomationEditorInitial> = {}) => {
  const draft = { name: automation.name, description: "", icon: null, definition };
  const initial: AutomationEditorInitial = {
    automation,
    draft,
    baseline: draft,
    tool: null,
    selectedStepId: null,
    runId: null,
    aiPrompt: null,
    turnOnOnLoad: false,
    ...over,
  };
  return render(
    <TooltipProvider>
      <AutomationEditor initial={initial} catalog={catalog} canManage />
    </TooltipProvider>,
  );
};

beforeEach(() => {
  runCheck.mockResolvedValue(check());
  jest.mocked(actions.turnOnAutomationAction).mockResolvedValue(
    ok({ automation: { ...automation, status: "ACTIVE" }, plannedRuns: 0, cancelledRuns: 0 }),
  );
  jest.mocked(actions.saveAutomationDraftAction).mockResolvedValue(ok(automation));
});

describe("AutomationEditor — turning on", () => {
  it("holds a turn-on with missing details: the banner, the card's line, the first step's settings (F3)", async () => {
    runCheck.mockResolvedValue(check({ problems: [{ stepId: "s1", field: "assignee", code: "REQUIRED", message: "" }] }));
    renderEditor();
    fireEvent.click(screen.getByRole("button", { name: "Turn on" }));

    expect(await screen.findByText("1 step needs details before you can turn this on.")).toBeInTheDocument();
    expect(screen.getByText("Choose who approves")).toBeInTheDocument();
    expect(screen.getByTestId("step-fields")).toHaveTextContent("fields s1 · 1 problems");
    expect(actions.turnOnAutomationAction).not.toHaveBeenCalled();
  });

  it("asks about the requests already waiting (V6), turns on, and offers Undo", async () => {
    runCheck.mockResolvedValue(check({ waitingCases: 6 }));
    renderEditor();
    fireEvent.click(screen.getByRole("button", { name: "Turn on" }));

    const dialog = await screen.findByRole("dialog", { name: "Turn on Long time off approval?" });
    expect(within(dialog).getByText("Who should it run for?")).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("radio", { name: /^Also the 6\srequests already waiting$/ }));
    fireEvent.click(within(dialog).getByRole("button", { name: "Turn on" }));

    await waitFor(() =>
      expect(actions.turnOnAutomationAction).toHaveBeenCalledWith({ id: "a1", request: { backfill: "ALL", confirmVolume: false } }),
    );
    expect(showUndoToast).toHaveBeenCalledWith(expect.objectContaining({ message: "Automation turned on" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Turn off" })).toBeInTheDocument();
  });

  it("opens the plain turn-on dialog (F4) when nothing is waiting", async () => {
    runCheck.mockResolvedValue(check({ audiences: ["MANAGER"] }));
    renderEditor();
    fireEvent.click(screen.getByRole("button", { name: "Turn on" }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("It runs for everyone.")).toBeInTheDocument();
    // Who hears from it in words, not the backend's code (walk of 2026-11-07: "MANAGER will get…").
    expect(within(dialog).getByText("Their manager will get requests and notifications from it.")).toBeInTheDocument();
    expect(within(dialog).queryByText("Who should it run for?")).not.toBeInTheDocument();
  });
});

describe("AutomationEditor — the step menu and leaving", () => {
  it("removes a step at once, with Undo, and asks to save before leaving (H2)", async () => {
    renderEditor();
    fireEvent.click(screen.getByRole("button", { name: "card s2" }));
    fireEvent.keyDown(screen.getByRole("button", { name: "Step actions" }), { key: "Enter" });
    fireEvent.click(await screen.findByRole("menuitem", { name: "Remove step" }));

    expect(screen.queryByRole("button", { name: "card s2" })).not.toBeInTheDocument();
    const undo = jest.mocked(showUndoToast).mock.calls[0][0];
    expect(undo.message).toBe("Step removed");

    // × with a change: Save your changes? — Keep editing stays.
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    const h2 = await screen.findByRole("dialog", { name: "Save your changes?" });
    fireEvent.click(within(h2).getByRole("button", { name: "Keep editing" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(push).not.toHaveBeenCalled();

    // Undo puts the step back; the editor is clean again and × leaves at once.
    await act(async () => {
      await undo.onUndo();
    });
    expect(screen.getByRole("button", { name: "card s2" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(push).toHaveBeenCalledWith("/automations");
  });

  it("saves the draft and leaves from H2", async () => {
    renderEditor();
    fireEvent.click(screen.getByRole("button", { name: "card s1" }));
    fireEvent.keyDown(screen.getByRole("button", { name: "Step actions" }), { key: "Enter" });
    fireEvent.click(await screen.findByRole("menuitem", { name: "Skip for now" }));

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    fireEvent.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "Save and leave" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/automations"));
    const saved = jest.mocked(actions.saveAutomationDraftAction).mock.calls[0][0];
    expect(saved.id).toBe("a1");
    expect(saved.request.definition.steps[0].skipped).toBe(true);
  });
});

describe("AutomationEditor — the test run", () => {
  it("expands the test run into its dialog without a new window (walk of 2026-11-07: the pick and the result were lost)", () => {
    (globalThis as { testRunMounts?: number }).testRunMounts = 0;
    renderEditor({ tool: "test" });
    expect(screen.getByText("test run window")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "toggle test size" }));
    expect(screen.getByText("test run expanded")).toBeInTheDocument();
    expect((globalThis as { testRunMounts?: number }).testRunMounts).toBe(1);
  });
});

describe("AutomationEditor — read mode", () => {
  it("opens an active automation read only, with Edit, and switches to editing", () => {
    renderEditor({ automation: { ...automation, status: "ACTIVE" } });
    expect(screen.queryByRole("button", { name: "Save changes" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add a step" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(screen.getByRole("button", { name: "Save changes" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add a step" })).toBeInTheDocument();
    expect(screen.getByText("This automation is on. Changes apply to runs that start after you save.")).toBeInTheDocument();
  });

  it("keeps a system automation read only, with its banner and no Edit (N4)", () => {
    renderEditor({ automation: { ...automation, status: "ACTIVE", origin: "SYSTEM" } });
    expect(screen.getByText("noddo keeps this automation. You can see it, not change it.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Edit" })).not.toBeInTheDocument();
  });
});
