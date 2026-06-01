import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useInvalidateEmployeeTimeOffBalancesQuery } from "@/components/modules/settings/modules/time/timeOff/employeeTimeOffBalances/hooks/useEmployeeTimeOffBalancesByUser";
import {
  createEmployeeTimeOffBalanceAction,
  type CreateEmployeeTimeOffBalanceActionInput,
} from "@/components/modules/settings/modules/time/timeOff/employeeTimeOffBalances/actions/createEmployeeTimeOffBalanceAction";

export const useCreateEmployeeTimeOffBalance = () => {
  const invalidateBalances = useInvalidateEmployeeTimeOffBalancesQuery();

  return useMutation({
    mutationFn: async (payload: CreateEmployeeTimeOffBalanceActionInput) => {
      const result = await createEmployeeTimeOffBalanceAction(payload);

      if (result.status === ActionStatus.ERROR) {
        throw new Error(
          result.errorMessage || "Failed to create time off balance"
        );
      }

      return result;
    },
    onSuccess: () => {
      invalidateBalances();
    },
  });
};
