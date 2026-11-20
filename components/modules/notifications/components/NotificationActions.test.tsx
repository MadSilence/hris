import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Notification, NotificationSourceProjection } from "@/models/notifications";
import { NotificationActions } from "./NotificationActions";

const approveMutateAsync = jest.fn();
const rejectMutateAsync = jest.fn();
const decideMutateAsync = jest.fn();
const invalidateNotifications = jest.fn();
const markRead = jest.fn();
const showError = jest.fn();

/** Which of the three mutations reports itself in flight. */
const pending = { approve: false, reject: false, decide: false };

jest.mock(
  "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useApproveTimeOffRequest",
  () => ({
    useApproveTimeOffRequest: () => ({
      mutateAsync: (...args: unknown[]) => approveMutateAsync(...args),
      isPending: pending.approve,
    }),
  }),
);
jest.mock(
  "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useRejectTimeOffRequest",
  () => ({
    useRejectTimeOffRequest: () => ({
      mutateAsync: (...args: unknown[]) => rejectMutateAsync(...args),
      isPending: pending.reject,
    }),
  }),
);
jest.mock(
  "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useDecideCancellation",
  () => ({
    useDecideCancellation: () => ({
      mutateAsync: (...args: unknown[]) => decideMutateAsync(...args),
      isPending: pending.decide,
    }),
  }),
);
jest.mock("@/components/modules/notifications/hooks/useNotifications", () => ({
  useInvalidateNotifications: () => (...args: unknown[]) => invalidateNotifications(...args),
}));
jest.mock("@/components/modules/notifications/hooks/useNotificationMutations", () => ({
  useMarkNotificationRead: () => ({ mutate: (...args: unknown[]) => markRead(...args) }),
}));
jest.mock("@/lib/errors/errorToast", () => ({
  showError: (...args: unknown[]) => showError(...args),
}));
jest.mock("@/components/modules/notifications/components/PublicHolidayDriftActions", () => ({
  PublicHolidayDriftActions: () => <div>drift actions</div>,
}));
jest.mock("@/components/modules/notifications/components/TaskSourceActions", () => ({
  ...jest.requireActual("@/components/modules/notifications/components/TaskSourceActions"),
  TaskSourceActions: () => <div>task actions</div>,
}));

const source = (over: Partial<NotificationSourceProjection> = {}): NotificationSourceProjection => ({
  type: "TIME_OFF_REQUEST",
  id: "req-1",
  status: "PENDING",
  open: true,
  details: null,
  ...over,
});

const notification = (over: Partial<Notification> = {}): Notification => ({
  id: "n-1",
  type: "TIMEOFF_APPROVAL_REQUESTED",
  category: "APPROVALS",
  params: { requesterId: "user-7", requesterName: "Anna Smith" },
  targetType: "TIME_OFF_REQUEST",
  targetId: "req-1",
  sourceType: "TIME_OFF_REQUEST",
  sourceId: "req-1",
  seen: true,
  read: false,
  starred: false,
  createdAt: "2026-11-10T08:00:00Z",
  source: source(),
  ...over,
});

const cancellation = (over: Partial<Notification> = {}) =>
  notification({ type: "TIMEOFF_CANCELLATION_REQUESTED", ...over });

beforeEach(() => {
  pending.approve = false;
  pending.reject = false;
  pending.decide = false;
});

describe("NotificationActions — which controls a line gets", () => {
  it("hands a holiday drift to its own controls", () => {
    render(<NotificationActions notification={notification({ type: "PUBLIC_HOLIDAY_CALENDAR_SOURCE_DRIFT" })} />);

    expect(screen.getByText("drift actions")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Approve" })).not.toBeInTheDocument();
  });

  it("hands a task source to the task controls", () => {
    render(
      <NotificationActions
        notification={notification({ type: "TASK_ASSIGNED", source: source({ type: "TASK", id: "task-1" }) })}
      />,
    );

    expect(screen.getByText("task actions")).toBeInTheDocument();
  });

  it("renders nothing for a type that asks nothing", () => {
    const { container } = render(<NotificationActions notification={notification({ type: "TIMEOFF_REQUEST_APPROVED" })} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing for an actionable type with no live source", () => {
    const { container } = render(<NotificationActions notification={notification({ source: null })} />);

    expect(container).toBeEmptyDOMElement();
  });
});

describe("NotificationActions — a closed question shows its outcome", () => {
  it.each([
    ["APPROVED", "Approved"],
    ["APPROVED_BY_YOU", "You approved · waiting for the rest of the chain"],
    ["CANCELLATION_PENDING", "Approved"],
    ["REJECTED", "Rejected"],
    ["CANCELLED", "Cancelled"],
  ])("an approval request in %s reads as %s", (status, text) => {
    render(<NotificationActions notification={notification({ source: source({ open: false, status }) })} />);

    expect(screen.getByText(text)).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it.each([
    ["CANCELLED", "Cancellation approved"],
    ["APPROVED", "Cancellation declined"],
  ])("a cancellation request in %s reads as %s", (status, text) => {
    render(<NotificationActions notification={cancellation({ source: source({ open: false, status }) })} />);

    expect(screen.getByText(text)).toBeInTheDocument();
  });

  it("shows nothing for a closed status it has no words for", () => {
    const { container } = render(
      <NotificationActions notification={cancellation({ source: source({ open: false, status: "REJECTED" }) })} />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});

describe("NotificationActions — approving and rejecting a request", () => {
  it("approves, refreshes the inbox and marks the line read", async () => {
    approveMutateAsync.mockResolvedValue(undefined);
    render(<NotificationActions notification={notification()} />);

    await userEvent.click(screen.getByRole("button", { name: "Approve" }));

    expect(approveMutateAsync).toHaveBeenCalledWith({ requestId: "req-1" });
    await waitFor(() => expect(markRead).toHaveBeenCalledWith("n-1"));
    expect(invalidateNotifications).toHaveBeenCalled();
  });

  it("does not mark an already read line read again", async () => {
    approveMutateAsync.mockResolvedValue(undefined);
    render(<NotificationActions notification={notification({ read: true })} />);

    await userEvent.click(screen.getByRole("button", { name: "Approve" }));

    await waitFor(() => expect(invalidateNotifications).toHaveBeenCalled());
    expect(markRead).not.toHaveBeenCalled();
  });

  it("on a refusal shows the error and re-reads the inbox without marking it read", async () => {
    const refusal = new Error("already decided");
    approveMutateAsync.mockRejectedValue(refusal);
    render(<NotificationActions notification={notification()} />);

    await userEvent.click(screen.getByRole("button", { name: "Approve" }));

    await waitFor(() => expect(showError).toHaveBeenCalledWith(refusal));
    expect(invalidateNotifications).toHaveBeenCalled();
    expect(markRead).not.toHaveBeenCalled();
  });

  it("asks for a reason before it rejects", async () => {
    render(<NotificationActions notification={notification()} />);

    await userEvent.click(screen.getByRole("button", { name: "Reject" }));
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.queryByText("This field is required")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Reject" }));

    expect(screen.getByText("This field is required")).toBeInTheDocument();
    expect(rejectMutateAsync).not.toHaveBeenCalled();
  });

  it("rejects with the trimmed reason and closes the field", async () => {
    rejectMutateAsync.mockResolvedValue(undefined);
    render(<NotificationActions notification={notification()} />);

    await userEvent.click(screen.getByRole("button", { name: "Reject" }));
    await userEvent.type(screen.getByRole("textbox"), "  Team is short that week  ");
    await userEvent.click(screen.getByRole("button", { name: "Reject" }));

    expect(rejectMutateAsync).toHaveBeenCalledWith({ requestId: "req-1", rejectionReason: "Team is short that week" });
    await waitFor(() => expect(screen.queryByRole("textbox")).not.toBeInTheDocument());
    expect(markRead).toHaveBeenCalledWith("n-1");
  });

  it("keeps the reason on screen when the rejection is refused", async () => {
    rejectMutateAsync.mockRejectedValue(new Error("refused"));
    render(<NotificationActions notification={notification()} />);

    await userEvent.click(screen.getByRole("button", { name: "Reject" }));
    await userEvent.type(screen.getByRole("textbox"), "No");
    await userEvent.click(screen.getByRole("button", { name: "Reject" }));

    await waitFor(() => expect(showError).toHaveBeenCalled());
    expect(screen.getByRole("textbox")).toHaveValue("No");
  });

  it("Cancel goes back to the two buttons", async () => {
    render(<NotificationActions notification={notification()} />);

    await userEvent.click(screen.getByRole("button", { name: "Reject" }));
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Approve" })).toBeInTheDocument();
  });

  it("disables the buttons while an answer is in flight", () => {
    pending.approve = true;
    render(<NotificationActions notification={notification()} />);

    expect(screen.getByRole("button", { name: "Approve" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Reject" })).toBeDisabled();
  });
});

describe("NotificationActions — answering a cancellation", () => {
  it("approves the cancellation for the requester", async () => {
    decideMutateAsync.mockResolvedValue(undefined);
    render(<NotificationActions notification={cancellation()} />);

    await userEvent.click(screen.getByRole("button", { name: "Approve cancellation" }));

    expect(decideMutateAsync).toHaveBeenCalledWith({ requestId: "req-1", userId: "user-7", decision: "CONFIRM" });
    await waitFor(() => expect(markRead).toHaveBeenCalledWith("n-1"));
  });

  it("declines the cancellation", async () => {
    decideMutateAsync.mockResolvedValue(undefined);
    render(<NotificationActions notification={cancellation()} />);

    await userEvent.click(screen.getByRole("button", { name: "Decline" }));

    expect(decideMutateAsync).toHaveBeenCalledWith({ requestId: "req-1", userId: "user-7", decision: "DECLINE" });
  });

  it("disables both while the decision is in flight", () => {
    pending.decide = true;
    render(<NotificationActions notification={cancellation()} />);

    expect(screen.getByRole("button", { name: "Approve cancellation" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Decline" })).toBeDisabled();
  });
});
