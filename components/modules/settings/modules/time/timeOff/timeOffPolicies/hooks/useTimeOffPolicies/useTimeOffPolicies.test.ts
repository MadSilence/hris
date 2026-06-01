import { renderHook } from "@testing-library/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { timeOffPoliciesService } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/services/timeOffPoliciesService";
import {
  useInvalidateTimeOffPoliciesQuery,
  useTimeOffPolicies,
} from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useTimeOffPolicies/useTimeOffPolicies";
import {
  getTimeOffPoliciesQueryKey,
  TIME_OFF_QUERY_KEY,
} from "@/components/modules/settings/modules/time/timeOff/utils/timeOffQueryKeys";

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock(
  "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/services/timeOffPoliciesService",
  () => ({
    timeOffPoliciesService: { list: jest.fn() },
  })
);

describe("useTimeOffPolicies", () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it("calls useQuery with policies query config", async () => {
    let capturedOpts: any;

    (useQuery as jest.Mock).mockImplementation((opts: any) => {
      capturedOpts = opts;
      return {};
    });

    renderHook(() => useTimeOffPolicies());

    expect(useQuery).toHaveBeenCalledWith({
      queryKey: getTimeOffPoliciesQueryKey(),
      queryFn: expect.any(Function),
    });

    await capturedOpts.queryFn();

    expect(timeOffPoliciesService.list).toHaveBeenCalledWith();
  });
});

describe("useInvalidateTimeOffPoliciesQuery", () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it("invalidates time off policies query", () => {
    const invalidateQueries = jest.fn();

    (useQueryClient as jest.Mock).mockReturnValue({ invalidateQueries });

    const { result } = renderHook(() => useInvalidateTimeOffPoliciesQuery());

    result.current();

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: [TIME_OFF_QUERY_KEY, "policies"],
    });
  });
});
