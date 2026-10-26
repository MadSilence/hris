import { render, screen } from "@testing-library/react";

import { NotificationsInbox } from "./NotificationsInbox";
import { useNotifications } from "@/components/modules/notifications/hooks/useNotifications";
import { partialMock } from "@/test/types";

jest.mock("next/navigation", () => ({ useRouter: () => ({ push: jest.fn() }) }));
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
