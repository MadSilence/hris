import type { CapturedReactQueryOptions } from "@/test/types";
import { renderHook } from "@testing-library/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { timeOffPolicyAssignmentsService } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyAssignments/services/timeOffPolicyAssignmentsService";
import {
  useInvalidateTimeOffPolicyAssignmentsQuery,
  useTimeOffPolicyAssignments,
} from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyAssignments/hooks/useTimeOffPolicyAssignments/useTimeOffPolicyAssignments";
import { getTimeOffPolicyAssignmentsQueryKey } from "@/components/modules/settings/modules/time/timeOff/utils/timeOffQueryKeys";

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock(
  "@/components/modules/settings/modules/time/timeOff/timeOffPolicyAssignments/services/timeOffPolicyAssignmentsService",
  () => ({
    timeOffPolicyAssignmentsService: { listByPolicyId: jest.fn() },
  })
);

describe("useTimeOffPolicyAssignments", () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it("calls useQuery with assignments query config", async () => {
    let capturedOpts!: CapturedReactQueryOptions;
    (useQuery as jest.Mock).mockImplementation((opts: CapturedReactQueryOptions) => { capturedOpts = opts; return {}; });

    renderHook(() => useTimeOffPolicyAssignments({ policyId: "policy-id" }));

    expect(useQuery).toHaveBeenCalledWith({
      queryKey: getTimeOffPolicyAssignmentsQueryKey("policy-id"),
      queryFn: expect.any(Function),
      enabled: true,
    });

    await capturedOpts.queryFn();

    expect(timeOffPolicyAssignmentsService.listByPolicyId).toHaveBeenCalledWith("policy-id");
  });
});

describe("useInvalidateTimeOffPolicyAssignmentsQuery", () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it("invalidates assignments for a specific policy", () => {
    const invalidateQueries = jest.fn();
    (useQueryClient as jest.Mock).mockReturnValue({ invalidateQueries });

    const { result } = renderHook(() => useInvalidateTimeOffPolicyAssignmentsQuery());

    result.current("policy-id");

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: getTimeOffPolicyAssignmentsQueryKey("policy-id"),
    });
  });
});
