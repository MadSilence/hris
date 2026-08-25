import { PublicHolidayType } from "@/api/modules/publicHolidays/holidays/dto";

export type PreviewPublicHolidayTemplateRequest = {
  year: number;
  /** ISO 3166-2 subdivision. Omit for the national days only. */
  regionCode?: string | null;
  /** Day types to include beyond PUBLIC. */
  extraTypes?: PublicHolidayType[];
};
