"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { TIME_OFF_QUERY_KEY } from "@/components/modules/settings/modules/time/timeOff/utils";
import { getWaitingOnMeQueryKey } from "@/components/modules/notifications/utils/notificationsQueryKeys";
import { COMPANY_CALENDAR_ABSENCES_QUERY_KEY } from "@/components/modules/calendar/hooks/useCompanyCalendar";

/**
 * Everything an answer to a leave request changes for the person who gave it — re-read after it is held, after Undo
 * and once it is applied (`holdWithUndo`). The server hides a held answer from its author (technical_documentation/HELD_ACTIONS.md), so
 * these reads are all it takes: Home's deck and the awaiting-me list, a profile's decision bar, the board's card.
 */
export const useInvalidateLeaveAnswer = () => {
  const queryClient = useQueryClient();
  return useCallback(
    () =>
      Promise.all([
        // Every request list, the awaiting-me one among them.
        queryClient.invalidateQueries({ queryKey: [TIME_OFF_QUERY_KEY, "requests"] }),
        queryClient.invalidateQueries({ queryKey: getWaitingOnMeQueryKey() }),
        queryClient.invalidateQueries({ queryKey: [COMPANY_CALENDAR_ABSENCES_QUERY_KEY] }),
      ]),
    [queryClient],
  );
};
