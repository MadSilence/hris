import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useInvalidateTimeOffRequestsQuery } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useTimeOffRequestsByUser";
import { useInvalidateEmployeeTimeOffBalancesQuery } from "@/components/modules/settings/modules/time/timeOff/employeeTimeOffBalances/hooks/useEmployeeTimeOffBalancesByUser";
import {
  decideCancellationAction,
  type DecideCancellationActionInput,
} from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/actions/decideCancellationAction";

/**
 * Confirming returns the days to the balance and declining leaves the absence standing, so both
 * outcomes change a balance and both invalidate it.
 */
export const useDecideCancellation = () => {
  const invalidateRequests = useInvalidateTimeOffRequestsQuery();
  const invalidateBalances = useInvalidateEmployeeTimeOffBalancesQuery();

  return useMutation({
    mutationFn: async (payload: DecideCancellationActionInput) => {
      const result = await decideCancellationAction(payload);

      if (result.status === ActionStatus.ERROR) {
        throw new Error(
          result.errorMessage || "Failed to answer the cancellation request"
        );
      }

      return result;
    },
    onSuccess: () => {
      invalidateRequests();
      invalidateBalances();
    },
  });
};
