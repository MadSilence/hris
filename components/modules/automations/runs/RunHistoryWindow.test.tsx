import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import type { AutomationRun, RunCounts, RunSlice } from "@/models/automations";
import { partialMock } from "@/test/types";
import { RunHistoryWindow } from "./RunHistoryWindow";

type RunsQuery = {
  data?: { pages: RunSlice[] };
  isLoading: boolean;
  isSuccess: boolean;
  error: Error | null;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => Promise<unknown>;
  refetch: () => Promise<unknown>;
};

let runs: RunsQuery;
jest.mock("@/components/modules/automations/hooks", () => ({
  useAutomationRuns: () => runs,
  useAutomation: () => ({ data: { definition: { trigger: { type: "EVENT", event: "TIME_OFF_REQUESTED" } } } }),
}));
jest.mock("./seams", () => ({ useAutomationWords: () => ({ triggerTitle: () => "Time off over 10 days is requested" }) }));

const counts = (all: number): RunCounts => ({
  all,
  failed: 2,
  waiting: 3,
  scheduled: 14,
  done: all - 19,
  inProgress: 0,
  skipped: 0,
  cancelled: 0,
  next7Days: 0,
});

const run = (id: string, name: string, extra: Partial<AutomationRun> = {}): AutomationRun =>
  partialMock<AutomationRun>({
    id,
    person: { id, name, avatarUrl: null, jobTitle: null, office: null },
    about: { kind: "TIME_OFF", leaveType: "Vacation", days: 14 },
    status: "DONE",
    ranLate: false,
    daysLate: 0,
    createdAt: "2026-10-21T09:00:00",
    ...extra,
  });

const loaded = (content: AutomationRun[], all: number, outsideScope = 0): RunsQuery => ({
  data: { pages: [{ content, nextCursor: null, counts: counts(all), outsideScope }] },
  isLoading: false,
  isSuccess: true,
  error: null,
  hasNextPage: false,
  isFetchingNextPage: false,
  fetchNextPage: () => Promise.resolve(),
  refetch: () => Promise.resolve(),
});

const show = (onOpenRun = jest.fn()) =>
  render(<RunHistoryWindow automationId="rule-1" selectedRunId="r2" onOpenRun={onOpenRun} onClose={() => undefined} />);

describe("the run history", () => {
  it("lists the runs with the chips' counts, a late line and the runs one can't see", () => {
    runs = loaded([run("r1", "Aistė Jonaitė", { ranLate: true, daysLate: 2 }), run("r2", "Tom Becker", { status: "IN_PROGRESS" })], 312, 12);
    const onOpenRun = jest.fn();
    show(onOpenRun);

    expect(screen.getByRole("button", { name: /All 312/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /Failed 2/ })).toBeInTheDocument();
    expect(screen.getByText("Ran 2 days late")).toBeInTheDocument();
    expect(screen.getByText("Plus 12 runs you can't see.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Tom Becker/ })).toHaveAttribute("aria-current", "true");

    fireEvent.click(screen.getByRole("button", { name: /Aistė Jonaitė/ }));
    expect(onOpenRun).toHaveBeenCalledWith("r1");
  });

  it("says when it will run, when it has never run", () => {
    runs = loaded([], 0);
    show();
    expect(screen.getByText("No runs yet")).toBeInTheDocument();
    expect(screen.getByText("It runs when: Time off over 10 days is requested.")).toBeInTheDocument();
  });

  it("says a chip matched nothing, and offers the way back", () => {
    runs = loaded([], 312);
    show();
    fireEvent.click(screen.getByRole("button", { name: /Waiting 3/ }));
    expect(screen.getByText("No runs match")).toBeInTheDocument();
    expect(screen.getByText("No waiting runs.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Show all runs" })).toBeInTheDocument();
  });

  it("says the automation keeps running when the runs don't load", () => {
    runs = { ...loaded([], 0), data: undefined, isSuccess: false, error: new Error("down") };
    show();
    expect(screen.getByText("We couldn't load the runs")).toBeInTheDocument();
    expect(screen.getByText("The automation keeps running.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });
});
