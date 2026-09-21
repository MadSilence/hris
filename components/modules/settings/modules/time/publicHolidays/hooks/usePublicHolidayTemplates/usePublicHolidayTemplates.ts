import { useQuery } from "@tanstack/react-query";
import { getPublicHolidayTemplatesQueryKey } from "@/components/modules/settings/modules/time/publicHolidays/utils";
import {
  publicHolidayTemplatesService
} from "@/components/modules/settings/modules/time/publicHolidays/services/publicHolidayTemplatesService";

type UsePublicHolidayTemplatesArgs = {
  enabled?: boolean;
};

/**
 * The template catalogue, which only the "create from a template" flow needs.
 *
 * `enabled` is not an optimisation. The catalogue is its own resource
 * (`ORG.PUBLIC_HOLIDAY_TEMPLATE`), so somebody holding only `ORG.PUBLIC_HOLIDAY_CALENDAR VIEW`
 * is refused it — and while the modal that owns this query was mounted-but-closed on every visit
 * to the settings page, that refusal arrived as a permission card on a page where the person had
 * asked for nothing. Same shape as `usePublicHolidayTemplateRegions` next door.
 */
export const usePublicHolidayTemplates = ({
  enabled = true,
}: UsePublicHolidayTemplatesArgs = {}) => {
  return useQuery({
    queryKey: getPublicHolidayTemplatesQueryKey(),
    queryFn: () => publicHolidayTemplatesService.list(),
    enabled,
  });
};
