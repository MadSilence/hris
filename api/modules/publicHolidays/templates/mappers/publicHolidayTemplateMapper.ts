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
      id: dto.id,
      provider: dto.provider,
      name: dto.name,
      description: dto.description,
      countryCode: dto.countryCode,
      countryName: dto.countryName,
      regionCode: dto.regionCode,
      regionName: dto.regionName,
      languageCode: dto.languageCode,
      supportedYearFrom: dto.supportedYearFrom,
      supportedYearTo: dto.supportedYearTo,
      regional: dto.regional,
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
      templateId: dto.templateId,
      templateName: dto.templateName,
      year: dto.year,
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
    }));
  }
}

export const publicHolidayTemplateMapper = new PublicHolidayTemplateMapper();
