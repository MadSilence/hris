import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTimeOffRequestsService } from "@/api/modules/timeOff/timeOffRequests/services";
import { rejectTimeOffRequestAction } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/actions/rejectTimeOffRequestAction/rejectTimeOffRequestAction";

jest.mock("@/api/modules/timeOff/timeOffRequests/services", () => ({
  hrisTimeOffRequestsService: { reject: jest.fn() },
}));

describe("rejectTimeOffRequestAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => { jest.restoreAllMocks(); });

  const submission = { requestId: "request-id", rejectionReason: "Insufficient notice period" };

  it("rejects time off request", async () => {
    const response = { id: "request-id" };
    jest.mocked(hrisTimeOffRequestsService.reject).mockResolvedValue(response);

    const result = await rejectTimeOffRequestAction(submission);

    expect(hrisTimeOffRequestsService.reject).toHaveBeenCalledWith("request-id", { rejectionReason: "Insufficient notice period" });
    expect(result).toEqual({ status: ActionStatus.SUCCESS, data: response });
  });

  it("returns error status when reject fails", async () => {
    jest.mocked(hrisTimeOffRequestsService.reject).mockRejectedValue(new Error("Failed"));

    const result = await rejectTimeOffRequestAction(submission);

    expect(result.status).toBe(ActionStatus.ERROR);
  });
});
