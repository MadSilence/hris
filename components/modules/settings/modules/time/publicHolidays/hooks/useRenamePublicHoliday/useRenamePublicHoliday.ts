import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import {
  useInvalidatePublicHolidaysQuery
} from "@/components/modules/settings/modules/time/publicHolidays/hooks/usePublicHolidayCalendars";
import {
  renamePublicHolidayAction,
  RenamePublicHolidayActionInput
} from "@/components/modules/settings/modules/time/publicHolidays/actions/renamePublicHolidayAction";

export const useRenamePublicHoliday = () => {
  const invalidatePublicHolidays = useInvalidatePublicHolidaysQuery();

  return useMutation({
    mutationFn: async (payload: RenamePublicHolidayActionInput) => {
      const result = await renamePublicHolidayAction(payload);

      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage || "Failed to rename public holiday");
      }

      return result;
    },
    onSuccess: () => {
      invalidatePublicHolidays();
    },
  });
};
