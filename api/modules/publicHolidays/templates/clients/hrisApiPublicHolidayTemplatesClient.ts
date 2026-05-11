import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type {
  PreviewPublicHolidayTemplateRequest,
  PublicHolidayTemplateDTO,
  PublicHolidayTemplatePreviewDTO,
} from "@/api/modules/publicHolidays/templates/dto";
import { publicHolidayTemplateMapper } from "@/api/modules/publicHolidays/templates/mappers";
import type { PublicHolidayTemplate, PublicHolidayTemplatePreview, } from "@/models/publicHolidays/template";

export class HrisApiPublicHolidayTemplatesClient {
  private readonly BASE_PATH = "/public-holiday-templates";

  public async list(): Promise<PublicHolidayTemplate[]> {
    const dtos = await hrisApiClient.get<PublicHolidayTemplateDTO[]>(
      this.BASE_PATH
    );

    return publicHolidayTemplateMapper.mapPublicHolidayTemplateDTOs(dtos);
  }

  public async getById(id: string): Promise<PublicHolidayTemplate> {
    const dto = await hrisApiClient.get<PublicHolidayTemplateDTO>(
      `${this.BASE_PATH}/${id}`
    );

    return publicHolidayTemplateMapper.mapPublicHolidayTemplateDTO(dto);
  }

  public async preview(
    id: string,
    body: PreviewPublicHolidayTemplateRequest
  ): Promise<PublicHolidayTemplatePreview> {
    const dto = await hrisApiClient.post<PublicHolidayTemplatePreviewDTO>(
      `${this.BASE_PATH}/${id}/preview`,
      body as unknown as Record<string, unknown>
    );

    return publicHolidayTemplateMapper.mapPublicHolidayTemplatePreviewDTO(dto);
  }
}

export const hrisApiPublicHolidayTemplatesClient =
  new HrisApiPublicHolidayTemplatesClient();
