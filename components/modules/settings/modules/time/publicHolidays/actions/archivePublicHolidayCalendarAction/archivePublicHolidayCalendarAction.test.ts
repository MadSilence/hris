import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisPublicHolidayCalendarsService } from "@/api/modules/publicHolidays/calendars/services";
import {
  archivePublicHolidayCalendarAction
} from "@/components/modules/settings/modules/time/publicHolidays/actions/archivePublicHolidayCalendarAction/archivePublicHolidayCalendarAction";

jest.mock("@/api/modules/publicHolidays/calendars/services", () => ({
  hrisPublicHolidayCalendarsService: {
    archive: jest.fn(),
  },
}));

describe("archivePublicHolidayCalendarAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("archives public holiday calendar", async () => {
    const response = { id: "calendar-id", version: 1 };

    jest.mocked(hrisPublicHolidayCalendarsService.archive).mockResolvedValue(response);

    const result = await archivePublicHolidayCalendarAction({
      id: "calendar-id",
    });

    expect(hrisPublicHolidayCalendarsService.archive).toHaveBeenCalledWith(
      "calendar-id"
    );
    expect(result).toEqual({
      status: ActionStatus.SUCCESS,
      data: response,
    });
  });

  it("returns error status when archive fails", async () => {
    jest
      .mocked(hrisPublicHolidayCalendarsService.archive)
      .mockRejectedValue(new Error("Failed"));

    const result = await archivePublicHolidayCalendarAction({
      id: "calendar-id",
    });

    expect(result).toEqual({
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while archiving the public holiday calendar. Please try again.",
    });
  });
});
