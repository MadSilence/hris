import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import {
  useInvalidatePublicHolidaysQuery
} from "@/components/modules/settings/modules/time/publicHolidays/hooks/usePublicHolidayCalendars";
import {
  restorePublicHolidayCalendarAction,
  RestorePublicHolidayCalendarActionInput
} from "@/components/modules/settings/modules/time/publicHolidays/actions/restorePublicHolidayCalendarAction";

export const useRestorePublicHolidayCalendar = () => {
  const invalidatePublicHolidays = useInvalidatePublicHolidaysQuery();

  return useMutation({
    mutationFn: async (payload: RestorePublicHolidayCalendarActionInput) => {
      const result = await restorePublicHolidayCalendarAction(payload);

      if (result.status === ActionStatus.ERROR) {
        throw new Error(
          result.errorMessage || "Failed to restore public holiday calendar"
        );
      }

      return result;
    },
    onSuccess: () => {
      invalidatePublicHolidays();
    },
  });
};
