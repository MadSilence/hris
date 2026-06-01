import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTimeOffPolicyAssignmentsService } from "@/api/modules/timeOff/timeOffPolicyAssignments/services";
import { endTimeOffPolicyAssignmentAction } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyAssignments/actions/endTimeOffPolicyAssignmentAction/endTimeOffPolicyAssignmentAction";

jest.mock("@/api/modules/timeOff/timeOffPolicyAssignments/services", () => ({
  hrisTimeOffPolicyAssignmentsService: { end: jest.fn() },
}));

describe("endTimeOffPolicyAssignmentAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => { jest.restoreAllMocks(); });

  const submission = { assignmentId: "assignment-id", policyId: "policy-id", effectiveTo: "2026-06-30" };

  it("ends assignment", async () => {
    const response = { id: "assignment-id" };
    jest.mocked(hrisTimeOffPolicyAssignmentsService.end).mockResolvedValue(response);

    const result = await endTimeOffPolicyAssignmentAction(submission);

    expect(hrisTimeOffPolicyAssignmentsService.end).toHaveBeenCalledWith("assignment-id", { effectiveTo: "2026-06-30" });
    expect(result).toEqual({ status: ActionStatus.SUCCESS, data: response });
  });

  it("returns error status when end fails", async () => {
    jest.mocked(hrisTimeOffPolicyAssignmentsService.end).mockRejectedValue(new Error("Failed"));

    const result = await endTimeOffPolicyAssignmentAction(submission);

    expect(result.status).toBe(ActionStatus.ERROR);
  });
});
