import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisPublicHolidaysService } from "@/api/modules/publicHolidays/holidays/services";
import {
  renamePublicHolidayAction
} from "@/components/modules/settings/modules/time/publicHolidays/actions/renamePublicHolidayAction/renamePublicHolidayAction";

jest.mock("@/api/modules/publicHolidays/holidays/services", () => ({
  hrisPublicHolidaysService: {
    rename: jest.fn(),
  },
}));

describe("renamePublicHolidayAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renames public holiday", async () => {
    const response = { id: "holiday-id", version: 1 };
    const body = { name: "New holiday name" };

    jest.mocked(hrisPublicHolidaysService.rename).mockResolvedValue(response);

    const result = await renamePublicHolidayAction({
      id: "holiday-id",
      body,
    });

    expect(hrisPublicHolidaysService.rename).toHaveBeenCalledWith(
      "holiday-id",
      body
    );
    expect(result).toEqual({
      status: ActionStatus.SUCCESS,
      data: response,
    });
  });

  it("returns error status when rename fails", async () => {
    jest
      .mocked(hrisPublicHolidaysService.rename)
      .mockRejectedValue(new Error("Failed"));

    const result = await renamePublicHolidayAction({
      id: "holiday-id",
      body: { name: "New holiday name" },
    });

    expect(result).toEqual({
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while renaming the public holiday. Please try again.",
    });
  });
});
