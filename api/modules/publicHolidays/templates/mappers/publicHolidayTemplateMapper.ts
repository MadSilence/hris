import type {
  PublicHolidayTemplateDTO,
  PublicHolidayTemplatePreviewDTO,
  PublicHolidayTemplatePreviewItemDTO,
} from "@/api/modules/publicHolidays/templates/dto";
import type {
  PublicHolidayTemplate,
  PublicHolidayTemplatePreview,
  PublicHolidayTemplatePreviewItem,
} from "@/models/publicHolidays/template";

export class PublicHolidayTemplateMapper {
  public mapPublicHolidayTemplateDTO(
    dto: PublicHolidayTemplateDTO
  ): PublicHolidayTemplate {
    return {
      // Everything the backend sends, then only what changes on the way. Listing fields one by one
      // lost every field added later, silently — the working week once never reached the calendar.
      ...dto,
    };
  }

  public mapPublicHolidayTemplateDTOs(
    dtos: PublicHolidayTemplateDTO[]
  ): PublicHolidayTemplate[] {
    return dtos.map((dto) => this.mapPublicHolidayTemplateDTO(dto));
  }

  public mapPublicHolidayTemplatePreviewDTO(
    dto: PublicHolidayTemplatePreviewDTO
  ): PublicHolidayTemplatePreview {
    return {
      // Everything the backend sends, then only what changes on the way. Listing fields one by one
      // lost every field added later, silently — the working week once never reached the calendar.
      ...dto,
      regionCode: dto.regionCode ?? null,
      holidays: this.mapPublicHolidayTemplatePreviewItemDTOs(dto.holidays),
    };
  }

  private mapPublicHolidayTemplatePreviewItemDTOs(
    dtos: PublicHolidayTemplatePreviewItemDTO[]
  ): PublicHolidayTemplatePreviewItem[] {
    return dtos.map((dto) => ({
      sourceEventId: dto.sourceEventId,
      name: dto.name,
      holidayDate: dto.holidayDate,
      endDate: dto.endDate ?? dto.holidayDate,
      type: dto.type,
    }));
  }
}

export const publicHolidayTemplateMapper = new PublicHolidayTemplateMapper();
