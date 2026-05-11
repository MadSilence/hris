import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import {
  useInvalidatePublicHolidaysQuery
} from "@/components/modules/settings/modules/time/publicHolidays/hooks/usePublicHolidayCalendars";
import {
  renamePublicHolidayCalendarAction,
  RenamePublicHolidayCalendarActionInput
} from "@/components/modules/settings/modules/time/publicHolidays/actions/renamePublicHolidayCalendarAction";

export const useRenamePublicHolidayCalendar = () => {
  const invalidatePublicHolidays = useInvalidatePublicHolidaysQuery();

  return useMutation({
    mutationFn: async (payload: RenamePublicHolidayCalendarActionInput) => {
      const result = await renamePublicHolidayCalendarAction(payload);

      if (result.status === ActionStatus.ERROR) {
        throw new Error(
          result.errorMessage || "Failed to rename public holiday calendar"
        );
      }

      return result;
    },
    onSuccess: () => {
      invalidatePublicHolidays();
    },
  });
};
