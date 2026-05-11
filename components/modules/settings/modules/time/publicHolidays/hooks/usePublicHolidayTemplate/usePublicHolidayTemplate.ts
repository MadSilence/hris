import { useQuery } from "@tanstack/react-query";
import { assertPublicHolidayId, getPublicHolidayTemplateQueryKey } from "@/components/modules/settings/modules/time/publicHolidays/utils";
import {
  publicHolidayTemplatesService
} from "@/components/modules/settings/modules/time/publicHolidays/services/publicHolidayTemplatesService";

type UsePublicHolidayTemplateArgs = {
  templateId: string;
};

export const usePublicHolidayTemplate = ({
  templateId,
}: UsePublicHolidayTemplateArgs) => {
  return useQuery({
    queryKey: getPublicHolidayTemplateQueryKey(templateId),
    queryFn: () => {
      assertPublicHolidayId(templateId, "templateId");
      return publicHolidayTemplatesService.getById(templateId);
    },
    enabled: Boolean(templateId && templateId !== "undefined"),
  });
};
