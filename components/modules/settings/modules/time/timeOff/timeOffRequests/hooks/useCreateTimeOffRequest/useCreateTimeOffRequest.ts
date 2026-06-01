import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useInvalidateTimeOffRequestsQuery } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useTimeOffRequestsByUser";
import { useInvalidateEmployeeTimeOffBalancesQuery } from "@/components/modules/settings/modules/time/timeOff/employeeTimeOffBalances/hooks/useEmployeeTimeOffBalancesByUser";
import {
  createTimeOffRequestAction,
  type CreateTimeOffRequestActionInput,
} from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/actions/createTimeOffRequestAction";

export const useCreateTimeOffRequest = () => {
  const invalidateRequests = useInvalidateTimeOffRequestsQuery();
  // TODO: invalidate affected balance after request is submitted (balance is consumed immediately)
  const invalidateBalances = useInvalidateEmployeeTimeOffBalancesQuery();

  return useMutation({
    mutationFn: async (payload: CreateTimeOffRequestActionInput) => {
      const result = await createTimeOffRequestAction(payload);

      if (result.status === ActionStatus.ERROR) {
        throw new Error(
          result.errorMessage || "Failed to submit time off request"
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
