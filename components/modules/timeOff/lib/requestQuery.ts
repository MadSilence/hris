import { useQuery } from "@tanstack/react-query";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import type { TimeOffDecisionContext } from "@/models/timeOff";

/** One request with what reading it needs — the request in full, Home's deck. */
export const timeOffDecisionQueryKey = (id: string) => ["TIME_OFF_DECISION_CONTEXT", id] as const;

/**
 * The request and what its decision needs (`GET /time-off/requests/{id}/decision-context`), which the requester, the
 * people in its approval and whoever manages the person's time off may read.
 */
export const useLeaveRequestContext = (requestId: string | null, options?: { staleTime?: number }) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<TimeOffDecisionContext>({
    queryKey: timeOffDecisionQueryKey(requestId ?? ""),
    queryFn: () => internalApiClient.get<TimeOffDecisionContext>(`/time-off/requests/${requestId}/decision-context`),
    enabled: Boolean(requestId),
    staleTime: options?.staleTime,
  });
};
