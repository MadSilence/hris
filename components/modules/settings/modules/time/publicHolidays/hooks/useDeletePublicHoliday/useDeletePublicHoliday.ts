import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import {
  useInvalidatePublicHolidaysQuery
} from "@/components/modules/settings/modules/time/publicHolidays/hooks/usePublicHolidayCalendars";
import {
  deletePublicHolidayAction,
  DeletePublicHolidayActionInput
} from "@/components/modules/settings/modules/time/publicHolidays/actions/deletePublicHolidayAction";

export const useDeletePublicHoliday = () => {
  const invalidatePublicHolidays = useInvalidatePublicHolidaysQuery();

  return useMutation({
    mutationFn: async (payload: DeletePublicHolidayActionInput) => {
      const result = await deletePublicHolidayAction(payload);

      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage || "Failed to delete public holiday");
      }

      return result;
    },
    onSuccess: () => {
      invalidatePublicHolidays();
    },
  });
};
