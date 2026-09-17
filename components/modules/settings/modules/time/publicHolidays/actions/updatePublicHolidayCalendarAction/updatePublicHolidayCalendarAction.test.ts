import type { UpdatePublicHolidayCalendarRequest } from "@/api/modules/publicHolidays/calendars/dto";
import { partialMock } from "@/test/types";
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

  it("updates public holiday calendar, passing the version through and answering the new one", async () => {
    const response = { id: "calendar-id", version: 4 };
    const body = partialMock<UpdatePublicHolidayCalendarRequest>({ name: "Updated calendar", version: 3 });

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
      body: partialMock<UpdatePublicHolidayCalendarRequest>({}),
    });

    expect(result).toEqual({
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred. Please try again.",
    });
  });
});
