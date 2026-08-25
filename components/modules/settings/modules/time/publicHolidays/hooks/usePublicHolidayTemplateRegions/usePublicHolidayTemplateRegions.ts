import { useQuery } from "@tanstack/react-query";
import {
  assertPublicHolidayId,
  getPublicHolidayTemplateRegionsQueryKey
} from "@/components/modules/settings/modules/time/publicHolidays/utils";
import {
  publicHolidayTemplatesService
} from "@/components/modules/settings/modules/time/publicHolidays/services/publicHolidayTemplatesService";

type UsePublicHolidayTemplateRegionsArgs = {
  templateId: string;
  year: number;
  enabled?: boolean;
};

/**
 * Subdivisions a template offers. Comes back empty for providers that have none — Google's holiday
 * calendars are country-level, which is why Nager is the primary source.
 */
export const usePublicHolidayTemplateRegions = ({
  templateId,
  year,
  enabled = true,
}: UsePublicHolidayTemplateRegionsArgs) => {
  return useQuery({
    queryKey: getPublicHolidayTemplateRegionsQueryKey(templateId, year),
    queryFn: () => {
      assertPublicHolidayId(templateId, "templateId");
      return publicHolidayTemplatesService.regions(templateId, year);
    },
    enabled: Boolean(enabled && templateId && templateId !== "undefined"),
  });
};
