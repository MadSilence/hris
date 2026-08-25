import { useMutation } from "@tanstack/react-query";

import { ActionStatus } from "@/components/models/ActionStatus";
import {
  useInvalidatePublicHolidaysQuery
} from "@/components/modules/settings/modules/time/publicHolidays/hooks/usePublicHolidayCalendars";
import {
  fillPublicHolidayYearAction,
  type FillPublicHolidayYearActionInput,
} from "@/components/modules/settings/modules/time/publicHolidays/actions/fillPublicHolidayYearAction";

export const useFillPublicHolidayYear = () => {
  const invalidatePublicHolidays = useInvalidatePublicHolidaysQuery();

  return useMutation({
    mutationFn: async (payload: FillPublicHolidayYearActionInput) => {
      const result = await fillPublicHolidayYearAction(payload);

      if (result.status === ActionStatus.ERROR || !result.data) {
        throw new Error(result.errorMessage || "Failed to load the year");
      }

      return result.data;
    },
    onSuccess: () => {
      invalidatePublicHolidays();
    },
  });
};
