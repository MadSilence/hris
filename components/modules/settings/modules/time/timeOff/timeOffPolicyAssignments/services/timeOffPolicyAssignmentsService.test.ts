import { timeOffPolicyAssignmentsService } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyAssignments/services/timeOffPolicyAssignmentsService";

describe("TimeOffPolicyAssignmentsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("lists assignments by policy id", async () => {
    const response = [{ id: "assignment-id" }];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => response,
    });

    const result =
      await timeOffPolicyAssignmentsService.listByPolicyId("policy-id");

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/time-off/policies/policy-id/assignments",
      { method: "GET", credentials: "include", cache: "no-store" }
    );
    expect(result).toEqual(response);
  });

  it("throws error when listByPolicyId fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false });

    await expect(
      timeOffPolicyAssignmentsService.listByPolicyId("policy-id")
    ).rejects.toThrow("Failed to load time off policy assignments");
  });
});
