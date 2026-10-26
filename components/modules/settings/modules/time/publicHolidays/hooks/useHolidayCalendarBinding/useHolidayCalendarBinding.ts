import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ActionStatus } from "@/components/models/ActionStatus";
import type { ActionResult } from "@/lib/errors/withActionError";
import { getHolidayCalendarBindingQueryKey } from "@/components/modules/settings/modules/time/publicHolidays/utils";
import { holidayCalendarBindingsService } from "@/components/modules/settings/modules/time/publicHolidays/services/holidayCalendarBindingsService";
import {
  previewHolidayCalendarBindingAction,
  setHolidayCalendarBindingAction,
} from "@/components/modules/settings/modules/time/publicHolidays/actions/holidayCalendarBindingActions";
import type { HolidayCalendarBindingKind, HolidayCalendarBindingRequest } from "@/models/publicHolidays/binding";

/** An ERROR envelope becomes a rejected mutation, carrying the code so the dictionary can word it. */
const unwrap = <T>(result: ActionResult<T>): T => {
  if (result.status === ActionStatus.ERROR) {
    throw Object.assign(new Error(result.errorMessage ?? "The holiday calendar could not be set"), { code: result.code });
  }
  return result.data as T;
};

/** The Holiday Calendar field of an office, a legal entity (`refId`) or the company default (`null`). */
export const useHolidayCalendarBinding = (kind: HolidayCalendarBindingKind, refId: string | null, enabled = true) =>
  useQuery({
    queryKey: getHolidayCalendarBindingQueryKey(kind, refId),
    queryFn: () => holidayCalendarBindingsService.get(kind, refId),
    enabled: enabled && (kind === "COMPANY_DEFAULT" || Boolean(refId)),
  });

export const usePreviewHolidayCalendarBinding = () =>
  useMutation({
    mutationFn: async (payload: HolidayCalendarBindingRequest) => unwrap(await previewHolidayCalendarBindingAction(payload)),
  });

/**
 * Applies the field. Everybody's calendar may have moved — the people of this place, and those handed to
 * the next binding down — so every holiday and people query is stale afterwards.
 */
export const useSetHolidayCalendarBinding = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: HolidayCalendarBindingRequest) => unwrap(await setHolidayCalendarBindingAction(payload)),
    onSuccess: () => {
      void queryClient.invalidateQueries();
    },
  });
};
