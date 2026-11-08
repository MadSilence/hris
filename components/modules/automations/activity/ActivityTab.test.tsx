import * as React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import type { AutomationRun, RunQuery, RunSlice } from "@/models/automations";
import { partialMock } from "@/test/types";
import { ActivityTab } from "./ActivityTab";

const push = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ push, replace: jest.fn() }) }));

let slice: RunSlice;
let runsState: { isLoading: boolean; error: Error | null } = { isLoading: false, error: null };
const queries: Omit<RunQuery, "cursor">[] = [];

jest.mock("@/components/modules/automations/hooks", () => ({
  useAutomations: () => ({ data: [] }),
  useAutomation: () => ({ data: { id: "a1", name: "Long time off approval" } }),
  useAutomationRuns: (query: Omit<RunQuery, "cursor">) => {
    queries.push(query);
    return {
      data: runsState.isLoading || runsState.error ? undefined : { pages: [slice] },
      ...runsState,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: jest.fn(),
      refetch: jest.fn(),
    };
  },
}));

jest.mock("./seams", () => ({
  ConditionBuilder: () => <div>condition builder</div>,
  RunStatusBadge: ({ status }: { status: string }) => <span>{status}</span>,
  RunWindow: ({ runId }: { runId: string }) => <div>run window {runId}</div>,
}));

const run = (id: string, over: Partial<AutomationRun> = {}): AutomationRun =>
  partialMock<AutomationRun>({
    id,
    ruleId: "a1",
    ruleName: "Long time off approval",
    ruleIcon: null,
    person: { id: `p-${id}`, name: "Tom Becker", avatarUrl: null, jobTitle: null, office: null },
    triggerType: "EVENT",
    about: { kind: "TIME_OFF", leaveType: "Vacation", days: 12 },
    status: "DONE",
    createdAt: "2026-10-28T10:00:00Z",
    finishedAt: "2026-10-28T10:00:00Z",
    nextDate: null,
    ...over,
  });

const counts = { all: 1284, failed: 2, waiting: 5, scheduled: 0, done: 0, inProgress: 0, skipped: 0, cancelled: 0, next7Days: 14 };

const renderTab = (props: Partial<React.ComponentProps<typeof ActivityTab>> = {}) => {
  const handlers = { onAutomationChange: jest.fn(), onRunChange: jest.fn(), onGoToAutomations: jest.fn() };
  render(<ActivityTab automationId={null} runId={null} canManage {...handlers} {...props} />);
  return handlers;
};

beforeEach(() => {
  push.mockReset();
  queries.length = 0;
  runsState = { isLoading: false, error: null };
  slice = { content: [run("r1"), run("r2", { status: "FAILED", person: { id: "p2", name: "Ieva Petraitė", avatarUrl: null, jobTitle: null, office: null } })], nextCursor: null, counts, outsideScope: 12 };
});

describe("Activity", () => {
  it("V8: chips with their counts, every column, and the runs out of sight counted", () => {
    renderTab();

    expect(screen.getByRole("button", { name: "All 1,284" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Needs attention 2" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Waiting 5" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next 7 days 14" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Automation" })).toBeInTheDocument();
    expect(screen.getAllByText("Vacation, 12 days")).toHaveLength(2);
    expect(screen.getByText("Plus 12 runs you can't see.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Open in editor" })).not.toBeInTheDocument();
  });

  it("asks for the picked chip", () => {
    renderTab();

    fireEvent.click(screen.getByRole("button", { name: "Needs attention 2" }));

    expect(queries[queries.length - 1]).toEqual(expect.objectContaining({ chip: "FAILED", automationId: null }));
  });

  it("opens a row's run in the editor, and See why the same", () => {
    renderTab();

    fireEvent.click(screen.getAllByTestId("run-row")[0]);
    expect(push).toHaveBeenLastCalledWith("/automations/a1?run=r1");

    fireEvent.click(within(screen.getAllByTestId("run-row")[1]).getByRole("button", { name: "See why" }));
    expect(push).toHaveBeenLastCalledWith("/automations/a1?run=r2");
  });

  it("V8b: one automation — the pill, Open in editor, no Automation column", () => {
    const { onAutomationChange } = renderTab({ automationId: "a1" });

    expect(screen.getByText("Long time off approval")).toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "Automation" })).not.toBeInTheDocument();
    // With one automation picked the chips still follow the search and the Filters (walk of 2026-11-07: "All 45"
    // over two rows) — Run history is the list that counts its whole history.
    expect(queries[queries.length - 1]).toEqual(expect.objectContaining({ automationId: "a1", countsFollowSearch: true }));

    fireEvent.click(screen.getByRole("button", { name: "Open in editor" }));
    expect(push).toHaveBeenLastCalledWith("/automations/a1");

    fireEvent.click(screen.getByRole("button", { name: "Show every automation" }));
    expect(onAutomationChange).toHaveBeenCalledWith(null);
  });

  it("the deep link of See why: the failures, and the newest one open beside the table", () => {
    slice = { ...slice, content: [run("r9", { status: "FAILED" })] };
    const { onRunChange } = renderTab({ automationId: "a1", initialChip: "FAILED", openLatest: true });

    expect(queries[0]).toEqual(expect.objectContaining({ chip: "FAILED", automationId: "a1" }));
    expect(onRunChange).toHaveBeenCalledWith("r9");
  });

  it("shows the run named in the address in its window", () => {
    renderTab({ automationId: "a1", runId: "r2" });

    expect(screen.getByText("run window r2")).toBeInTheDocument();
  });

  it("says when a chip has nothing", () => {
    slice = { ...slice, content: [], outsideScope: 0 };
    renderTab({ initialChip: "FAILED" });

    expect(screen.getByText("Nothing needs attention")).toBeInTheDocument();
  });

  it("says when nothing has run yet, with the way back", () => {
    slice = { ...slice, content: [], outsideScope: 0, counts: { ...counts, all: 0 } };
    const { onGoToAutomations } = renderTab();

    fireEvent.click(screen.getByRole("button", { name: "Go to automations" }));
    expect(onGoToAutomations).toHaveBeenCalled();
  });

  it("says when the activity did not load", () => {
    runsState = { isLoading: false, error: new Error("boom") };
    renderTab();

    expect(screen.getByText("We couldn't load the activity")).toBeInTheDocument();
  });
});
