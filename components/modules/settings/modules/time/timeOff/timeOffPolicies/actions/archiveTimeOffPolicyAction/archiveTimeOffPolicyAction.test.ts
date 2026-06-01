import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTimeOffPoliciesService } from "@/api/modules/timeOff/timeOffPolicies/services";
import { archiveTimeOffPolicyAction } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/actions/archiveTimeOffPolicyAction/archiveTimeOffPolicyAction";

jest.mock("@/api/modules/timeOff/timeOffPolicies/services", () => ({
  hrisTimeOffPoliciesService: { archive: jest.fn() },
}));

describe("archiveTimeOffPolicyAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => { jest.restoreAllMocks(); });

  it("archives time off policy", async () => {
    const response = { id: "policy-id" };
    jest.mocked(hrisTimeOffPoliciesService.archive).mockResolvedValue(response);

    const result = await archiveTimeOffPolicyAction({ id: "policy-id" });

    expect(hrisTimeOffPoliciesService.archive).toHaveBeenCalledWith("policy-id");
    expect(result).toEqual({ status: ActionStatus.SUCCESS, data: response });
  });

  it("returns error status when archive fails", async () => {
    jest.mocked(hrisTimeOffPoliciesService.archive).mockRejectedValue(new Error("Failed"));

    const result = await archiveTimeOffPolicyAction({ id: "policy-id" });

    expect(result.status).toBe(ActionStatus.ERROR);
  });
});
