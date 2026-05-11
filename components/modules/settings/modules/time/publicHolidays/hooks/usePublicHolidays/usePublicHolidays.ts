import { useQuery } from "@tanstack/react-query";
import { assertPublicHolidayId, getPublicHolidaysQueryKey } from "@/components/modules/settings/modules/time/publicHolidays/utils";
import { publicHolidaysService } from "@/components/modules/settings/modules/time/publicHolidays/services/publicHolidaysService";

type UsePublicHolidaysArgs = {
  calendarId: string;
};

export const usePublicHolidays = ({ calendarId }: UsePublicHolidaysArgs) => {
  return useQuery({
    queryKey: getPublicHolidaysQueryKey(calendarId),
    queryFn: () => {
      assertPublicHolidayId(calendarId, "calendarId");
      return publicHolidaysService.list(calendarId);
    },
    enabled: Boolean(calendarId && calendarId !== "undefined"),
  });
};
