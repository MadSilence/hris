import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTimeOffPoliciesService } from "@/api/modules/timeOff/timeOffPolicies/services";
import { activateTimeOffPolicyAction } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/actions/activateTimeOffPolicyAction/activateTimeOffPolicyAction";

jest.mock("@/api/modules/timeOff/timeOffPolicies/services", () => ({
  hrisTimeOffPoliciesService: { activate: jest.fn() },
}));

describe("activateTimeOffPolicyAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => { jest.restoreAllMocks(); });

  it("activates time off policy", async () => {
    const response = { id: "policy-id" };
    jest.mocked(hrisTimeOffPoliciesService.activate).mockResolvedValue(response);

    const result = await activateTimeOffPolicyAction({ id: "policy-id" });

    expect(hrisTimeOffPoliciesService.activate).toHaveBeenCalledWith("policy-id");
    expect(result).toEqual({ status: ActionStatus.SUCCESS, data: response });
  });

  it("returns error status when activate fails", async () => {
    jest.mocked(hrisTimeOffPoliciesService.activate).mockRejectedValue(new Error("Failed"));

    const result = await activateTimeOffPolicyAction({ id: "policy-id" });

    expect(result.status).toBe(ActionStatus.ERROR);
  });
});
