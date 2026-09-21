import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import {
  useInvalidatePublicHolidaysQuery
} from "@/components/modules/settings/modules/time/publicHolidays/hooks/usePublicHolidayCalendars";
import {
  applyPublicHolidayDriftAction,
  dismissPublicHolidayDriftAction,
  type PublicHolidayDriftActionInput,
} from "@/components/modules/settings/modules/time/publicHolidays/actions/publicHolidayDriftActions";

/**
 * Applies a provider's holiday changes. The calendar's days move, so every holiday query is stale
 * afterwards; the inbox is the caller's to refresh.
 */
export const useApplyPublicHolidayDrift = () => {
  const invalidatePublicHolidays = useInvalidatePublicHolidaysQuery();

  return useMutation({
    mutationFn: async (payload: PublicHolidayDriftActionInput) => {
      const result = await applyPublicHolidayDriftAction(payload);

      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage || "Failed to apply the holiday changes");
      }

      return result.data;
    },
    onSuccess: () => {
      invalidatePublicHolidays();
    },
  });
};

/** Dismisses them. Nothing on the calendar changes, so no holiday query does either. */
export const useDismissPublicHolidayDrift = () => {
  return useMutation({
    mutationFn: async (payload: PublicHolidayDriftActionInput) => {
      const result = await dismissPublicHolidayDriftAction(payload);

      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage || "Failed to dismiss the holiday changes");
      }
    },
  });
};
