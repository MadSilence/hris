import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useInvalidateEmployeeTimeOffBalancesQuery } from "@/components/modules/settings/modules/time/timeOff/employeeTimeOffBalances/hooks/useEmployeeTimeOffBalancesByUser";
import {
  adjustEmployeeTimeOffBalanceAction,
  type AdjustEmployeeTimeOffBalanceActionInput,
} from "@/components/modules/settings/modules/time/timeOff/employeeTimeOffBalances/actions/adjustEmployeeTimeOffBalanceAction";

export const useAdjustEmployeeTimeOffBalance = () => {
  const invalidateBalances = useInvalidateEmployeeTimeOffBalancesQuery();

  return useMutation({
    mutationFn: async (payload: AdjustEmployeeTimeOffBalanceActionInput) => {
      const result = await adjustEmployeeTimeOffBalanceAction(payload);

      if (result.status === ActionStatus.ERROR) {
        // The code rides along so the form can put a refusal under its field (ETOBB00010 — the date).
        throw Object.assign(new Error(result.errorMessage || "Failed to adjust time off balance"), {
          code: result.code,
        });
      }

      return result;
    },
    onSuccess: () => {
      invalidateBalances();
    },
  });
};
