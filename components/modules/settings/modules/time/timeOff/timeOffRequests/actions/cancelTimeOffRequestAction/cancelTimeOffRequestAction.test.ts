import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTimeOffRequestsService } from "@/api/modules/timeOff/timeOffRequests/services";
import { cancelTimeOffRequestAction } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/actions/cancelTimeOffRequestAction/cancelTimeOffRequestAction";

jest.mock("@/api/modules/timeOff/timeOffRequests/services", () => ({
  hrisTimeOffRequestsService: { cancel: jest.fn() },
}));

describe("cancelTimeOffRequestAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => { jest.restoreAllMocks(); });

  const submission = { requestId: "request-id", userId: "user-id", cancellationReason: "Plans changed" };

  it("cancels time off request", async () => {
    const response = { id: "request-id" };
    jest.mocked(hrisTimeOffRequestsService.cancel).mockResolvedValue(response);

    const result = await cancelTimeOffRequestAction(submission);

    expect(hrisTimeOffRequestsService.cancel).toHaveBeenCalledWith("request-id", { cancellationReason: "Plans changed" });
    expect(result).toEqual({ status: ActionStatus.SUCCESS, data: response });
  });

  it("returns error status when cancel fails", async () => {
    jest.mocked(hrisTimeOffRequestsService.cancel).mockRejectedValue(new Error("Failed"));

    const result = await cancelTimeOffRequestAction(submission);

    expect(result.status).toBe(ActionStatus.ERROR);
  });
});
