import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisPublicHolidayCalendarsService } from "@/api/modules/publicHolidays/calendars/services";
import {
  deletePublicHolidayCalendarAction
} from "@/components/modules/settings/modules/time/publicHolidays/actions/deletePublicHolidayCalendarAction/deletePublicHolidayCalendarAction";

jest.mock("@/api/modules/publicHolidays/calendars/services", () => ({
  hrisPublicHolidayCalendarsService: {
    delete: jest.fn(),
  },
}));

describe("deletePublicHolidayCalendarAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("deletes public holiday calendar", async () => {
    jest.mocked(hrisPublicHolidayCalendarsService.delete).mockResolvedValue(undefined);

    const result = await deletePublicHolidayCalendarAction({
      id: "calendar-id",
    });

    expect(hrisPublicHolidayCalendarsService.delete).toHaveBeenCalledWith(
      "calendar-id"
    );
    expect(result).toEqual({
      status: ActionStatus.SUCCESS,
    });
  });

  it("returns error status when delete fails", async () => {
    jest
      .mocked(hrisPublicHolidayCalendarsService.delete)
      .mockRejectedValue(new Error("Failed"));

    const result = await deletePublicHolidayCalendarAction({
      id: "calendar-id",
    });

    expect(result).toEqual({
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while deleting the public holiday calendar. Please try again.",
    });
  });
});
