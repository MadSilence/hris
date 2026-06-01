import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTimeOffPolicyAssignmentsService } from "@/api/modules/timeOff/timeOffPolicyAssignments/services";
import { createTimeOffPolicyAssignmentAction } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyAssignments/actions/createTimeOffPolicyAssignmentAction/createTimeOffPolicyAssignmentAction";

jest.mock("@/api/modules/timeOff/timeOffPolicyAssignments/services", () => ({
  hrisTimeOffPolicyAssignmentsService: { create: jest.fn() },
}));

describe("createTimeOffPolicyAssignmentAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => { jest.restoreAllMocks(); });

  const submission = { policyId: "policy-id", userId: "user-id", effectiveFrom: "2026-01-01", effectiveTo: null };

  it("creates assignment", async () => {
    const response = { id: "assignment-id" };
    jest.mocked(hrisTimeOffPolicyAssignmentsService.create).mockResolvedValue(response);

    const result = await createTimeOffPolicyAssignmentAction(submission);

    const { policyId, ...body } = submission;
    expect(hrisTimeOffPolicyAssignmentsService.create).toHaveBeenCalledWith(policyId, body);
    expect(result).toEqual({ status: ActionStatus.SUCCESS, data: response });
  });

  it("returns error status when create fails", async () => {
    jest.mocked(hrisTimeOffPolicyAssignmentsService.create).mockRejectedValue(new Error("Failed"));

    const result = await createTimeOffPolicyAssignmentAction(submission);

    expect(result.status).toBe(ActionStatus.ERROR);
  });
});
