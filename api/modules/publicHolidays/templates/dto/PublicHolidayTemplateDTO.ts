import { PublicHolidayTemplateProvider } from "./PublicHolidayTemplateProvider";

export type PublicHolidayTemplateDTO = {
  id: string;
  provider: PublicHolidayTemplateProvider;
  name: string;
  description: string | null;
  countryCode: string;
  countryName: string;
  regionCode: string | null;
  regionName: string | null;
  languageCode: string;
  supportedYearFrom: number | null;
  supportedYearTo: number | null;
  regional: boolean;
};
