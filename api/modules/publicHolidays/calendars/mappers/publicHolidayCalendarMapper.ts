import { PublicHolidayCalendarDTO } from "@/api/modules/publicHolidays/calendars/dto";
import { PublicHolidayCalendar } from "@/models/publicHolidays/calendar";

export class PublicHolidayCalendarMapper {
  public mapPublicHolidayCalendarDTO(
    dto: PublicHolidayCalendarDTO
  ): PublicHolidayCalendar {
    return {
      // Everything the backend sends, then only what changes on the way. Listing fields one by one
      // lost every field added later, silently — the working week once never reached the calendar.
      ...dto,
      autoFillEnabled: dto.autoFillEnabled ?? true,
      holidayCount: dto.holidayCount ?? 0,
      years: dto.years ?? [],
    };
  }

  public mapPublicHolidayCalendarDTOs(
    dtos: PublicHolidayCalendarDTO[]
  ): PublicHolidayCalendar[] {
    return dtos.map((dto) => this.mapPublicHolidayCalendarDTO(dto));
  }
}

export const publicHolidayCalendarMapper = new PublicHolidayCalendarMapper();
