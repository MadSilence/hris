import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getPublicHolidayCalendarsQueryKey,
  PUBLIC_HOLIDAYS_QUERY_KEY
} from "@/components/modules/settings/modules/time/publicHolidays/utils";
import {
  publicHolidayCalendarsService
} from "@/components/modules/settings/modules/time/publicHolidays/services/publicHolidayCalendarsService";

export const usePublicHolidayCalendars = () => {
  return useQuery({
    queryKey: getPublicHolidayCalendarsQueryKey(),
    queryFn: () => publicHolidayCalendarsService.list(),
  });
};

export const useInvalidatePublicHolidaysQuery = () => {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({
      queryKey: [PUBLIC_HOLIDAYS_QUERY_KEY],
    });
  };
};
