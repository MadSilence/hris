import { PublicHolidayTemplatePreviewItem } from "@/models/publicHolidays/template/PublicHolidayTemplatePreviewItem";

export type PublicHolidayTemplatePreview = {
  templateId: string;
  templateName: string;
  year: number;
  holidays: PublicHolidayTemplatePreviewItem[];
};
