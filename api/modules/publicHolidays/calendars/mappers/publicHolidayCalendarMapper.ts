import { PublicHolidayCalendarDTO } from "@/api/modules/publicHolidays/calendars/dto";
import { PublicHolidayCalendar } from "@/models/publicHolidays/calendar";

export class PublicHolidayCalendarMapper {
  public mapPublicHolidayCalendarDTO(
    dto: PublicHolidayCalendarDTO
  ): PublicHolidayCalendar {
    return {
      id: dto.id,
      name: dto.name,
      year: dto.year,
      status: dto.status,
      sourceType: dto.sourceType,
      sourceExternalId: dto.sourceExternalId,
      sourceCountryCode: dto.sourceCountryCode,
      sourceRegionCode: dto.sourceRegionCode,
      sourceLocale: dto.sourceLocale,
      archivedAt: dto.archivedAt,
      archivedBy: dto.archivedBy,
    };
  }

  public mapPublicHolidayCalendarDTOs(
    dtos: PublicHolidayCalendarDTO[]
  ): PublicHolidayCalendar[] {
    return dtos.map((dto) => this.mapPublicHolidayCalendarDTO(dto));
  }
}

export const publicHolidayCalendarMapper = new PublicHolidayCalendarMapper();
