import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisPublicHolidayCalendarsService } from "@/api/modules/publicHolidays/calendars/services";
import {
  updatePublicHolidayCalendarAction
} from "@/components/modules/settings/modules/time/publicHolidays/actions/updatePublicHolidayCalendarAction/updatePublicHolidayCalendarAction";

jest.mock("@/api/modules/publicHolidays/calendars/services", () => ({
  hrisPublicHolidayCalendarsService: {
    update: jest.fn(),
  },
}));

describe("updatePublicHolidayCalendarAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(console, "error").mockImplementation(() => {
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("updates public holiday calendar", async () => {
    const response = { id: "calendar-id", version: 1 };
    const body = { name: "Updated calendar" } as any;

    jest
      .mocked(hrisPublicHolidayCalendarsService.update)
      .mockResolvedValue(response);

    const result = await updatePublicHolidayCalendarAction({
      id: "calendar-id",
      body,
    });

    expect(hrisPublicHolidayCalendarsService.update).toHaveBeenCalledWith(
      "calendar-id",
      body
    );

    expect(result).toEqual({
      status: ActionStatus.SUCCESS,
      data: response,
    });
  });

  it("returns error status when update fails", async () => {
    jest
      .mocked(hrisPublicHolidayCalendarsService.update)
      .mockRejectedValue(new Error("Failed"));

    const result = await updatePublicHolidayCalendarAction({
      id: "calendar-id",
      body: {} as any,
    });

    expect(result).toEqual({
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while updating the public holiday calendar. Please try again.",
    });
  });
});
