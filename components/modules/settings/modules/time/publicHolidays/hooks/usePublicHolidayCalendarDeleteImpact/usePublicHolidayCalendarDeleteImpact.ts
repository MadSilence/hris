import { useQuery } from "@tanstack/react-query";
import { publicHolidayCalendarsService } from "@/components/modules/settings/modules/time/publicHolidays/services/publicHolidayCalendarsService";

/**
 * What deleting a calendar takes with it. Asked only while the Delete dialog is open, and asked fresh
 * each time: the counts are the whole point of the dialog, so a stale one would be worse than none.
 * One retry, not three: a dead endpoint should say so, not leave the dialog on "checking" for seconds.
 */
export const usePublicHolidayCalendarDeleteImpact = (calendarId: string | null) =>
  useQuery({
    queryKey: ["PUBLIC_HOLIDAY_CALENDAR_DELETE_IMPACT", calendarId],
    queryFn: () => publicHolidayCalendarsService.getDeleteImpact(calendarId as string),
    enabled: Boolean(calendarId),
    staleTime: 0,
    retry: 1,
  });
