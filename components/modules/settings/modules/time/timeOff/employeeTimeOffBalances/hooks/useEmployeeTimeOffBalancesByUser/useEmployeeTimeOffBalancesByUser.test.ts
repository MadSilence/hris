import { renderHook } from "@testing-library/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { employeeTimeOffBalancesService } from "@/components/modules/settings/modules/time/timeOff/employeeTimeOffBalances/services/employeeTimeOffBalancesService";
import {
  useEmployeeTimeOffBalancesByUser,
  useInvalidateEmployeeTimeOffBalancesQuery,
} from "@/components/modules/settings/modules/time/timeOff/employeeTimeOffBalances/hooks/useEmployeeTimeOffBalancesByUser/useEmployeeTimeOffBalancesByUser";
import {
  getEmployeeTimeOffBalancesByUserQueryKey,
  TIME_OFF_QUERY_KEY,
} from "@/components/modules/settings/modules/time/timeOff/utils/timeOffQueryKeys";

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock(
  "@/components/modules/settings/modules/time/timeOff/employeeTimeOffBalances/services/employeeTimeOffBalancesService",
  () => ({
    employeeTimeOffBalancesService: { listByUserId: jest.fn() },
  })
);

describe("useEmployeeTimeOffBalancesByUser", () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it("calls useQuery with balances query config", async () => {
    let capturedOpts: any;
    (useQuery as jest.Mock).mockImplementation((opts: any) => { capturedOpts = opts; return {}; });

    renderHook(() => useEmployeeTimeOffBalancesByUser({ userId: "user-id" }));

    expect(useQuery).toHaveBeenCalledWith({
      queryKey: getEmployeeTimeOffBalancesByUserQueryKey("user-id"),
      queryFn: expect.any(Function),
      enabled: true,
    });

    await capturedOpts.queryFn();

    expect(employeeTimeOffBalancesService.listByUserId).toHaveBeenCalledWith("user-id");
  });
});

describe("useInvalidateEmployeeTimeOffBalancesQuery", () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it("invalidates all balances", () => {
    const invalidateQueries = jest.fn();
    (useQueryClient as jest.Mock).mockReturnValue({ invalidateQueries });

    const { result } = renderHook(() => useInvalidateEmployeeTimeOffBalancesQuery());

    result.current();

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: [TIME_OFF_QUERY_KEY, "balances"],
    });
  });
});
