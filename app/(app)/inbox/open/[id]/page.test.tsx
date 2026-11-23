import { presentNotification } from "@/components/modules/notifications/components/notificationPresenter";
import type { Notification } from "@/models/notifications";
import OpenNotificationPage from "./page";

/** `redirect` ends the render in Next by throwing; the stand-in does the same so the page stops where it would. */
class Redirected extends Error {
  constructor(readonly to: string) {
    super(`redirect ${to}`);
  }
}

const redirect = jest.fn();
const getLocale = jest.fn();
const markRead = jest.fn();

jest.mock("next/navigation", () => ({
  redirect: (to: string) => {
    redirect(to);
    throw new Redirected(to);
  },
}));

jest.mock("next-intl/server", () => ({
  ...jest.requireActual("next-intl/server"),
  getLocale: () => getLocale(),
}));

jest.mock("@/api/modules/notifications/services", () => ({
  hrisNotificationsService: { markRead: (...args: unknown[]) => markRead(...args) },
}));

// The real presenter, watched — the page must go where the inbox would, and say in which language.
jest.mock("@/components/modules/notifications/components/notificationPresenter", () => {
  const actual = jest.requireActual("@/components/modules/notifications/components/notificationPresenter");
  return { ...actual, presentNotification: jest.fn(actual.presentNotification) };
});

const presentNotificationMock = jest.mocked(presentNotification);

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
  read: true,
  starred: false,
  createdAt: "2026-11-10T08:00:00Z",
  source: null,
  ...over,
});

/** Opens the page and answers where it sent the reader. */
const open = async (id: string): Promise<string> => {
  try {
    await OpenNotificationPage({ params: Promise.resolve({ id }) });
  } catch (e) {
    if (e instanceof Redirected) return e.to;
    throw e;
  }
  throw new Error("the page did not redirect");
};

beforeEach(() => {
  getLocale.mockResolvedValue("en");
  presentNotificationMock.mockImplementation(
    jest.requireActual("@/components/modules/notifications/components/notificationPresenter").presentNotification,
  );
});

describe("/inbox/open/[id]", () => {
  it("marks the notification read and opens the request an approval asks about", async () => {
    markRead.mockResolvedValue(notification());

    expect(await open("n-1")).toBe("/dashboard?leaveRequest=req-1");
    expect(markRead).toHaveBeenCalledWith("n-1");
    expect(redirect).toHaveBeenCalledTimes(1);
  });

  it("opens the tasks for a document request", async () => {
    markRead.mockResolvedValue(
      notification({ type: "DOCUMENT_REQUESTED", category: "DOCUMENTS", params: { title: "Passport" }, targetType: null, targetId: null }),
    );

    expect(await open("n-2")).toBe("/tasks");
  });

  it("opens the request in full over Home for an approved request", async () => {
    markRead.mockResolvedValue(notification({ type: "TIMEOFF_REQUEST_APPROVED" }));

    expect(await open("n-3")).toBe("/dashboard?leaveRequest=req-1");
  });

  it("lands in the inbox when the type has nowhere to go", async () => {
    markRead.mockResolvedValue(
      notification({ type: "TIMEOFF_REQUEST_APPROVED", params: {}, targetType: null, targetId: null, sourceType: null, sourceId: null }),
    );

    expect(await open("n-4")).toBe("/inbox");
  });

  it("lands in the inbox when the notification is gone or not the reader's", async () => {
    markRead.mockRejectedValue(new Error("404"));

    expect(await open("missing")).toBe("/inbox");
    expect(presentNotificationMock).not.toHaveBeenCalled();
  });

  it("lands in the inbox when marking read answers nothing", async () => {
    markRead.mockResolvedValue(null);

    expect(await open("n-5")).toBe("/inbox");
  });

  it("presents the notification in the page's language", async () => {
    getLocale.mockResolvedValue("ru");
    const n = notification();
    markRead.mockResolvedValue(n);

    await open("n-1");

    expect(presentNotificationMock).toHaveBeenCalledWith(n, expect.any(Function), "ru");
  });

  it("presents the pseudo-locale as English", async () => {
    getLocale.mockResolvedValue("en-XA");
    markRead.mockResolvedValue(notification());

    await open("n-1");

    expect(presentNotificationMock).toHaveBeenCalledWith(expect.anything(), expect.any(Function), "en");
  });
});
