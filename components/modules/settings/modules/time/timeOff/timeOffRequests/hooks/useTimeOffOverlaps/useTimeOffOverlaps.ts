import { useQuery } from "@tanstack/react-query";
import { TIME_OFF_QUERY_KEY } from "@/components/modules/settings/modules/time/timeOff/utils";
import { timeOffRequestsService } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/services/timeOffRequestsService";

/**
 * Colleagues (same team / department) already away over the picked range. Used as a soft signal in
 * the request form — never a blocker; the coverage rules on the policy are what actually decide.
 */
export const useTimeOffOverlaps = (
  userId: string | undefined,
  startDate: string,
  endDate: string,
) => {
  const enabled = Boolean(userId && startDate && endDate && startDate <= endDate);
  return useQuery({
    queryKey: [TIME_OFF_QUERY_KEY, "overlaps", userId, startDate, endDate],
    queryFn: () => timeOffRequestsService.listOverlaps(userId as string, startDate, endDate),
    enabled,
  });
};
