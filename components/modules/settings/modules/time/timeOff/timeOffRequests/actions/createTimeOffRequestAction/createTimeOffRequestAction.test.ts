import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTimeOffRequestsService } from "@/api/modules/timeOff/timeOffRequests/services";
import { createTimeOffRequestAction } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/actions/createTimeOffRequestAction/createTimeOffRequestAction";

jest.mock("@/api/modules/timeOff/timeOffRequests/services", () => ({
  hrisTimeOffRequestsService: { create: jest.fn() },
}));

describe("createTimeOffRequestAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => { jest.restoreAllMocks(); });

  const submission = { assignmentId: "assignment-id", startDate: "2026-07-14", endDate: "2026-07-18", reason: "Vacation" };

  it("creates time off request", async () => {
    const response = { id: "request-id" };
    jest.mocked(hrisTimeOffRequestsService.create).mockResolvedValue(response);

    const result = await createTimeOffRequestAction(submission);

    expect(hrisTimeOffRequestsService.create).toHaveBeenCalledWith(submission);
    expect(result).toEqual({ status: ActionStatus.SUCCESS, data: response });
  });

  it("returns error status when create fails", async () => {
    jest.mocked(hrisTimeOffRequestsService.create).mockRejectedValue(new Error("Failed"));

    const result = await createTimeOffRequestAction(submission);

    expect(result.status).toBe(ActionStatus.ERROR);
  });
});
