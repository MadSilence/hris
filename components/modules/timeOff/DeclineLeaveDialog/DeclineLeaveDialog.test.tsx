import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { showSuccess } from "@/lib/errors/errorToast";
import { DeclineLeaveDialog } from "./DeclineLeaveDialog";

const mockReject = jest.fn();

jest.mock("@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useRejectTimeOffRequest", () => ({
  useRejectTimeOffRequest: () => ({ mutateAsync: mockReject, isPending: false }),
}));
jest.mock("@/components/modules/notifications/hooks/useNotifications", () => ({ useInvalidateNotifications: () => jest.fn() }));
jest.mock("@/lib/errors/errorToast", () => ({ showSuccess: jest.fn() }));

const target = {
  requestId: "r1",
  startDate: "2026-11-30",
  endDate: "2026-12-04",
  policyName: "Annual leave",
  policyColor: "blue",
  firstName: "Rūta",
};

beforeEach(() => {
  mockReject.mockReset().mockResolvedValue({});
  jest.mocked(showSuccess).mockReset();
});

describe("DeclineLeaveDialog (AQ-13)", () => {
  it("declines without a comment, and says so", async () => {
    const onClose = jest.fn();
    render(<DeclineLeaveDialog target={target} onClose={onClose} />);
    expect(screen.getByText("Decline Rūta’s time off?")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Rūta sees this")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Decline" }));

    await waitFor(() => expect(mockReject).toHaveBeenCalledWith({ requestId: "r1" }));
    expect(showSuccess).toHaveBeenCalledWith("Time off declined");
    expect(onClose).toHaveBeenCalled();
  });

  it("sends the comment when there is one", async () => {
    render(<DeclineLeaveDialog target={target} onClose={jest.fn()} />);
    fireEvent.change(screen.getByLabelText(/Comment/), { target: { value: "Release week" } });
    fireEvent.click(screen.getByRole("button", { name: "Decline" }));
    await waitFor(() => expect(mockReject).toHaveBeenCalledWith({ requestId: "r1", comment: "Release week" }));
  });

  it("stays open with the refusal", async () => {
    mockReject.mockRejectedValue(new Error("Already decided"));
    const onClose = jest.fn();
    render(<DeclineLeaveDialog target={target} onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "Decline" }));
    expect(await screen.findByText(/Already decided|went wrong|Something/)).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });
});
