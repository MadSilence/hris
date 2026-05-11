import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisPublicHolidayCalendarsService } from "@/api/modules/publicHolidays/calendars/services";
import {
  deactivatePublicHolidayCalendarAction
} from "@/components/modules/settings/modules/time/publicHolidays/actions/deactivatePublicHolidayCalendarAction/deactivatePublicHolidayCalendarAction";

jest.mock("@/api/modules/publicHolidays/calendars/services", () => ({
  hrisPublicHolidayCalendarsService: {
    deactivate: jest.fn(),
  },
}));

describe("deactivatePublicHolidayCalendarAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("deactivates public holiday calendar", async () => {
    const response = { id: "calendar-id", version: 1 };

    jest.mocked(hrisPublicHolidayCalendarsService.deactivate).mockResolvedValue(response);

    const result = await deactivatePublicHolidayCalendarAction({
      id: "calendar-id",
    });

    expect(hrisPublicHolidayCalendarsService.deactivate).toHaveBeenCalledWith(
      "calendar-id"
    );
    expect(result).toEqual({
      status: ActionStatus.SUCCESS,
      data: response,
    });
  });

  it("returns error status when deactivate fails", async () => {
    jest
      .mocked(hrisPublicHolidayCalendarsService.deactivate)
      .mockRejectedValue(new Error("Failed"));

    const result = await deactivatePublicHolidayCalendarAction({
      id: "calendar-id",
    });

    expect(result).toEqual({
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while deactivating the public holiday calendar. Please try again.",
    });
  });
});
