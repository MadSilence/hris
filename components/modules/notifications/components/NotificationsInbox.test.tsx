import { fireEvent, render, screen } from "@testing-library/react";

import { NotificationsInbox } from "./NotificationsInbox";
import { useNotifications } from "@/components/modules/notifications/hooks/useNotifications";
import { partialMock } from "@/test/types";
import type { Notification } from "@/models/notifications";

const mockReplace = jest.fn();
let mockQuery = "";
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: mockReplace }),
  usePathname: () => "/inbox",
  useSearchParams: () => new URLSearchParams(mockQuery),
}));
jest.mock("@/components/modules/notifications/components/NotificationActions", () => ({ NotificationActions: () => null }));
jest.mock("@/components/modules/notifications/hooks/useNotifications", () => ({ useNotifications: jest.fn() }));
jest.mock("@/components/modules/notifications/hooks/useNotificationMutations", () => {
  const mutation = () => ({ mutate: jest.fn(), isPending: false });
  return {
    useDeleteNotification: mutation,
    useMarkAllNotificationsRead: mutation,
    useMarkAllNotificationsSeen: mutation,
    useMarkNotificationRead: mutation,
    useSetNotificationStarred: mutation,
  };
});

const answer = (over: Partial<ReturnType<typeof useNotifications>>) =>
  jest.mocked(useNotifications).mockReturnValue(partialMock<ReturnType<typeof useNotifications>>(over));

describe("NotificationsInbox", () => {
  // WALK_QUESTIONS § 17: before the first answer nothing is known, least of all that nothing is unread.
  it("does not say it is all caught up while it is still loading", () => {
    answer({ data: undefined, isLoading: true });
    render(<NotificationsInbox />);

    expect(screen.queryByText("You're all caught up")).not.toBeInTheDocument();
  });

  it("says so once the answer is an empty inbox", () => {
    answer({ data: [], isLoading: false });
    render(<NotificationsInbox />);

    expect(screen.getByText("You're all caught up")).toBeInTheDocument();
  });
});

const notification = (over: Partial<Notification>): Notification => ({
  id: "n", type: "TIMEOFF_APPROVAL_REQUESTED", category: "TIME_OFF", params: { requesterName: "Anna" },
  targetType: null, targetId: null, sourceType: null, sourceId: null, seen: true, read: true, starred: false,
  createdAt: new Date().toISOString(), source: null, ...over,
});

const open = { type: "TIME_OFF_REQUEST", id: "r", status: "PENDING", open: true, details: null };
const closed = { ...open, status: "APPROVED", open: false };

describe("NotificationsInbox — Needs Action (sitting 2, H5)", () => {
  beforeEach(() => {
    mockQuery = "";
  });

  it("opens on the filter the URL names and lists only questions still open for the reader", () => {
    mockQuery = "filter=needs-action";
    answer({
      isLoading: false,
      data: [
        notification({ id: "waiting", params: { requesterName: "Waiting Wanda" }, source: open, read: true }),
        notification({ id: "answered", params: { requesterName: "Answered Aron" }, source: closed, read: false }),
        notification({ id: "plain", type: "TIMEOFF_APPROVED", params: {}, source: null, read: false }),
      ],
    });
    render(<NotificationsInbox />);

    expect(screen.getByRole("button", { name: /Needs Action/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(/Waiting Wanda/)).toBeInTheDocument();
    expect(screen.queryByText(/Answered Aron/)).not.toBeInTheDocument();
    expect(screen.getAllByText(/requested/)).toHaveLength(1);
  });

  it("says nothing needs action when every question has been answered", () => {
    mockQuery = "filter=needs-action";
    answer({ isLoading: false, data: [notification({ source: closed })] });
    render(<NotificationsInbox />);

    expect(screen.getByText("Nothing needs your action.")).toBeInTheDocument();
  });

  it("puts the chosen filter in the URL, and takes it out for All", () => {
    answer({ isLoading: false, data: [] });
    render(<NotificationsInbox />);

    fireEvent.click(screen.getByRole("button", { name: /Needs Action/ }));
    expect(mockReplace).toHaveBeenLastCalledWith("/inbox?filter=needs-action", { scroll: false });

    fireEvent.click(screen.getByRole("button", { name: /^All/ }));
    expect(mockReplace).toHaveBeenLastCalledWith("/inbox", { scroll: false });
  });

  it("reads an unknown filter as All rather than an empty inbox", () => {
    mockQuery = "filter=whatever";
    answer({ isLoading: false, data: [notification({ source: closed })] });
    render(<NotificationsInbox />);

    expect(screen.getByRole("button", { name: /^All/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(/Anna/)).toBeInTheDocument();
  });
});
