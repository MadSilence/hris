import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTimeOffRequestsService } from "@/api/modules/timeOff/timeOffRequests/services";
import { approveTimeOffRequestAction } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/actions/approveTimeOffRequestAction/approveTimeOffRequestAction";

jest.mock("@/api/modules/timeOff/timeOffRequests/services", () => ({
  hrisTimeOffRequestsService: { approve: jest.fn() },
}));

describe("approveTimeOffRequestAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => { jest.restoreAllMocks(); });

  it("approves time off request", async () => {
    const response = { id: "request-id" };
    jest.mocked(hrisTimeOffRequestsService.approve).mockResolvedValue(response);

    const result = await approveTimeOffRequestAction({ requestId: "request-id" });

    expect(hrisTimeOffRequestsService.approve).toHaveBeenCalledWith("request-id");
    expect(result).toEqual({ status: ActionStatus.SUCCESS, data: response });
  });

  it("returns error status when approve fails", async () => {
    jest.mocked(hrisTimeOffRequestsService.approve).mockRejectedValue(new Error("Failed"));

    const result = await approveTimeOffRequestAction({ requestId: "request-id" });

    expect(result.status).toBe(ActionStatus.ERROR);
  });
});
