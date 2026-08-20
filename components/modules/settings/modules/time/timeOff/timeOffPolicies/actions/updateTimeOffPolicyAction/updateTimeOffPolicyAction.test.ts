import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTimeOffPoliciesService } from "@/api/modules/timeOff/timeOffPolicies/services";
import { updateTimeOffPolicyAction } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/actions/updateTimeOffPolicyAction/updateTimeOffPolicyAction";
import { timeOffPolicyUpdateRequest } from "@/test/fixtures/timeOffPolicy";

jest.mock("@/api/modules/timeOff/timeOffPolicies/services", () => ({
  hrisTimeOffPoliciesService: { update: jest.fn() },
}));

describe("updateTimeOffPolicyAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => { jest.restoreAllMocks(); });

  const submission = { id: "policy-id", ...timeOffPolicyUpdateRequest() };

  it("updates time off policy", async () => {
    const response = { id: "policy-id" };
    jest.mocked(hrisTimeOffPoliciesService.update).mockResolvedValue(response);

    const result = await updateTimeOffPolicyAction(submission);

    const { id, ...body } = submission;
    expect(hrisTimeOffPoliciesService.update).toHaveBeenCalledWith(id, body);
    expect(result).toEqual({ status: ActionStatus.SUCCESS, data: response });
  });

  it("returns error status when update fails", async () => {
    jest.mocked(hrisTimeOffPoliciesService.update).mockRejectedValue(new Error("Failed"));

    const result = await updateTimeOffPolicyAction(submission);

    expect(result.status).toBe(ActionStatus.ERROR);
  });
});
