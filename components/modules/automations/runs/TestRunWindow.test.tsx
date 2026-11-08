import * as React from "react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AutomationDefinition, TestCase, TestRun } from "@/models/automations";
import { ActionStatus } from "@/components/models/ActionStatus";
import {
  automationTestCasesAction,
  automationTestRunAction,
  automationTestSendAction,
  deleteAutomationTestItemsAction,
} from "@/components/modules/automations/actions/automationActions";
import { decisionsFor, TestRunWindow } from "./TestRunWindow";

jest.mock("@/components/modules/automations/actions/automationActions", () => ({
  automationTestCasesAction: jest.fn(),
  automationTestRunAction: jest.fn(),
  automationTestSendAction: jest.fn(),
  deleteAutomationTestItemsAction: jest.fn(),
}));
jest.mock("@/components/ui/SearchableSelect", () => jest.requireActual("@/test/searchableSelectMock"));
jest.mock("@/lib/errors/errorToast", () => ({ showSuccess: jest.fn(), showError: jest.fn() }));
jest.mock("./seams", () => ({
  useAutomationWords: () => ({
    triggerTitle: () => "Time off over 10 days is requested",
    stepTitle: (step: { id: string }) => `Step ${step.id}`,
  }),
  SegmentedControl: jest.requireActual("@/components/ui/SegmentedControl").SegmentedControl,
}));

const definition: AutomationDefinition = {
  trigger: { type: "EVENT", event: "TIME_OFF_REQUESTED" },
  conditions: { filters: [], excludeUserIds: [] },
  steps: [
    {
      id: "a1",
      type: "REQUEST_APPROVAL",
      approved: [{ id: "n1", type: "NOTIFY" }],
      declined: [{ id: "a2", type: "REQUEST_APPROVAL", approved: [], declined: [{ id: "e1", type: "SEND_EMAIL" }] }],
    },
  ],
};

const lena: TestCase = {
  id: "request:1",
  person: { id: "p1", name: "Lena Kowalska" },
  label: "Lena Kowalska",
  startDate: null,
  endDate: null,
  example: false,
};

const result: TestRun = {
  testCase: lena,
  triggerLine: "Lena Kowalska",
  testItems: 0,
  steps: [
    {
      stepId: "a1",
      actionType: "REQUEST_APPROVAL",
      outcome: "DECIDED",
      title: "DECLINES",
      recipients: [{ id: "m", name: "Marta" }],
      detail: null,
      date: null,
      path: "declined",
      pathName: null,
      sendable: true,
      missingPlaceholders: [],
    },
    {
      stepId: "n1",
      actionType: "NOTIFY",
      outcome: "SKIPPED_PATH",
      title: null,
      recipients: [],
      detail: null,
      date: null,
      path: "approved",
      pathName: null,
      sendable: false,
      missingPlaceholders: [],
    },
    {
      stepId: "e1",
      actionType: "SEND_EMAIL",
      outcome: "WOULD_SEND",
      title: "Your leave",
      recipients: [{ id: "p1", name: "Lena Kowalska" }],
      detail: null,
      date: null,
      path: null,
      pathName: null,
      sendable: true,
      missingPlaceholders: [],
    },
  ],
};

const show = () =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <TestRunWindow
        automationId="rule-1"
        name="Long time off approval"
        definition={definition}
        expanded={false}
        onExpand={() => undefined}
        onClose={() => undefined}
      />
    </QueryClientProvider>,
  );

beforeEach(() => {
  (automationTestCasesAction as jest.Mock).mockResolvedValue({ status: ActionStatus.SUCCESS, data: [lena] });
  (automationTestRunAction as jest.Mock).mockResolvedValue({ status: ActionStatus.SUCCESS, data: result });
  (automationTestSendAction as jest.Mock).mockResolvedValue({
    status: ActionStatus.SUCCESS,
    data: { stepId: "e1", outcome: "EMAILED", testItems: 1 },
  });
  (deleteAutomationTestItemsAction as jest.Mock).mockResolvedValue({ status: ActionStatus.SUCCESS, data: { deleted: 1 } });
});

describe("the decisions of a test run", () => {
  it("holds one pick per approval, Approves where none was picked", () => {
    expect(decisionsFor(definition, { a2: "NO_ANSWER" })).toEqual({ a1: "APPROVES", a2: "NO_ANSWER" });
  });
});

describe("the test run window", () => {
  it("asks one question per approval and sends each pick with the run", async () => {
    show();
    expect(await screen.findByLabelText("Try it on")).toHaveValue("request:1");
    expect(screen.getByText("A real request from the last 30 days.")).toBeInTheDocument();
    expect(screen.getByText("Pick a request and their manager's answer, then run the test.")).toBeInTheDocument();

    const first = screen.getByRole("radiogroup", { name: "Step 1: what does their manager do?" });
    const second = screen.getByRole("radiogroup", { name: "Step 2B: what does their manager do?" });
    fireEvent.click(within(first).getByRole("radio", { name: "Declines" }));
    fireEvent.click(within(second).getByRole("radio", { name: "No answer" }));

    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Run test" })));
    expect(automationTestRunAction).toHaveBeenCalledWith({
      automationId: "rule-1",
      definition,
      caseId: "request:1",
      decisions: { a1: "DECLINES", a2: "NO_ANSWER" },
    });

    expect(await screen.findByText("What would happen")).toBeInTheDocument();
    expect(screen.getByText("Starts it: Time off over 10 days is requested")).toBeInTheDocument();
    expect(screen.getByText("Declined: your pick above")).toBeInTheDocument();
    expect(screen.getByText("Skipped: only when approved")).toBeInTheDocument();
    expect(screen.getByText("Would go to Lena Kowalska")).toBeInTheDocument();
  });

  it("sends one item to the tester and offers to delete the test items", async () => {
    show();
    await screen.findByLabelText("Try it on");
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Run test" })));
    const sends = await screen.findAllByRole("button", { name: "Send it to me" });
    expect(sends).toHaveLength(2);

    await act(async () => fireEvent.click(sends[1]));
    expect(automationTestSendAction).toHaveBeenCalledWith({ automationId: "rule-1", definition, caseId: "request:1", stepId: "e1" });
    expect(screen.getByText("Sent to you")).toBeInTheDocument();
    expect(screen.getByText("1 test item sent to you")).toBeInTheDocument();
    expect(screen.getByText("Removes the notifications and tasks; emails stay in your inbox.")).toBeInTheDocument();

    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Delete test items" })));
    expect(deleteAutomationTestItemsAction).toHaveBeenCalledWith("rule-1");
    expect(screen.queryByText("1 test item sent to you")).not.toBeInTheDocument();
  });

  it("says nothing was sent when the test cannot run, and offers to try again", async () => {
    (automationTestRunAction as jest.Mock).mockResolvedValue({ status: ActionStatus.ERROR, errorMessage: "No." });
    show();
    await screen.findByLabelText("Try it on");
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Run test" })));
    expect(await screen.findByText("We couldn't run the test. Nothing was sent.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });

  it("offers a made-up person when there is no real case", async () => {
    (automationTestCasesAction as jest.Mock).mockResolvedValue({
      status: ActionStatus.SUCCESS,
      data: [{ ...lena, id: "example", label: "Alex Example", example: true }],
    });
    show();
    expect(await screen.findByText("No requests in the last 30 days. Try it on a made-up one.")).toBeInTheDocument();
  });
});
