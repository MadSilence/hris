import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisPublicHolidayCalendarsService } from "@/api/modules/publicHolidays/calendars/services";
import {
  createPublicHolidayCalendarAction
} from "@/components/modules/settings/modules/time/publicHolidays/actions/createPublicHolidayCalendarAction/createPublicHolidayCalendarAction";

jest.mock("@/api/modules/publicHolidays/calendars/services", () => ({
  hrisPublicHolidayCalendarsService: {
    create: jest.fn(),
  },
}));

describe("createPublicHolidayCalendarAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("creates public holiday calendar", async () => {
    const response = { id: "calendar-id" };

    const submission = {
      name: "Poland 2026",
      year: 2026,
      status: "ACTIVE",
      sourceType: "MANUAL",
      sourceExternalId: null,
      sourceCountryCode: "PL",
      sourceRegionCode: null,
      sourceLocale: "pl-PL",
    } as any;

    jest
      .mocked(hrisPublicHolidayCalendarsService.create)
      .mockResolvedValue(response);

    const result = await createPublicHolidayCalendarAction(submission);

    expect(hrisPublicHolidayCalendarsService.create).toHaveBeenCalledWith(
      submission
    );

    expect(result).toEqual({
      status: ActionStatus.SUCCESS,
      data: response,
    });
  });

  it("returns error status when create fails", async () => {
    jest
      .mocked(hrisPublicHolidayCalendarsService.create)
      .mockRejectedValue(new Error("Failed"));

    const result = await createPublicHolidayCalendarAction({} as any);

    expect(result).toEqual({
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while creating the public holiday calendar. Please try again.",
    });
  });
});
