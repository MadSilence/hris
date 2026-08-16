import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import {
  updateTimeOffPolicyCoverageAction,
  type UpdateTimeOffPolicyCoverageActionInput,
} from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyCoverage/actions/updateTimeOffPolicyCoverageAction";

export const useUpdateTimeOffPolicyCoverage = () => {
  return useMutation({
    mutationFn: async (payload: UpdateTimeOffPolicyCoverageActionInput) => {
      const result = await updateTimeOffPolicyCoverageAction(payload);

      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage || "Failed to update coverage");
      }

      return result;
    },
  });
};
