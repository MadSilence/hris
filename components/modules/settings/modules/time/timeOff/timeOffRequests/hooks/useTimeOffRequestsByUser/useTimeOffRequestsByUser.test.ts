import type { CapturedReactQueryOptions } from "@/test/types";
import { renderHook } from "@testing-library/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { timeOffRequestsService } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/services/timeOffRequestsService";
import {
  useInvalidateTimeOffRequestsQuery,
  useTimeOffRequestsByUser,
} from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useTimeOffRequestsByUser/useTimeOffRequestsByUser";
import {
  getTimeOffRequestsByUserQueryKey,
  TIME_OFF_QUERY_KEY,
} from "@/components/modules/settings/modules/time/timeOff/utils/timeOffQueryKeys";

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock(
  "@/components/modules/settings/modules/time/timeOff/timeOffRequests/services/timeOffRequestsService",
  () => ({
    timeOffRequestsService: { listByUserId: jest.fn() },
  })
);

describe("useTimeOffRequestsByUser", () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it("calls useQuery with requests query config", async () => {
    let capturedOpts!: CapturedReactQueryOptions;
    (useQuery as jest.Mock).mockImplementation((opts: CapturedReactQueryOptions) => { capturedOpts = opts; return {}; });

    renderHook(() => useTimeOffRequestsByUser({ userId: "user-id" }));

    expect(useQuery).toHaveBeenCalledWith({
      queryKey: getTimeOffRequestsByUserQueryKey("user-id"),
      queryFn: expect.any(Function),
      enabled: true,
    });

    await capturedOpts.queryFn();

    expect(timeOffRequestsService.listByUserId).toHaveBeenCalledWith("user-id");
  });
});

describe("useInvalidateTimeOffRequestsQuery", () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it("invalidates all requests", () => {
    const invalidateQueries = jest.fn();
    (useQueryClient as jest.Mock).mockReturnValue({ invalidateQueries });

    const { result } = renderHook(() => useInvalidateTimeOffRequestsQuery());

    result.current();

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: [TIME_OFF_QUERY_KEY, "requests"],
    });
  });
});
