import { useQuery } from "@tanstack/react-query";
import {
  assertPublicHolidayId,
  getPublicHolidayTemplatePreviewQueryKey
} from "@/components/modules/settings/modules/time/publicHolidays/utils";
import {
  publicHolidayTemplatesService
} from "@/components/modules/settings/modules/time/publicHolidays/services/publicHolidayTemplatesService";

type UsePublicHolidayTemplatePreviewArgs = {
  templateId: string;
  year: number | null;
  /** ISO 3166-2 subdivision. Omit for the national days only. */
  regionCode?: string | null;
};

export const usePublicHolidayTemplatePreview = ({
  templateId,
  year,
  regionCode,
}: UsePublicHolidayTemplatePreviewArgs) => {
  return useQuery({
    queryKey: getPublicHolidayTemplatePreviewQueryKey(templateId, year ?? 0, regionCode),
    queryFn: () => {
      assertPublicHolidayId(templateId, "templateId");

      if (!year) {
        throw new Error("year is required");
      }

      return publicHolidayTemplatesService.preview(templateId, year, regionCode);
    },
    enabled: Boolean(templateId && templateId !== "undefined" && year),
  });
};
