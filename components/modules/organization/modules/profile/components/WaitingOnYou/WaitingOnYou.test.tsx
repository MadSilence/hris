import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toaster } from "sonner";
import { WaitingOnYou } from "./WaitingOnYou";

const mutateAsync = jest.fn();

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

jest.mock("@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useTimeOffRequestsAwaitingMe", () => ({
  useTimeOffRequestsAwaitingMe: () => ({
    data: [request("r1", "2026-11-01"), request("r2", "2026-11-02"), request("r3", "2026-11-03")],
  }),
}));
jest.mock("@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useApproveTimeOffRequest", () => ({
  useApproveTimeOffRequest: () => ({ mutateAsync }),
}));
jest.mock("@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useTimeOffPolicies", () => ({
  useTimeOffPolicies: () => ({ data: [{ id: "p1", name: "Annual Leave" }] }),
}));
jest.mock("@/components/modules/reviews/hooks", () => ({ useMyReviews: () => ({ data: { toWrite: [] } }) }));

const renderBar = () =>
  render(
    <>
      <WaitingOnYou userId="anna" firstName="Anna" />
      <Toaster />
    </>,
  );

/** The decision bar (3.2) and Approve held back until its toast ends (the owner, D1, 2026-11-05). */
describe("WaitingOnYou", () => {
  beforeEach(() => {
    mutateAsync.mockReset().mockResolvedValue(undefined);
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

  it("holds an approval back while the toast offers Undo, and never sends it after Undo", async () => {
    const user = userEvent.setup();
    renderBar();

    await user.click(screen.getAllByRole("button", { name: "Approve" })[0]);
    expect(screen.getByRole("heading", { name: /Waiting on you\s*2/ })).toBeInTheDocument();
    expect(mutateAsync).not.toHaveBeenCalled();

    await user.click(await screen.findByRole("button", { name: /undo/i }));
    expect(screen.getByRole("heading", { name: /Waiting on you\s*3/ })).toBeInTheDocument();
    await act(() => new Promise((r) => setTimeout(r, 3500)));
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("sends the approval when the toast runs out", async () => {
    const user = userEvent.setup();
    renderBar();

    await user.click(screen.getAllByRole("button", { name: "Approve" })[0]);
    await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith({ requestId: "r1" }), { timeout: 5000 });
    expect(mutateAsync).toHaveBeenCalledTimes(1);
  }, 10000);

  it("sends a held approval at once when the reader leaves the profile", async () => {
    const user = userEvent.setup();
    const { unmount } = renderBar();

    await user.click(screen.getAllByRole("button", { name: "Approve" })[0]);
    expect(mutateAsync).not.toHaveBeenCalled();
    unmount();
    expect(mutateAsync).toHaveBeenCalledWith({ requestId: "r1" });
  });
});
