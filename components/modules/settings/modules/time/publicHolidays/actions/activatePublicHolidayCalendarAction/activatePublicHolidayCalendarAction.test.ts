import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisPublicHolidayCalendarsService } from "@/api/modules/publicHolidays/calendars/services";
import {
  activatePublicHolidayCalendarAction
} from "@/components/modules/settings/modules/time/publicHolidays/actions/activatePublicHolidayCalendarAction/activatePublicHolidayCalendarAction";

jest.mock("@/api/modules/publicHolidays/calendars/services", () => ({
  hrisPublicHolidayCalendarsService: {
    activate: jest.fn(),
  },
}));

describe("activatePublicHolidayCalendarAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("activates public holiday calendar", async () => {
    const response = { id: "calendar-id", version: 1 };

    jest.mocked(hrisPublicHolidayCalendarsService.activate).mockResolvedValue(response);

    const result = await activatePublicHolidayCalendarAction({
      id: "calendar-id",
    });

    expect(hrisPublicHolidayCalendarsService.activate).toHaveBeenCalledWith(
      "calendar-id"
    );
    expect(result).toEqual({
      status: ActionStatus.SUCCESS,
      data: response,
    });
  });

  it("returns error status when activate fails", async () => {
    jest
      .mocked(hrisPublicHolidayCalendarsService.activate)
      .mockRejectedValue(new Error("Failed"));

    const result = await activatePublicHolidayCalendarAction({
      id: "calendar-id",
    });

    expect(result).toEqual({
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while activating the public holiday calendar. Please try again.",
    });
  });
});
