import { publicHolidayCalendarMapper } from "@/api/modules/publicHolidays/calendars/mappers";
import {
  type PublicHolidayCalendarDTO,
  PublicHolidayCalendarSourceType,
  PublicHolidayCalendarStatus,
} from "@/api/modules/publicHolidays/calendars/dto";

describe("PublicHolidayCalendarMapper", () => {
  const dto: PublicHolidayCalendarDTO = {
    id: "calendar-id",
    name: "Poland 2026",
    year: 2026,
    status: PublicHolidayCalendarStatus.Active,
    sourceType: PublicHolidayCalendarSourceType.Manual,
    sourceExternalId: null,
    sourceCountryCode: "PL",
    sourceRegionCode: null,
    sourceLocale: "pl-PL",
    archivedAt: null,
    archivedBy: null,
  };

  it("maps public holiday calendar dto to model", () => {
    expect(publicHolidayCalendarMapper.mapPublicHolidayCalendarDTO(dto)).toEqual(dto);
  });

  it("maps public holiday calendar dto array to models", () => {
    expect(publicHolidayCalendarMapper.mapPublicHolidayCalendarDTOs([dto])).toEqual([dto]);
  });
});
