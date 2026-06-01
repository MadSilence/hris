import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useInvalidateTimeOffRequestsQuery } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useTimeOffRequestsByUser";
import { useInvalidateEmployeeTimeOffBalancesQuery } from "@/components/modules/settings/modules/time/timeOff/employeeTimeOffBalances/hooks/useEmployeeTimeOffBalancesByUser";
import {
  rejectTimeOffRequestAction,
  type RejectTimeOffRequestActionInput,
} from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/actions/rejectTimeOffRequestAction";

export const useRejectTimeOffRequest = () => {
  const invalidateRequests = useInvalidateTimeOffRequestsQuery();
  // TODO: invalidate affected balance after rejection (balance is restored on reject)
  const invalidateBalances = useInvalidateEmployeeTimeOffBalancesQuery();

  return useMutation({
    mutationFn: async (payload: RejectTimeOffRequestActionInput) => {
      const result = await rejectTimeOffRequestAction(payload);

      if (result.status === ActionStatus.ERROR) {
        throw new Error(
          result.errorMessage || "Failed to reject time off request"
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
