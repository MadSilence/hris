import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisPublicHolidayCalendarsService } from "@/api/modules/publicHolidays/calendars/services";
import {
  renamePublicHolidayCalendarAction
} from "@/components/modules/settings/modules/time/publicHolidays/actions/renamePublicHolidayCalendarAction/renamePublicHolidayCalendarAction";

jest.mock("@/api/modules/publicHolidays/calendars/services", () => ({
  hrisPublicHolidayCalendarsService: {
    rename: jest.fn(),
  },
}));

describe("renamePublicHolidayCalendarAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renames public holiday calendar", async () => {
    const response = { id: "calendar-id", version: 1 };
    const body = { name: "New name" };

    jest.mocked(hrisPublicHolidayCalendarsService.rename).mockResolvedValue(response);

    const result = await renamePublicHolidayCalendarAction({
      id: "calendar-id",
      body,
    });

    expect(hrisPublicHolidayCalendarsService.rename).toHaveBeenCalledWith(
      "calendar-id",
      body
    );
    expect(result).toEqual({
      status: ActionStatus.SUCCESS,
      data: response,
    });
  });

  it("returns error status when rename fails", async () => {
    jest
      .mocked(hrisPublicHolidayCalendarsService.rename)
      .mockRejectedValue(new Error("Failed"));

    const result = await renamePublicHolidayCalendarAction({
      id: "calendar-id",
      body: { name: "New name" },
    });

    expect(result).toEqual({
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while renaming the public holiday calendar. Please try again.",
    });
  });
});
