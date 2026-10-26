import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useInvalidateTimeOffRequestsQuery } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useTimeOffRequestsByUser";
import { useInvalidateEmployeeTimeOffBalancesQuery } from "@/components/modules/settings/modules/time/timeOff/employeeTimeOffBalances/hooks/useEmployeeTimeOffBalancesByUser";
import {
  decideAnywayTimeOffRequestAction,
  type DecideAnywayActionInput,
} from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/actions/decideAnywayTimeOffRequestAction";

/** Approve Anyway / Reject Anyway. A rejection gives the days back, so balances are refreshed too. */
export const useDecideAnyway = () => {
  const invalidateRequests = useInvalidateTimeOffRequestsQuery();
  const invalidateBalances = useInvalidateEmployeeTimeOffBalancesQuery();

  return useMutation({
    mutationFn: async (payload: DecideAnywayActionInput) => {
      const result = await decideAnywayTimeOffRequestAction(payload);
      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage || "Failed to decide the request");
      }
      return result;
    },
    onSuccess: () => {
      invalidateRequests();
      invalidateBalances();
    },
  });
};
