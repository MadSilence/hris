import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisPublicHolidaysService } from "@/api/modules/publicHolidays/holidays/services";
import {
  createPublicHolidayAction
} from "@/components/modules/settings/modules/time/publicHolidays/actions/createPublicHolidayAction/createPublicHolidayAction";

jest.mock("@/api/modules/publicHolidays/holidays/services", () => ({
  hrisPublicHolidaysService: {
    create: jest.fn(),
  },
}));

describe("createPublicHolidayAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("creates public holiday", async () => {
    const response = { id: "holiday-id" };
    const body = {
      name: "New Year",
      holidayDate: "2026-01-01",
    } as any;

    jest.mocked(hrisPublicHolidaysService.create).mockResolvedValue(response);

    const result = await createPublicHolidayAction({
      calendarId: "calendar-id",
      body,
    });

    expect(hrisPublicHolidaysService.create).toHaveBeenCalledWith(
      "calendar-id",
      body
    );
    expect(result).toEqual({
      status: ActionStatus.SUCCESS,
      data: response,
    });
  });

  it("returns error status when create fails", async () => {
    jest
      .mocked(hrisPublicHolidaysService.create)
      .mockRejectedValue(new Error("Failed"));

    const result = await createPublicHolidayAction({
      calendarId: "calendar-id",
      body: {} as any,
    });

    expect(result).toEqual({
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while creating the public holiday. Please try again.",
    });
  });
});
