import type { PublicHolidayDTO } from "@/api/modules/publicHolidays/holidays/dto";
import { PublicHoliday } from "@/models/publicHolidays/holiday";

export class PublicHolidayMapper {
  public mapPublicHolidayDTO(dto: PublicHolidayDTO): PublicHoliday {
    return {
      id: dto.id,
      calendarId: dto.calendarId,
      calendarYear: dto.calendarYear,
      name: dto.name,
      holidayDate: dto.holidayDate,
    };
  }

  public mapPublicHolidayDTOs(dtos: PublicHolidayDTO[]): PublicHoliday[] {
    return dtos.map((dto) => this.mapPublicHolidayDTO(dto));
  }
}

export const publicHolidayMapper = new PublicHolidayMapper();
