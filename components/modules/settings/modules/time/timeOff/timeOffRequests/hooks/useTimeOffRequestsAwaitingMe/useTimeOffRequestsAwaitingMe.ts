import { useQuery } from "@tanstack/react-query";
import { getTimeOffRequestsAwaitingMeQueryKey } from "@/components/modules/settings/modules/time/timeOff/utils";
import { timeOffRequestsService } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/services/timeOffRequestsService";

/**
 * What is waiting for my decision.
 *
 * Until this existed the actionable notification inbox was the only path to approving anything, so
 * an approver who cleared their inbox could not find what was outstanding.
 */
export const useTimeOffRequestsAwaitingMe = () => {
  return useQuery({
    queryKey: getTimeOffRequestsAwaitingMeQueryKey(),
    queryFn: () => timeOffRequestsService.listAwaitingMe(),
    staleTime: 30 * 1000,
  });
};
