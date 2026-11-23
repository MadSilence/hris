import { fireEvent, render, screen } from "@testing-library/react";

import { NotificationsInbox } from "./NotificationsInbox";
import { useInboxSummary, useNotificationPages } from "@/components/modules/notifications/hooks/useNotifications";
import { showUndoToast } from "@/lib/feedback/undoToast";
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
jest.mock("@/components/modules/notifications/hooks/useNotifications", () => ({
  useNotificationPages: jest.fn(),
  useInboxSummary: jest.fn(() => ({ data: undefined })),
}));
jest.mock("@/lib/feedback/undoToast", () => ({ showUndoToast: jest.fn() }));
const mockRemove = jest.fn();
jest.mock("@/components/modules/notifications/hooks/useNotificationMutations", () => {
  const mutation = () => ({ mutate: jest.fn(), isPending: false });
  return {
    useDeleteNotification: () => ({ mutate: mockRemove, isPending: false }),
    useMarkAllNotificationsRead: mutation,
    useMarkAllNotificationsSeen: mutation,
    useMarkNotificationRead: mutation,
    useSetNotificationStarred: mutation,
  };
});

type Pages = ReturnType<typeof useNotificationPages>;
/** The server answers one page with these lines (B5); nothing more to load. */
const answer = ({ data, isLoading }: { data: Notification[] | undefined; isLoading: boolean }) =>
  jest.mocked(useNotificationPages).mockReturnValue(
    // A loading and a loaded result are different members of react-query's union; the test states only what it reads.
    partialMock<Pages>({
      data: data === undefined ? undefined : partialMock<NonNullable<Pages["data"]>>({ pages: [{ items: data, nextCursor: null }] }),
      isLoading,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: jest.fn(),
    } as Partial<Pages>),
  );

beforeEach(() => {
  // No summary yet: the counts fall back to what is loaded (the mocks are reset between tests).
  jest.mocked(useInboxSummary).mockReturnValue(partialMock<ReturnType<typeof useInboxSummary>>({ data: undefined }));
});

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

describe("NotificationsInbox — Needs action (sitting 2, H5)", () => {
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

    expect(screen.getByRole("button", { name: /Needs action/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(/Waiting Wanda/)).toBeInTheDocument();
    expect(screen.queryByText(/Answered Aron/)).not.toBeInTheDocument();
    expect(screen.getAllByText(/ requested \d/)).toHaveLength(1);
  });

  it("says nothing needs action when every question has been answered", () => {
    mockQuery = "filter=needs-action";
    answer({ isLoading: false, data: [notification({ source: closed })] });
    render(<NotificationsInbox />);

    expect(screen.getByText("Nothing needs your action")).toBeInTheDocument();
  });

  it("puts the chosen filter in the URL, and takes it out for All", () => {
    answer({ isLoading: false, data: [] });
    render(<NotificationsInbox />);

    fireEvent.click(screen.getByRole("button", { name: /Needs action/ }));
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

describe("NotificationsInbox — paging and delete (B5, B2)", () => {
  beforeEach(() => {
    mockQuery = "";
    mockRemove.mockClear();
    jest.mocked(showUndoToast).mockClear();
  });

  it("asks the server for the filter the URL names, and counts from its summary of the whole inbox", () => {
    mockQuery = "filter=unread";
    jest.mocked(useInboxSummary).mockReturnValue(
      partialMock<ReturnType<typeof useInboxSummary>>({ data: { all: 120, unread: 7, starred: 1, needsAction: 3, categories: [] } }),
    );
    answer({ isLoading: false, data: [notification({ read: false })] });
    render(<NotificationsInbox />);

    expect(useNotificationPages).toHaveBeenCalledWith("unread", null);
    expect(screen.getByRole("button", { name: /^All/ })).toHaveTextContent("120");
    expect(screen.getByRole("button", { name: /Needs action/ })).toHaveTextContent("3");
  });

  it("hides a deleted line at once and deletes it only when the Undo window ends", () => {
    answer({ isLoading: false, data: [notification({ id: "gone", params: { requesterName: "Deleted Dora" } })] });
    render(<NotificationsInbox />);

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(screen.queryByText(/Deleted Dora/)).not.toBeInTheDocument();
    expect(mockRemove).not.toHaveBeenCalled();

    jest.mocked(showUndoToast).mock.calls[0][0].onExpire?.();
    expect(mockRemove).toHaveBeenCalledWith("gone");
  });
});
