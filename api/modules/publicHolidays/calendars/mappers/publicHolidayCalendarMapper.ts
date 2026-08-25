import { PublicHolidayCalendarDTO } from "@/api/modules/publicHolidays/calendars/dto";
import { PublicHolidayCalendar } from "@/models/publicHolidays/calendar";

export class PublicHolidayCalendarMapper {
  public mapPublicHolidayCalendarDTO(
    dto: PublicHolidayCalendarDTO
  ): PublicHolidayCalendar {
    return {
      id: dto.id,
      name: dto.name,
      status: dto.status,
      sourceType: dto.sourceType,
      sourceExternalId: dto.sourceExternalId,
      sourceCountryCode: dto.sourceCountryCode,
      sourceRegionCode: dto.sourceRegionCode,
      sourceLocale: dto.sourceLocale,
      weekendSubstitution: dto.weekendSubstitution,
      autoFillEnabled: dto.autoFillEnabled ?? true,
      archivedAt: dto.archivedAt,
      archivedBy: dto.archivedBy,
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
