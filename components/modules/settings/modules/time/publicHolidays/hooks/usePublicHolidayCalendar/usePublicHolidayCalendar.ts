import { useQuery } from "@tanstack/react-query";
import { assertPublicHolidayId, getPublicHolidayCalendarQueryKey } from "@/components/modules/settings/modules/time/publicHolidays/utils";
import {
  publicHolidayCalendarsService
} from "@/components/modules/settings/modules/time/publicHolidays/services/publicHolidayCalendarsService";

type UsePublicHolidayCalendarArgs = {
  calendarId: string;
};

export const usePublicHolidayCalendar = ({
  calendarId,
}: UsePublicHolidayCalendarArgs) => {
  return useQuery({
    queryKey: getPublicHolidayCalendarQueryKey(calendarId),
    queryFn: () => {
      assertPublicHolidayId(calendarId, "calendarId");
      return publicHolidayCalendarsService.getById(calendarId);
    },
    enabled: Boolean(calendarId && calendarId !== "undefined"),
  });
};
