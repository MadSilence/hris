"use client";

import { useQuery } from "@tanstack/react-query";
import type { CompanyCalendarAbsenceSummary } from "@/models/calendar";
import { useAppDataContext } from "@/components/providers/AppDataProvider";

export const personAbsenceSummaryQueryKey = (userId: string) => ["PERSON_ABSENCE_SUMMARY", userId] as const;

/**
 * A person's absence today and their next one, for the profile header's "Off until" and next leave (R12). Read only
 * by a holder of `PEOPLE.CALENDAR` VIEW (`enabled`) — the board's gate — so a reader without it is not refused.
 */
export const usePersonAbsenceSummary = (userId: string, enabled: boolean) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<CompanyCalendarAbsenceSummary>({
    queryKey: personAbsenceSummaryQueryKey(userId),
    queryFn: () =>
      internalApiClient.get<CompanyCalendarAbsenceSummary>(
        `/calendar/company/people/${encodeURIComponent(userId)}/absences/current-and-next`,
      ),
    enabled: enabled && Boolean(userId),
    staleTime: 60_000,
  });
};
