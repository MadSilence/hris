import { useMutation } from "@tanstack/react-query";

import { ActionStatus } from "@/components/models/ActionStatus";
import {
  useInvalidatePublicHolidaysQuery
} from "@/components/modules/settings/modules/time/publicHolidays/hooks/usePublicHolidayCalendars";
import {
  replacePublicHolidayYearAction,
  type ReplacePublicHolidayYearActionInput,
} from "@/components/modules/settings/modules/time/publicHolidays/actions/replacePublicHolidayYearAction";

/** Saves one calendar-year of days in a single request. */
export const useReplacePublicHolidayYear = () => {
  const invalidatePublicHolidays = useInvalidatePublicHolidaysQuery();

  return useMutation({
    mutationFn: async (payload: ReplacePublicHolidayYearActionInput) => {
      const result = await replacePublicHolidayYearAction(payload);

      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage || "Failed to save the holiday days");
      }

      return result.data ?? [];
    },
    onSuccess: () => {
      invalidatePublicHolidays();
    },
  });
};
