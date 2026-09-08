import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  assertTimeOffId,
  getTimeOffRequestsByUserQueryKey,
  TIME_OFF_QUERY_KEY,
} from "@/components/modules/settings/modules/time/timeOff/utils";
import { timeOffRequestsService } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/services/timeOffRequestsService";

type UseTimeOffRequestsByUserArgs = {
  userId: string;
  /** Only requests touching this year. */
  year?: number | null;
  /** Only requests in this status. */
  status?: string | null;
};

export const useTimeOffRequestsByUser = ({
  userId,
  year = null,
  status = null,
}: UseTimeOffRequestsByUserArgs) => {
  return useQuery({
    queryKey: getTimeOffRequestsByUserQueryKey(userId, { year, status }),
    queryFn: () => {
      assertTimeOffId(userId, "userId");
      return timeOffRequestsService.listByUserId(userId, { year, status });
    },
    enabled: Boolean(userId && userId !== "undefined"),
  });
};

export const useInvalidateTimeOffRequestsQuery = () => {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({
      queryKey: [TIME_OFF_QUERY_KEY, "requests"],
    });
  };
};
