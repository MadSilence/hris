import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import {
  useInvalidatePublicHolidaysQuery
} from "@/components/modules/settings/modules/time/publicHolidays/hooks/usePublicHolidayCalendars";
import {
  duplicatePublicHolidayCalendarAction,
  DuplicatePublicHolidayCalendarActionInput
} from "@/components/modules/settings/modules/time/publicHolidays/actions/duplicatePublicHolidayCalendarAction";

export const useDuplicatePublicHolidayCalendar = () => {
  const invalidatePublicHolidays = useInvalidatePublicHolidaysQuery();

  return useMutation({
    mutationFn: async (payload: DuplicatePublicHolidayCalendarActionInput) => {
      const result = await duplicatePublicHolidayCalendarAction(payload);

      if (result.status === ActionStatus.ERROR) {
        throw new Error(
          result.errorMessage || "Failed to duplicate public holiday calendar"
        );
      }

      return result;
    },
    onSuccess: () => {
      invalidatePublicHolidays();
    },
  });
};
