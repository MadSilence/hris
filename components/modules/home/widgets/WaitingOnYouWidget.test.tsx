import { render, screen } from "@testing-library/react";
import { useQuery } from "@tanstack/react-query";
import { WaitingOnYouWidget } from "./WaitingOnYouWidget";
import { useTimeOffRequestsAwaitingMe } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useTimeOffRequestsAwaitingMe";
import { TimeOffRequestStatus, type TimeOffRequest } from "@/models/timeOff";
import { partialMock } from "@/test/types";

jest.mock("@tanstack/react-query", () => ({ useQuery: jest.fn() }));
jest.mock("@/components/providers/AppDataProvider", () => ({ useAppDataContext: () => ({ internalApiClient: {} }) }));
jest.mock("@/components/modules/timeOffDecision", () => ({ timeOffDecisionQueryKey: (id: string) => ["CTX", id] }));
jest.mock(
  "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useTimeOffRequestsAwaitingMe",
  () => ({ useTimeOffRequestsAwaitingMe: jest.fn() }),
);

const request = (id: string, createdAt: string): TimeOffRequest => partialMock<TimeOffRequest>({
  id, status: TimeOffRequestStatus.Pending, startDate: "2026-11-02", endDate: "2026-11-03", requestedAmount: 2, createdAt,
});

const waiting = (data: TimeOffRequest[] | undefined, over: object = {}) =>
  jest.mocked(useTimeOffRequestsAwaitingMe).mockReturnValue(
    partialMock<ReturnType<typeof useTimeOffRequestsAwaitingMe>>({ isLoading: false, error: null, data, ...over }),
  );

beforeEach(() => {
  jest.mocked(useQuery).mockReturnValue(partialMock<ReturnType<typeof useQuery>>({
    isLoading: false, data: { requesterName: "Anna Kowalska" },
  }));
});

describe("WaitingOnYouWidget", () => {
  it("is not drawn while nothing waits", () => {
    waiting([]);
    const { container } = render(<WaitingOnYouWidget />);

    expect(container).toBeEmptyDOMElement();
  });

  it("lists the newest five, each opening its decision page, and sends See All to the inbox's Needs Action", () => {
    waiting(Array.from({ length: 7 }, (_, i) => request(`r${i}`, `2026-10-2${i}T10:00:00`)));
    render(<WaitingOnYouWidget />);

    const rows = screen.getAllByRole("link").filter((link) => link.getAttribute("href")?.startsWith("/time-off/requests/"));
    expect(rows.map((link) => link.getAttribute("href"))).toEqual([
      "/time-off/requests/r6", "/time-off/requests/r5", "/time-off/requests/r4", "/time-off/requests/r3", "/time-off/requests/r2",
    ]);
    expect(screen.getByRole("link", { name: "See All (7)" })).toHaveAttribute("href", "/inbox?filter=needs-action");
    expect(screen.getAllByText("Anna Kowalska")).toHaveLength(5);
  });
});
