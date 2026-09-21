import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisPublicHolidayCalendarsService } from "@/api/modules/publicHolidays/calendars/services";
import {
  applyPublicHolidayDriftAction,
  dismissPublicHolidayDriftAction,
} from "@/components/modules/settings/modules/time/publicHolidays/actions/publicHolidayDriftActions/publicHolidayDriftActions";

jest.mock("@/api/modules/publicHolidays/calendars/services", () => ({
  hrisPublicHolidayCalendarsService: {
    applyDrift: jest.fn(),
    dismissDrift: jest.fn(),
  },
}));

describe("public holiday drift actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("applies a drift through the service", async () => {
    const data = {
      driftId: "drift-1",
      calendarId: "calendar-1",
      year: 2026,
      applied: 1,
      skipped: [],
      recalculatedRequests: 0,
      requestsLeftUnchanged: 0,
    };
    jest.mocked(hrisPublicHolidayCalendarsService.applyDrift).mockResolvedValue(data);

    const result = await applyPublicHolidayDriftAction({ driftId: "drift-1" });

    expect(hrisPublicHolidayCalendarsService.applyDrift).toHaveBeenCalledWith("drift-1");
    expect(result).toEqual({ status: ActionStatus.SUCCESS, data });
  });

  it("answers an error envelope instead of throwing", async () => {
    jest.mocked(hrisPublicHolidayCalendarsService.applyDrift).mockRejectedValue(new Error("boom"));

    const result = await applyPublicHolidayDriftAction({ driftId: "drift-1" });

    expect(result.status).toBe(ActionStatus.ERROR);
    expect(result.errorMessage).toBeTruthy();
  });

  it("dismisses a drift through the service", async () => {
    jest.mocked(hrisPublicHolidayCalendarsService.dismissDrift).mockResolvedValue(undefined);

    const result = await dismissPublicHolidayDriftAction({ driftId: "drift-1" });

    expect(hrisPublicHolidayCalendarsService.dismissDrift).toHaveBeenCalledWith("drift-1");
    expect(result).toEqual({ status: ActionStatus.SUCCESS });
  });
});
