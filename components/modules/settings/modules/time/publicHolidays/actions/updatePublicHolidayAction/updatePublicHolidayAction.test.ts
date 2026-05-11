import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisPublicHolidaysService } from "@/api/modules/publicHolidays/holidays/services";
import {
  updatePublicHolidayAction
} from "@/components/modules/settings/modules/time/publicHolidays/actions/updatePublicHolidayAction/updatePublicHolidayAction";

jest.mock("@/api/modules/publicHolidays/holidays/services", () => ({
  hrisPublicHolidaysService: {
    update: jest.fn(),
  },
}));

describe("updatePublicHolidayAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("updates public holiday", async () => {
    const response = { id: "holiday-id", version: 1 };
    const body = {
      name: "Updated New Year",
      holidayDate: "2026-01-01",
    } as any;

    jest.mocked(hrisPublicHolidaysService.update).mockResolvedValue(response);

    const result = await updatePublicHolidayAction({
      id: "holiday-id",
      body,
    });

    expect(hrisPublicHolidaysService.update).toHaveBeenCalledWith(
      "holiday-id",
      body
    );
    expect(result).toEqual({
      status: ActionStatus.SUCCESS,
      data: response,
    });
  });

  it("returns error status when update fails", async () => {
    jest
      .mocked(hrisPublicHolidaysService.update)
      .mockRejectedValue(new Error("Failed"));

    const result = await updatePublicHolidayAction({
      id: "holiday-id",
      body: {} as any,
    });

    expect(result).toEqual({
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while updating the public holiday. Please try again.",
    });
  });
});
