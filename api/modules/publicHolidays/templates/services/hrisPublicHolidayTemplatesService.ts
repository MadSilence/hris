import { hrisApiPublicHolidayTemplatesClient } from "@/api/modules/publicHolidays/templates/clients";
import type { PreviewPublicHolidayTemplateRequest } from "@/api/modules/publicHolidays/templates/dto";
import type { PublicHolidayTemplate, PublicHolidayTemplatePreview, } from "@/models/publicHolidays/template";

export class HrisPublicHolidayTemplatesService {
  public async list(): Promise<PublicHolidayTemplate[]> {
    return hrisApiPublicHolidayTemplatesClient.list();
  }

  public async getById(id: string): Promise<PublicHolidayTemplate> {
    return hrisApiPublicHolidayTemplatesClient.getById(id);
  }

  public async preview(
    id: string,
    body: PreviewPublicHolidayTemplateRequest
  ): Promise<PublicHolidayTemplatePreview> {
    return hrisApiPublicHolidayTemplatesClient.preview(id, body);
  }
}

export const hrisPublicHolidayTemplatesService =
  new HrisPublicHolidayTemplatesService();
