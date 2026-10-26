import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";

import { DecideAnywayControls } from "./DecideAnywayControls";

const mutateAsync = jest.fn();

jest.mock("@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useDecideAnyway", () => ({
  useDecideAnyway: () => ({ mutateAsync, isPending: false }),
}));

beforeEach(() => {
  mutateAsync.mockReset();
  mutateAsync.mockResolvedValue({ status: "SUCCESS" });
});

const dialog = () => screen.getByRole("alertdialog");

describe("DecideAnywayControls", () => {
  it("asks before approving over the chain, then approves anyway", async () => {
    const onDecided = jest.fn();
    render(<DecideAnywayControls requestId="req-1" requesterName="Bob Builder" onDecided={onDecided} />);

    fireEvent.click(screen.getByRole("button", { name: "Approve Anyway" }));
    expect(within(dialog()).getByText(/Bob Builder is approved now/)).toBeInTheDocument();
    expect(mutateAsync).not.toHaveBeenCalled();

    fireEvent.click(within(dialog()).getByRole("button", { name: "Approve Anyway" }));

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({ requestId: "req-1", decision: "APPROVE", rejectionReason: undefined }),
    );
    await waitFor(() => expect(onDecided).toHaveBeenCalled());
  });

  it("will not reject anyway without a reason", async () => {
    render(<DecideAnywayControls requestId="req-1" />);

    fireEvent.click(screen.getByRole("button", { name: "Reject Anyway" }));
    fireEvent.click(within(dialog()).getByRole("button", { name: "Reject Anyway" }));

    expect(await within(dialog()).findByText("Say why it is rejected.")).toBeInTheDocument();
    expect(mutateAsync).not.toHaveBeenCalled();

    fireEvent.change(within(dialog()).getByLabelText(/Reason/), { target: { value: "Too short notice" } });
    fireEvent.click(within(dialog()).getByRole("button", { name: "Reject Anyway" }));

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({
        requestId: "req-1",
        decision: "REJECT",
        rejectionReason: "Too short notice",
      }),
    );
  });

  it("keeps the dialog open with the refusal when the backend says no", async () => {
    mutateAsync.mockRejectedValue(new Error("Only somebody who manages this person's time off can decide over the approval chain."));
    render(<DecideAnywayControls requestId="req-1" />);

    fireEvent.click(screen.getByRole("button", { name: "Approve Anyway" }));
    fireEvent.click(within(dialog()).getByRole("button", { name: "Approve Anyway" }));

    expect(await within(dialog()).findByText(/Only somebody who manages/)).toBeInTheDocument();
  });
});
