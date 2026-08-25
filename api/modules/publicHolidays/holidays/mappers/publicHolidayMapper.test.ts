import { publicHolidayMapper } from "@/api/modules/publicHolidays/holidays/mappers";
import {
  PublicHolidayDayPart,
  PublicHolidayOrigin,
  PublicHolidayType,
  type PublicHolidayDTO,
} from "@/api/modules/publicHolidays/holidays/dto";

describe("PublicHolidayMapper", () => {
  const dto: PublicHolidayDTO = {
    id: "holiday-id",
    calendarId: "calendar-id",
    calendarYear: 2026,
    name: "New Year",
    holidayDate: "2026-01-01",
    endDate: "2026-01-01",
    observedDate: null,
    origin: PublicHolidayOrigin.Source,
    sourceEventId: "src-1",
    dayPart: PublicHolidayDayPart.FullDay,
    type: PublicHolidayType.Public,
  };

  it("maps public holiday dto to model", () => {
    expect(publicHolidayMapper.mapPublicHolidayDTO(dto)).toEqual(dto);
  });

  it("maps public holiday dto array to models", () => {
    expect(publicHolidayMapper.mapPublicHolidayDTOs([dto])).toEqual([dto]);
  });
});
