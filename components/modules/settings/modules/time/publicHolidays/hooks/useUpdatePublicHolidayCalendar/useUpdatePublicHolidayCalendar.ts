import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import {
  useInvalidatePublicHolidaysQuery
} from "@/components/modules/settings/modules/time/publicHolidays/hooks/usePublicHolidayCalendars";
import {
  updatePublicHolidayCalendarAction,
  UpdatePublicHolidayCalendarActionInput
} from "@/components/modules/settings/modules/time/publicHolidays/actions/updatePublicHolidayCalendarAction";

export const useUpdatePublicHolidayCalendar = () => {
  const invalidatePublicHolidays = useInvalidatePublicHolidaysQuery();

  return useMutation({
    mutationFn: async (payload: UpdatePublicHolidayCalendarActionInput) => {
      const result = await updatePublicHolidayCalendarAction(payload);

      if (result.status === ActionStatus.ERROR) {
        throw new Error(
          result.errorMessage || "Failed to update public holiday calendar"
        );
      }

      return result;
    },
    onSuccess: () => {
      invalidatePublicHolidays();
    },
  });
};
