import {
  PublicHolidayDayPart,
  PublicHolidayOrigin,
  PublicHolidayType,
  type PublicHolidayDTO,
} from "@/api/modules/publicHolidays/holidays/dto";
import { PublicHoliday } from "@/models/publicHolidays/holiday";

export class PublicHolidayMapper {
  public mapPublicHolidayDTO(dto: PublicHolidayDTO): PublicHoliday {
    return {
      // Everything the backend sends, then only what changes on the way. Listing fields one by one
      // lost every field added later, silently — the working week once never reached the calendar.
      ...dto,
      endDate: dto.endDate ?? dto.holidayDate,
      observedDate: dto.observedDate ?? null,
      origin: dto.origin ?? PublicHolidayOrigin.Manual,
      sourceEventId: dto.sourceEventId ?? null,
      dayPart: dto.dayPart ?? PublicHolidayDayPart.FullDay,
      type: dto.type ?? PublicHolidayType.Public,
    };
  }

  public mapPublicHolidayDTOs(dtos: PublicHolidayDTO[]): PublicHoliday[] {
    return dtos.map((dto) => this.mapPublicHolidayDTO(dto));
  }
}

export const publicHolidayMapper = new PublicHolidayMapper();
