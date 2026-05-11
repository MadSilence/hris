import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import {
  useInvalidatePublicHolidaysQuery
} from "@/components/modules/settings/modules/time/publicHolidays/hooks/usePublicHolidayCalendars";
import {
  createPublicHolidayAction,
  CreatePublicHolidayActionInput
} from "@/components/modules/settings/modules/time/publicHolidays/actions/createPublicHolidayAction";

export const useCreatePublicHoliday = () => {
  const invalidatePublicHolidays = useInvalidatePublicHolidaysQuery();

  return useMutation({
    mutationFn: async (payload: CreatePublicHolidayActionInput) => {
      const result = await createPublicHolidayAction(payload);

      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage || "Failed to create public holiday");
      }

      return result;
    },
    onSuccess: () => {
      invalidatePublicHolidays();
    },
  });
};
