import { PublicHolidayTemplatePreviewItem } from "@/models/publicHolidays/template/PublicHolidayTemplatePreviewItem";

export type PublicHolidayTemplatePreview = {
  templateId: string;
  templateName: string;
  year: number;
  /** The subdivision the preview was cut for, or null for the national set. */
  regionCode: string | null;
  holidays: PublicHolidayTemplatePreviewItem[];
};
