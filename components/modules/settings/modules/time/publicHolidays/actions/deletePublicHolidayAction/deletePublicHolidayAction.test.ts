import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisPublicHolidaysService } from "@/api/modules/publicHolidays/holidays/services";
import {
  deletePublicHolidayAction
} from "@/components/modules/settings/modules/time/publicHolidays/actions/deletePublicHolidayAction/deletePublicHolidayAction";

jest.mock("@/api/modules/publicHolidays/holidays/services", () => ({
  hrisPublicHolidaysService: {
    delete: jest.fn(),
  },
}));

describe("deletePublicHolidayAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("deletes public holiday", async () => {
    jest.mocked(hrisPublicHolidaysService.delete).mockResolvedValue(undefined);

    const result = await deletePublicHolidayAction({
      id: "holiday-id",
    });

    expect(hrisPublicHolidaysService.delete).toHaveBeenCalledWith("holiday-id");
    expect(result).toEqual({
      status: ActionStatus.SUCCESS,
    });
  });

  it("returns error status when delete fails", async () => {
    jest
      .mocked(hrisPublicHolidaysService.delete)
      .mockRejectedValue(new Error("Failed"));

    const result = await deletePublicHolidayAction({
      id: "holiday-id",
    });

    expect(result).toEqual({
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while deleting the public holiday. Please try again.",
    });
  });
});
