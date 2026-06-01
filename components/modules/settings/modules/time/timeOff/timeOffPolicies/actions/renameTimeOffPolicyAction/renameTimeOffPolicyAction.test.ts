import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTimeOffPoliciesService } from "@/api/modules/timeOff/timeOffPolicies/services";
import { renameTimeOffPolicyAction } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/actions/renameTimeOffPolicyAction/renameTimeOffPolicyAction";

jest.mock("@/api/modules/timeOff/timeOffPolicies/services", () => ({
  hrisTimeOffPoliciesService: { rename: jest.fn() },
}));

describe("renameTimeOffPolicyAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => { jest.restoreAllMocks(); });

  it("renames time off policy", async () => {
    const response = { id: "policy-id" };
    jest.mocked(hrisTimeOffPoliciesService.rename).mockResolvedValue(response);

    const result = await renameTimeOffPolicyAction({ id: "policy-id", name: "new-name" });

    expect(hrisTimeOffPoliciesService.rename).toHaveBeenCalledWith("policy-id", { name: "new-name" });
    expect(result).toEqual({ status: ActionStatus.SUCCESS, data: response });
  });

  it("returns error status when rename fails", async () => {
    jest.mocked(hrisTimeOffPoliciesService.rename).mockRejectedValue(new Error("Failed"));

    const result = await renameTimeOffPolicyAction({ id: "policy-id", name: "x" });

    expect(result.status).toBe(ActionStatus.ERROR);
  });
});
