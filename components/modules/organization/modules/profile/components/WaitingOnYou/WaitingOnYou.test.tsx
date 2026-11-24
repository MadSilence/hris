import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { holdWithUndo } from "@/lib/feedback/holdWithUndo";
import { WaitingOnYou } from "./WaitingOnYou";

jest.mock("@/lib/feedback/holdWithUndo", () => ({ holdWithUndo: jest.fn() }));
const invalidateLeave = jest.fn();
jest.mock("@/components/modules/timeOff/lib/useInvalidateLeaveAnswer", () => ({
  useInvalidateLeaveAnswer: () => invalidateLeave,
}));

const request = (id: string, createdAt: string) => ({
  id,
  userId: "anna",
  policyId: "p1",
  status: "PENDING",
  startDate: "2026-11-23",
  endDate: "2026-11-24",
  requestedAmount: 2,
  createdAt,
});

jest.mock("@/components/modules/notifications/hooks/useWaitingOnMe", () => ({
  useWaitingOnMe: () => ({
    data: { requests: [request("r1", "2026-11-01"), request("r2", "2026-11-02"), request("r3", "2026-11-03")] },
  }),
}));
jest.mock("@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useTimeOffPolicies", () => ({
  useTimeOffPolicies: () => ({ data: [{ id: "p1", name: "Annual Leave" }] }),
}));
jest.mock("@/components/modules/reviews/hooks", () => ({ useMyReviews: () => ({ data: { toWrite: [] } }) }));

const renderBar = () => render(<WaitingOnYou userId="anna" firstName="Anna" />);

/** A hold the test answers when it chooses. */
const pendingHold = () => {
  let answer: (held: boolean) => void = () => undefined;
  jest.mocked(holdWithUndo).mockReturnValueOnce(new Promise<boolean>((resolve) => { answer = resolve; }));
  return (held: boolean) => act(async () => { answer(held); });
};

/** The decision bar (3.2) and Approve held on the server with Undo (DECISIONS.md § "Undo and the Admin role"). */
describe("WaitingOnYou", () => {
  beforeEach(() => {
    jest.mocked(holdWithUndo).mockReset().mockResolvedValue(true);
    window.sessionStorage.clear();
  });

  it("counts what waits, shows two and folds the rest", async () => {
    const user = userEvent.setup();
    renderBar();
    expect(screen.getByRole("heading", { name: /Waiting on you\s*3/ })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getAllByRole("listitem")[0]).toHaveTextContent(/^Time off · Anna asked for/);

    await user.click(screen.getByRole("button", { name: "Show 1 more" }));
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    await user.click(screen.getByRole("button", { name: "Show less" }));
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("holds an approval on the server: the strip goes at once, and nothing is kept back on the page", async () => {
    const user = userEvent.setup();
    const answer = pendingHold();
    const { unmount } = renderBar();

    await user.click(screen.getAllByRole("button", { name: "Approve" })[0]);
    expect(screen.getByRole("heading", { name: /Waiting on you\s*2/ })).toBeInTheDocument();
    expect(holdWithUndo).toHaveBeenCalledWith({
      kind: "TIME_OFF_APPROVE",
      targetId: "r1",
      // Not "Anna's off …": an approval may be one step of a chain (walk of 2026-11-23).
      message: "Time off approved",
      invalidate: invalidateLeave,
    });

    await answer(true);
    unmount();
    expect(holdWithUndo).toHaveBeenCalledTimes(1);
  });

  it("brings the strip back when the hold is refused", async () => {
    const user = userEvent.setup();
    const answer = pendingHold();
    renderBar();

    await user.click(screen.getAllByRole("button", { name: "Approve" })[0]);
    expect(screen.getByRole("heading", { name: /Waiting on you\s*2/ })).toBeInTheDocument();
    await answer(false);
    expect(screen.getByRole("heading", { name: /Waiting on you\s*3/ })).toBeInTheDocument();
  });
});
