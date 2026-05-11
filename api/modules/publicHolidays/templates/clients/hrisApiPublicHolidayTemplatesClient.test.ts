import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import { hrisApiPublicHolidayTemplatesClient } from "@/api/modules/publicHolidays/templates/clients";
import { PublicHolidayTemplateProvider } from "@/api/modules/publicHolidays/templates/dto";

jest.mock("@/api/clients/hrisApiClient/hrisApiClient", () => ({
  hrisApiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

describe("HrisApiPublicHolidayTemplatesClient", () => {
  const dto = {
    id: "template-id",
    provider: PublicHolidayTemplateProvider.GoogleCalendar,
    name: "Poland holidays",
    description: "Polish public holidays",
    countryCode: "PL",
    countryName: "Poland",
    regionCode: null,
    regionName: null,
    languageCode: "pl",
    supportedYearFrom: 2020,
    supportedYearTo: 2030,
    regional: false,
  };

  const previewDto = {
    templateId: "template-id",
    templateName: "Poland holidays",
    year: 2026,
    holidays: [
      {
        sourceEventId: "event-id",
        name: "Nowy Rok",
        holidayDate: "2026-01-01",
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("lists public holiday templates", async () => {
    jest.mocked(hrisApiClient.get).mockResolvedValue([dto]);

    const result = await hrisApiPublicHolidayTemplatesClient.list();

    expect(hrisApiClient.get).toHaveBeenCalledWith("/public-holiday-templates");
    expect(result).toEqual([dto]);
  });

  it("gets public holiday template by id", async () => {
    jest.mocked(hrisApiClient.get).mockResolvedValue(dto);

    const result = await hrisApiPublicHolidayTemplatesClient.getById("template-id");

    expect(hrisApiClient.get).toHaveBeenCalledWith(
      "/public-holiday-templates/template-id"
    );
    expect(result).toEqual(dto);
  });

  it("previews public holiday template", async () => {
    jest.mocked(hrisApiClient.post).mockResolvedValue(previewDto);

    const result = await hrisApiPublicHolidayTemplatesClient.preview(
      "template-id",
      { year: 2026 }
    );

    expect(hrisApiClient.post).toHaveBeenCalledWith(
      "/public-holiday-templates/template-id/preview",
      { year: 2026 }
    );
    expect(result).toEqual(previewDto);
  });
});
