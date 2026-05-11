import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import {
  useInvalidatePublicHolidaysQuery
} from "@/components/modules/settings/modules/time/publicHolidays/hooks/usePublicHolidayCalendars";
import {
  updatePublicHolidayAction,
  UpdatePublicHolidayActionInput
} from "@/components/modules/settings/modules/time/publicHolidays/actions/updatePublicHolidayAction";

export const useUpdatePublicHoliday = () => {
  const invalidatePublicHolidays = useInvalidatePublicHolidaysQuery();

  return useMutation({
    mutationFn: async (payload: UpdatePublicHolidayActionInput) => {
      const result = await updatePublicHolidayAction(payload);

      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage || "Failed to update public holiday");
      }

      return result;
    },
    onSuccess: () => {
      invalidatePublicHolidays();
    },
  });
};
