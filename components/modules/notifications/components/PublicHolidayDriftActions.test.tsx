import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Notification } from "@/models/notifications";
import { PublicHolidayDriftActions, describeDriftChange } from "./PublicHolidayDriftActions";

const applyMutateAsync = jest.fn();
const dismissMutateAsync = jest.fn();
const invalidateNotifications = jest.fn();
const markRead = jest.fn();

jest.mock(
  "@/components/modules/settings/modules/time/publicHolidays/hooks/usePublicHolidayDrift",
  () => ({
    useApplyPublicHolidayDrift: () => ({ mutateAsync: applyMutateAsync, isPending: false }),
    useDismissPublicHolidayDrift: () => ({ mutateAsync: dismissMutateAsync, isPending: false }),
  }),
);
jest.mock("@/components/modules/notifications/hooks/useNotifications", () => ({
  useInvalidateNotifications: () => invalidateNotifications,
}));
jest.mock("@/components/modules/notifications/hooks/useNotificationMutations", () => ({
  useMarkNotificationRead: () => ({ mutate: markRead }),
}));
jest.mock("@/lib/errors/errorToast", () => ({ showError: jest.fn() }));

const notification = (source: Notification["source"]): Notification => ({
  id: "n-1",
  type: "PUBLIC_HOLIDAY_CALENDAR_SOURCE_DRIFT",
  category: "POLICIES",
  params: { calendarName: "United Kingdom", year: 2026 },
  targetType: "PUBLIC_HOLIDAY_CALENDAR",
  targetId: "calendar-1",
  sourceType: "PUBLIC_HOLIDAY_DRIFT",
  sourceId: "drift-1",
  seen: true,
  read: false,
  starred: false,
  createdAt: "2026-09-21T08:00:00Z",
  source,
});

const openDrift = (details: Record<string, unknown>) =>
  notification({ type: "PUBLIC_HOLIDAY_DRIFT", id: "drift-1", status: "OPEN", open: true, details });

const details = {
  changes: [
    {
      kind: "MOVED",
      name: "Early May Bank Holiday",
      previousName: "Early May Bank Holiday",
      start: "2026-05-08",
      end: "2026-05-08",
      previousStart: "2026-05-04",
      previousEnd: "2026-05-04",
    },
  ],
  changeCount: 1,
  peopleOnCalendar: 12,
  affectedRequests: [
    {
      requestId: "r-1",
      userId: "u-1",
      personName: "Anna Smith",
      startDate: "2026-05-04",
      endDate: "2026-05-08",
      status: "APPROVED",
    },
  ],
  affectedRequestCount: 3,
};

describe("PublicHolidayDriftActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows what changed, who observes the calendar and whose leave it touches", () => {
    render(<PublicHolidayDriftActions notification={openDrift(details)} />);

    expect(screen.getByText(/Moved: Early May Bank Holiday/)).toBeInTheDocument();
    expect(screen.getByText(/12 people observe this calendar/)).toBeInTheDocument();
    expect(screen.getByText(/3 leave requests touch the changed days/)).toBeInTheDocument();
    expect(screen.getByText(/Anna Smith/)).toBeInTheDocument();
    // Two of the three belong to people this reader may not see: counted, never named.
    expect(screen.getByText(/and 2 requests by people whose leave you cannot see/)).toBeInTheDocument();
  });

  it("applies the drift, then refreshes the inbox and marks the question read", async () => {
    applyMutateAsync.mockResolvedValue({
      driftId: "drift-1",
      calendarId: "calendar-1",
      year: 2026,
      applied: 1,
      skipped: [],
      recalculatedRequests: 3,
      requestsLeftUnchanged: 0,
    });

    render(<PublicHolidayDriftActions notification={openDrift(details)} />);
    await userEvent.click(screen.getByRole("button", { name: /Apply Changes/ }));

    expect(applyMutateAsync).toHaveBeenCalledWith({ driftId: "drift-1" });
    expect(invalidateNotifications).toHaveBeenCalled();
    expect(markRead).toHaveBeenCalledWith("n-1");
  });

  it("dismisses the drift without applying anything", async () => {
    dismissMutateAsync.mockResolvedValue(undefined);

    render(<PublicHolidayDriftActions notification={openDrift(details)} />);
    await userEvent.click(screen.getByRole("button", { name: /Dismiss/ }));

    expect(dismissMutateAsync).toHaveBeenCalledWith({ driftId: "drift-1" });
    expect(applyMutateAsync).not.toHaveBeenCalled();
  });

  it("says nobody's leave is touched when none is", () => {
    render(
      <PublicHolidayDriftActions
        notification={openDrift({ ...details, affectedRequests: [], affectedRequestCount: 0 })}
      />,
    );

    expect(screen.getByText(/No leave touches the changed days/)).toBeInTheDocument();
  });

  it("shows the outcome instead of the buttons once somebody answered", () => {
    render(
      <PublicHolidayDriftActions
        notification={notification({ type: "PUBLIC_HOLIDAY_DRIFT", id: "drift-1", status: "DISMISSED", open: false, details: null })}
      />,
    );

    expect(screen.getByText("Dismissed")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

describe("describeDriftChange", () => {
  it("names a rename as a rename", () => {
    expect(
      describeDriftChange({
        kind: "CHANGED",
        name: "King's Birthday",
        previousName: "Queen's Birthday",
        start: "2026-06-08",
        end: "2026-06-08",
        previousStart: "2026-06-08",
        previousEnd: "2026-06-08",
      }),
    ).toBe("Renamed: Queen's Birthday → King's Birthday");
  });

  it("names a dropped day with its old date", () => {
    expect(
      describeDriftChange({
        kind: "REMOVED",
        name: "Summer Bank Holiday",
        previousName: "Summer Bank Holiday",
        start: null,
        end: null,
        previousStart: "2026-08-31",
        previousEnd: "2026-08-31",
      }),
    ).toMatch(/^No longer a holiday: Summer Bank Holiday, /);
  });
});
