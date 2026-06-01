import { act, renderHook } from "@testing-library/react";
import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import { createTimeOffPolicyAction } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/actions/createTimeOffPolicyAction";
import { useInvalidateTimeOffPoliciesQuery } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useTimeOffPolicies";
import { useCreateTimeOffPolicy } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useCreateTimeOffPolicy/useCreateTimeOffPolicy";

jest.mock("@tanstack/react-query", () => ({ useMutation: jest.fn() }));

jest.mock(
  "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/actions/createTimeOffPolicyAction",
  () => ({ createTimeOffPolicyAction: jest.fn() })
);

jest.mock(
  "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useTimeOffPolicies",
  () => ({ useInvalidateTimeOffPoliciesQuery: jest.fn() })
);

describe("useCreateTimeOffPolicy", () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it("calls action and invalidates on success", async () => {
    const invalidate = jest.fn();
    (useInvalidateTimeOffPoliciesQuery as jest.Mock).mockReturnValue(invalidate);
    (createTimeOffPolicyAction as jest.Mock).mockResolvedValue({ status: ActionStatus.SUCCESS, data: { id: "policy-id" } });

    let capturedOpts: any;
    (useMutation as jest.Mock).mockImplementation((opts: any) => {
      capturedOpts = opts;
      return { mutate: jest.fn() };
    });

    renderHook(() => useCreateTimeOffPolicy());

    await act(async () => { await capturedOpts.mutationFn({} as any); });

    capturedOpts.onSuccess?.();

    expect(invalidate).toHaveBeenCalled();
  });

  it("throws when action returns error", async () => {
    (useInvalidateTimeOffPoliciesQuery as jest.Mock).mockReturnValue(jest.fn());
    (createTimeOffPolicyAction as jest.Mock).mockResolvedValue({ status: ActionStatus.ERROR, errorMessage: "Failed" });

    let capturedOpts: any;
    (useMutation as jest.Mock).mockImplementation((opts: any) => { capturedOpts = opts; return {}; });

    renderHook(() => useCreateTimeOffPolicy());

    await expect(capturedOpts.mutationFn({} as any)).rejects.toThrow("Failed");
  });
});
