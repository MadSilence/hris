import { hrisApiPublicHolidayTemplatesClient } from "@/api/modules/publicHolidays/templates/clients";
import { hrisPublicHolidayTemplatesService } from "@/api/modules/publicHolidays/templates/services";

jest.mock("@/api/modules/publicHolidays/templates/clients", () => ({
  hrisApiPublicHolidayTemplatesClient: {
    list: jest.fn(),
    getById: jest.fn(),
    preview: jest.fn(),
  },
}));

describe("HrisPublicHolidayTemplatesService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("lists public holiday templates", async () => {
    const response = [{ id: "template-id" }];

    jest.mocked(hrisApiPublicHolidayTemplatesClient.list).mockResolvedValue(
      response as never
    );

    const result = await hrisPublicHolidayTemplatesService.list();

    expect(hrisApiPublicHolidayTemplatesClient.list).toHaveBeenCalled();
    expect(result).toEqual(response);
  });

  it("gets public holiday template by id", async () => {
    const response = { id: "template-id" };

    jest.mocked(hrisApiPublicHolidayTemplatesClient.getById).mockResolvedValue(
      response as never
    );

    const result = await hrisPublicHolidayTemplatesService.getById("template-id");

    expect(hrisApiPublicHolidayTemplatesClient.getById).toHaveBeenCalledWith(
      "template-id"
    );
    expect(result).toEqual(response);
  });

  it("previews public holiday template", async () => {
    const response = { templateId: "template-id", year: 2026, holidays: [] };

    jest.mocked(hrisApiPublicHolidayTemplatesClient.preview).mockResolvedValue(
      response as never
    );

    const result = await hrisPublicHolidayTemplatesService.preview(
      "template-id",
      { year: 2026 }
    );

    expect(hrisApiPublicHolidayTemplatesClient.preview).toHaveBeenCalledWith(
      "template-id",
      { year: 2026 }
    );
    expect(result).toEqual(response);
  });
});
