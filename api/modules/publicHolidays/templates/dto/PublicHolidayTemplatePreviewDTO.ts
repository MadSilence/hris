import { PublicHolidayTemplatePreviewItemDTO } from "./PublicHolidayTemplatePreviewItemDTO";

export type PublicHolidayTemplatePreviewDTO = {
  templateId: string;
  templateName: string;
  year: number;
  regionCode: string | null;
  holidays: PublicHolidayTemplatePreviewItemDTO[];
};
