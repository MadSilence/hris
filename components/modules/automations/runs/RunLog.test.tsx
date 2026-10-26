import * as React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";

import { RunLog } from "./RunLog";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useAutomationRuns } from "@/components/modules/automations/hooks";
import {
  cancelAutomationRunAction,
  retryAutomationRunAction,
} from "@/components/modules/automations/actions/automationActions";
import type { AutomationRun } from "@/models/automations";

jest.mock("@/components/auth/PermissionGate", () => ({
  PermissionGate: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
jest.mock("@/components/modules/automations/actions/automationActions");
jest.mock("@/lib/errors/errorToast", () => ({ showError: jest.fn(), showSuccess: jest.fn() }));
const invalidate = jest.fn();
jest.mock("@/components/modules/automations/hooks", () => ({
  unwrapAction: jest.requireActual("@/components/modules/automations/hooks/useAutomationQueries").unwrapAction,
  useAutomationRuns: jest.fn(),
  useInvalidateAutomations: () => invalidate,
}));
jest.mock("@/public/desact/src/components/ui/select", () => jest.requireActual("@/test/selectMock"));

const run = (over: Partial<AutomationRun>): AutomationRun => ({
  id: "run-1",
  ruleId: "r1",
  ruleName: "Welcome",
  versionNo: 2,
  person: { id: "p1", name: "Anna Schmidt" },
  occurrenceKey: "hire",
  triggerType: "PERSON_HIRED",
  anchorDate: "2026-10-20",
  triggerDate: "2026-10-20",
  status: "FAILED",
  reason: "MISSING_PLACEHOLDER: managerName",
  ranLate: false,
  backfill: false,
  createdAt: "2026-10-16T08:00:00",
  finishedAt: "2026-10-16T08:01:00",
  steps: [
    {
      id: "s1", position: 0, actionType: "SEND_EMAIL", summary: "Email the person: Welcome", offsetDays: 0,
      plannedDate: "2026-10-14", effectiveDate: "2026-10-16", status: "FAILED", reason: "MISSING_PLACEHOLDER: managerName",
      ranLate: true, result: {}, finishedAt: "2026-10-16T08:01:00",
    },
    {
      id: "s2", position: 1, actionType: "CREATE_TASK", summary: "Task for their manager: Desk", offsetDays: 0,
      plannedDate: "2026-10-16", effectiveDate: "2026-10-16", status: "STOPPED", reason: null,
      ranLate: false, result: {}, finishedAt: null,
    },
  ],
  ...over,
});

const page = (content: AutomationRun[]) => ({
  data: { content, totalElements: content.length, totalPages: 1, number: 0, size: 50 },
  isLoading: false,
  error: null,
  refetch: jest.fn(),
});

beforeEach(() => {
  (useAutomationRuns as jest.Mock).mockReturnValue(page([
    run({}),
    run({ id: "run-2", person: { id: "p2", name: "Bob Meyer" }, status: "SCHEDULED", reason: null, steps: [] }),
    run({ id: "run-3", person: { id: "p3", name: "Cleo Park" }, status: "DONE", reason: "LATE_DATA: planned for 2026-10-14", ranLate: true, steps: [] }),
  ]));
  (retryAutomationRunAction as jest.Mock).mockResolvedValue({ status: ActionStatus.SUCCESS, data: run({ status: "IN_PROGRESS" }) });
  (cancelAutomationRunAction as jest.Mock).mockResolvedValue({ status: ActionStatus.SUCCESS, data: run({ status: "CANCELLED" }) });
});

const rowOf = (name: string) => screen.getByText(name).closest("tr") as HTMLElement;

describe("RunLog", () => {
  it("lists each run with its person, version, status and the reason in words", () => {
    render(<RunLog ruleId="r1" />);

    const failed = rowOf("Anna Schmidt");
    expect(within(failed).getByText("v2")).toBeInTheDocument();
    expect(within(failed).getByText("Failed")).toBeInTheDocument();
    expect(within(failed).getByText("Failed: {managerName} has no value")).toBeInTheDocument();
    expect(within(rowOf("Cleo Park")).getByText(/^Ran late: planned for/)).toBeInTheDocument();
  });

  it("opens a run to its steps", () => {
    render(<RunLog ruleId="r1" />);

    fireEvent.click(rowOf("Anna Schmidt"));
    const steps = screen.getByRole("list", { name: "Steps" });
    expect(within(steps).getByText("Email the person: Welcome")).toBeInTheDocument();
    expect(within(steps).getByText("Stopped")).toBeInTheDocument();
    expect(within(steps).getByText(/^Planned for/)).toBeInTheDocument();
  });

  it("retries a failed run and cancels a scheduled one — and offers neither elsewhere", async () => {
    render(<RunLog ruleId="r1" />);

    expect(within(rowOf("Cleo Park")).queryByRole("button", { name: /Retry|Cancel/ })).not.toBeInTheDocument();
    fireEvent.click(within(rowOf("Anna Schmidt")).getByRole("button", { name: "Retry" }));
    await waitFor(() => expect(retryAutomationRunAction).toHaveBeenCalledWith("run-1"));
    fireEvent.click(within(rowOf("Bob Meyer")).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(cancelAutomationRunAction).toHaveBeenCalledWith("run-2"));
    expect(invalidate).toHaveBeenCalled();
  });

  it("filters by status", () => {
    render(<RunLog ruleId="r1" />);

    fireEvent.change(screen.getByLabelText("Status"), { target: { value: "FAILED" } });
    expect(useAutomationRuns).toHaveBeenLastCalledWith("r1", "FAILED", 0, 50);
  });

  it("says when there are no runs yet", () => {
    (useAutomationRuns as jest.Mock).mockReturnValue(page([]));
    render(<RunLog ruleId="r1" />);

    expect(screen.getByText("No runs yet")).toBeInTheDocument();
  });
});
