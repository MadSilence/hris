import { publicHolidayCalendarMapper } from "@/api/modules/publicHolidays/calendars/mappers";
import {
  type PublicHolidayCalendarDTO,
  PublicHolidayCalendarSourceType,
  PublicHolidayCalendarStatus,
  PublicHolidayCalendarWeekendSubstitution,
} from "@/api/modules/publicHolidays/calendars/dto";

describe("PublicHolidayCalendarMapper", () => {
  const dto: PublicHolidayCalendarDTO = {
    id: "calendar-id",
    name: "Poland",
    status: PublicHolidayCalendarStatus.Active,
    sourceType: PublicHolidayCalendarSourceType.Manual,
    sourceExternalId: null,
    sourceCountryCode: "PL",
    sourceRegionCode: null,
    sourceLocale: "pl-PL",
    weekendSubstitution: PublicHolidayCalendarWeekendSubstitution.None,
    autoFillEnabled: true,
    archivedAt: null,
    archivedBy: null,
    holidayCount: 0,
    years: [2026, 2027],
  };

  it("maps public holiday calendar dto to model", () => {
    expect(publicHolidayCalendarMapper.mapPublicHolidayCalendarDTO(dto)).toEqual(dto);
  });

  it("maps public holiday calendar dto array to models", () => {
    expect(publicHolidayCalendarMapper.mapPublicHolidayCalendarDTOs([dto])).toEqual([dto]);
  });
});
