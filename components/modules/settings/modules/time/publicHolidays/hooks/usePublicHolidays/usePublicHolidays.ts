import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { assertPublicHolidayId, getPublicHolidaysQueryKey } from "@/components/modules/settings/modules/time/publicHolidays/utils";
import { publicHolidaysService } from "@/components/modules/settings/modules/time/publicHolidays/services/publicHolidaysService";

type UsePublicHolidaysArgs = {
  calendarId: string;
  /** Omit for every year the calendar holds. */
  year?: number;
};

export const usePublicHolidays = ({ calendarId, year }: UsePublicHolidaysArgs) => {
  return useQuery({
    queryKey: getPublicHolidaysQueryKey(calendarId, year),
    // Same reason: the year select is a control, and emptying the editor between years reads as
    // "this year has no holidays" for as long as the request takes.
    placeholderData: keepPreviousData,
    queryFn: () => {
      assertPublicHolidayId(calendarId, "calendarId");
      return publicHolidaysService.list(calendarId, year);
    },
    enabled: Boolean(calendarId && calendarId !== "undefined"),
  });
};
