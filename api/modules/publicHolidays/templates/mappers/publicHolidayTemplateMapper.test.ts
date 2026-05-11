import { publicHolidayTemplateMapper } from "@/api/modules/publicHolidays/templates/mappers";
import { PublicHolidayTemplateProvider } from "@/api/modules/publicHolidays/templates/dto";

describe("PublicHolidayTemplateMapper", () => {
  it("maps public holiday template dto", () => {
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

    const result = publicHolidayTemplateMapper.mapPublicHolidayTemplateDTO(dto);

    expect(result).toEqual(dto);
  });

  it("maps public holiday template preview dto", () => {
    const dto = {
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

    const result =
      publicHolidayTemplateMapper.mapPublicHolidayTemplatePreviewDTO(dto);

    expect(result).toEqual(dto);
  });
});
