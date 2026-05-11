import { useQuery } from "@tanstack/react-query";
import { getPublicHolidayTemplatesQueryKey } from "@/components/modules/settings/modules/time/publicHolidays/utils";
import {
  publicHolidayTemplatesService
} from "@/components/modules/settings/modules/time/publicHolidays/services/publicHolidayTemplatesService";

export const usePublicHolidayTemplates = () => {
  return useQuery({
    queryKey: getPublicHolidayTemplatesQueryKey(),
    queryFn: () => publicHolidayTemplatesService.list(),
  });
};
