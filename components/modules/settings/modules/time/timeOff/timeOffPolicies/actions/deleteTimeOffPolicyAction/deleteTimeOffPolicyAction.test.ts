import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTimeOffPoliciesService } from "@/api/modules/timeOff/timeOffPolicies/services";
import { deleteTimeOffPolicyAction } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/actions/deleteTimeOffPolicyAction/deleteTimeOffPolicyAction";

jest.mock("@/api/modules/timeOff/timeOffPolicies/services", () => ({
  hrisTimeOffPoliciesService: { delete: jest.fn() },
}));

describe("deleteTimeOffPolicyAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => { jest.restoreAllMocks(); });

  it("deletes time off policy", async () => {
    const response = { id: "policy-id" };
    jest.mocked(hrisTimeOffPoliciesService.delete).mockResolvedValue(response);

    const result = await deleteTimeOffPolicyAction({ id: "policy-id" });

    expect(hrisTimeOffPoliciesService.delete).toHaveBeenCalledWith("policy-id");
    expect(result).toEqual({ status: ActionStatus.SUCCESS, data: response });
  });

  it("returns error status when delete fails", async () => {
    jest.mocked(hrisTimeOffPoliciesService.delete).mockRejectedValue(new Error("Failed"));

    const result = await deleteTimeOffPolicyAction({ id: "policy-id" });

    expect(result.status).toBe(ActionStatus.ERROR);
  });
});
