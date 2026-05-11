import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import {
  useInvalidatePublicHolidaysQuery
} from "@/components/modules/settings/modules/time/publicHolidays/hooks/usePublicHolidayCalendars";
import {
  deactivatePublicHolidayCalendarAction,
  DeactivatePublicHolidayCalendarActionInput
} from "@/components/modules/settings/modules/time/publicHolidays/actions/deactivatePublicHolidayCalendarAction";

export const useDeactivatePublicHolidayCalendar = () => {
  const invalidatePublicHolidays = useInvalidatePublicHolidaysQuery();

  return useMutation({
    mutationFn: async (payload: DeactivatePublicHolidayCalendarActionInput) => {
      const result = await deactivatePublicHolidayCalendarAction(payload);

      if (result.status === ActionStatus.ERROR) {
        throw new Error(
          result.errorMessage || "Failed to deactivate public holiday calendar"
        );
      }

      return result;
    },
    onSuccess: () => {
      invalidatePublicHolidays();
    },
  });
};
