import { hrisApiPublicHolidaysClient } from "@/api/modules/publicHolidays/holidays/clients";
import { hrisPublicHolidaysService } from "@/api/modules/publicHolidays/holidays/services";

jest.mock("@/api/modules/publicHolidays/holidays/clients", () => ({
  hrisApiPublicHolidaysClient: {
    create: jest.fn(),
    list: jest.fn(),
    getById: jest.fn(),
    update: jest.fn(),
    rename: jest.fn(),
    delete: jest.fn(),
  },
}));

describe("HrisPublicHolidaysService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("delegates create to client", async () => {
    const response = { id: "holiday-id" };
    const request = {
      name: "New Year",
      holidayDate: "2026-01-01",
    };

    jest.mocked(hrisApiPublicHolidaysClient.create).mockResolvedValue(response);

    const result = await hrisPublicHolidaysService.create("calendar-id", request);

    expect(hrisApiPublicHolidaysClient.create).toHaveBeenCalledWith(
      "calendar-id",
      request
    );
    expect(result).toEqual(response);
  });

  it("delegates list to client", async () => {
    const response: any[] = [];

    jest.mocked(hrisApiPublicHolidaysClient.list).mockResolvedValue(response);

    const result = await hrisPublicHolidaysService.list("calendar-id");

    expect(hrisApiPublicHolidaysClient.list).toHaveBeenCalledWith("calendar-id");
    expect(result).toEqual(response);
  });

  it("delegates getById to client", async () => {
    const response = { id: "holiday-id" } as any;

    jest.mocked(hrisApiPublicHolidaysClient.getById).mockResolvedValue(response);

    const result = await hrisPublicHolidaysService.getById("holiday-id");

    expect(hrisApiPublicHolidaysClient.getById).toHaveBeenCalledWith("holiday-id");
    expect(result).toEqual(response);
  });

  it("delegates update to client", async () => {
    const response = { id: "holiday-id", version: 1 };
    const request = {
      name: "Updated holiday",
      holidayDate: "2026-01-02",
    };

    jest.mocked(hrisApiPublicHolidaysClient.update).mockResolvedValue(response);

    const result = await hrisPublicHolidaysService.update("holiday-id", request);

    expect(hrisApiPublicHolidaysClient.update).toHaveBeenCalledWith(
      "holiday-id",
      request
    );
    expect(result).toEqual(response);
  });

  it("delegates rename to client", async () => {
    const response = { id: "holiday-id", version: 1 };

    jest.mocked(hrisApiPublicHolidaysClient.rename).mockResolvedValue(response);

    const result = await hrisPublicHolidaysService.rename("holiday-id", {
      name: "New name",
    });

    expect(hrisApiPublicHolidaysClient.rename).toHaveBeenCalledWith(
      "holiday-id",
      { name: "New name" }
    );
    expect(result).toEqual(response);
  });

  it("delegates delete to client", async () => {
    jest.mocked(hrisApiPublicHolidaysClient.delete).mockResolvedValue(undefined);

    const result = await hrisPublicHolidaysService.delete("holiday-id");

    expect(hrisApiPublicHolidaysClient.delete).toHaveBeenCalledWith("holiday-id");
    expect(result).toBeUndefined();
  });
});
