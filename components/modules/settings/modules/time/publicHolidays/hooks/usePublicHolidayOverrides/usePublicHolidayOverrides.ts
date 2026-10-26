import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";

import { ActionStatus } from "@/components/models/ActionStatus";
import {
  assertPublicHolidayId,
  getPublicHolidayOverridesQueryKey,
} from "@/components/modules/settings/modules/time/publicHolidays/utils";
import { publicHolidaysService } from "@/components/modules/settings/modules/time/publicHolidays/services/publicHolidaysService";
import {
  useInvalidatePublicHolidaysQuery
} from "@/components/modules/settings/modules/time/publicHolidays/hooks/usePublicHolidayCalendars";
import {
  revertPublicHolidayOverrideAction,
  type RevertPublicHolidayOverrideActionInput,
} from "@/components/modules/settings/modules/time/publicHolidays/actions/revertPublicHolidayOverrideAction";

type UsePublicHolidayOverridesArgs = {
  calendarId: string;
  year: number;
  /** Off for a calendar with no provider: it has nothing to override. */
  enabled?: boolean;
};

/** The company's overrides of the provider's days in one year — read beside the days. */
export const usePublicHolidayOverrides = ({ calendarId, year, enabled = true }: UsePublicHolidayOverridesArgs) => {
  return useQuery({
    queryKey: getPublicHolidayOverridesQueryKey(calendarId, year),
    placeholderData: keepPreviousData,
    queryFn: () => {
      assertPublicHolidayId(calendarId, "calendarId");
      return publicHolidaysService.listOverrides(calendarId, year);
    },
    enabled: enabled && Boolean(calendarId && calendarId !== "undefined"),
  });
};

/**
 * "Revert to Provider". The day, its observed date and the calendar's version all move, so every holiday
 * query is stale afterwards — the overrides included, since they live under the same key.
 */
export const useRevertPublicHolidayOverride = () => {
  const invalidatePublicHolidays = useInvalidatePublicHolidaysQuery();

  return useMutation({
    mutationFn: async (payload: RevertPublicHolidayOverrideActionInput) => {
      const result = await revertPublicHolidayOverrideAction(payload);

      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage || "Failed to return the day to the provider's version");
      }

      return result.data;
    },
    onSuccess: () => {
      invalidatePublicHolidays();
    },
  });
};
