import { render } from "@testing-library/react";
import { partialMock } from "@/test/types";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider/CurrentUserProvider";
import { useEmployeeTimeOffBalancesByUser } from "@/components/modules/settings/modules/time/timeOff/employeeTimeOffBalances/hooks/useEmployeeTimeOffBalancesByUser";
import { RequestTimeOffModal } from "@/components/modules/calendar/components/UserTimeOffBalances/RequestTimeOffModal";
import { BoardRequestTimeOff } from "@/components/modules/calendar/components/CompanyCalendarBoardContainer/BoardRequestTimeOff";

jest.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: jest.fn() }),
}));
jest.mock("@/components/providers/CurrentUserProvider/CurrentUserProvider", () => ({
  useCurrentUser: jest.fn(),
}));
jest.mock(
  "@/components/modules/settings/modules/time/timeOff/employeeTimeOffBalances/hooks/useEmployeeTimeOffBalancesByUser",
  () => ({ useEmployeeTimeOffBalancesByUser: jest.fn() }),
);
jest.mock("@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useTimeOffPolicies", () => ({
  useTimeOffPolicies: () => ({ data: [] }),
}));
jest.mock("@/components/modules/calendar/components/UserTimeOffBalances/RequestTimeOffModal", () => ({
  RequestTimeOffModal: jest.fn(() => null),
}));

const modal = RequestTimeOffModal as unknown as jest.Mock;
const request = { userId: "jack", name: "Jack White", start: "2026-11-11", end: "2026-11-13" };

/**
 * Filing leave on a colleague's row opened the same "Request time off" as one's own, with the colleague's
 * balance beside it and nothing saying whose (walk of 2026-10-30).
 */
describe("BoardRequestTimeOff — whose request", () => {
  beforeEach(() => {
    modal.mockClear();
    jest.mocked(useEmployeeTimeOffBalancesByUser).mockReturnValue(
      partialMock<ReturnType<typeof useEmployeeTimeOffBalancesByUser>>({
        data: [partialMock({ policyId: "p1" })],
        isLoading: false,
        isError: false,
      }),
    );
  });

  it("names the colleague on someone else's row", () => {
    jest.mocked(useCurrentUser).mockReturnValue(partialMock({ userId: "hr" }));
    render(<BoardRequestTimeOff request={request} onClose={jest.fn()} />);
    expect(modal.mock.calls[0][0]).toMatchObject({ userId: "jack", forName: "Jack White" });
  });

  it("names nobody on one's own row", () => {
    jest.mocked(useCurrentUser).mockReturnValue(partialMock({ userId: "jack" }));
    render(<BoardRequestTimeOff request={request} onClose={jest.fn()} />);
    expect(modal.mock.calls[0][0].forName).toBeUndefined();
  });
});
