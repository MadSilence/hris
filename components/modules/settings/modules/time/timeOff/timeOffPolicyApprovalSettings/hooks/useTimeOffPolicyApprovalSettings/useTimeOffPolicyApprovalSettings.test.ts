import { renderHook } from "@testing-library/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { timeOffPolicyApprovalSettingsService } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyApprovalSettings/services/timeOffPolicyApprovalSettingsService";
import {
  useInvalidateTimeOffPolicyApprovalSettingsQuery,
  useTimeOffPolicyApprovalSettings,
} from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyApprovalSettings/hooks/useTimeOffPolicyApprovalSettings/useTimeOffPolicyApprovalSettings";
import { getTimeOffPolicyApprovalSettingsQueryKey } from "@/components/modules/settings/modules/time/timeOff/utils/timeOffQueryKeys";

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock(
  "@/components/modules/settings/modules/time/timeOff/timeOffPolicyApprovalSettings/services/timeOffPolicyApprovalSettingsService",
  () => ({
    timeOffPolicyApprovalSettingsService: { getByPolicyId: jest.fn() },
  })
);

describe("useTimeOffPolicyApprovalSettings", () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it("calls useQuery with approval settings query config", async () => {
    let capturedOpts: any;
    (useQuery as jest.Mock).mockImplementation((opts: any) => { capturedOpts = opts; return {}; });

    renderHook(() => useTimeOffPolicyApprovalSettings({ policyId: "policy-id" }));

    expect(useQuery).toHaveBeenCalledWith({
      queryKey: getTimeOffPolicyApprovalSettingsQueryKey("policy-id"),
      queryFn: expect.any(Function),
      enabled: true,
    });

    await capturedOpts.queryFn();

    expect(timeOffPolicyApprovalSettingsService.getByPolicyId).toHaveBeenCalledWith("policy-id");
  });
});

describe("useInvalidateTimeOffPolicyApprovalSettingsQuery", () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it("invalidates approval settings for a specific policy", () => {
    const invalidateQueries = jest.fn();
    (useQueryClient as jest.Mock).mockReturnValue({ invalidateQueries });

    const { result } = renderHook(() => useInvalidateTimeOffPolicyApprovalSettingsQuery());

    result.current("policy-id");

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: getTimeOffPolicyApprovalSettingsQueryKey("policy-id"),
    });
  });
});
