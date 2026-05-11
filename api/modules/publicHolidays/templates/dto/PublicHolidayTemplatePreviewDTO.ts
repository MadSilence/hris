import { PublicHolidayTemplatePreviewItemDTO } from "./PublicHolidayTemplatePreviewItemDTO";

export type PublicHolidayTemplatePreviewDTO = {
  templateId: string;
  templateName: string;
  year: number;
  holidays: PublicHolidayTemplatePreviewItemDTO[];
};
