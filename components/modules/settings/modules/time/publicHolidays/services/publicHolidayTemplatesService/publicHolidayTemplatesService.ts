import { internalApiClient } from "@/components/clients/apiClient";
import type { PublicHolidayTemplate, PublicHolidayTemplatePreview } from "@/models/publicHolidays/template";

export class PublicHolidayTemplatesService {
  public async list(): Promise<PublicHolidayTemplate[]> {
    return internalApiClient.get<PublicHolidayTemplate[]>("/public-holiday/templates");
  }

  public async getById(id: string): Promise<PublicHolidayTemplate> {
    return internalApiClient.get<PublicHolidayTemplate>(`/public-holiday/templates/${id}`);
  }

  public async preview(
    id: string,
    year: number
  ): Promise<PublicHolidayTemplatePreview> {
    return internalApiClient.post<PublicHolidayTemplatePreview>(
      `/public-holiday/templates/${id}/preview`,
      { year },
    );
  }
}

export const publicHolidayTemplatesService =
  new PublicHolidayTemplatesService();
