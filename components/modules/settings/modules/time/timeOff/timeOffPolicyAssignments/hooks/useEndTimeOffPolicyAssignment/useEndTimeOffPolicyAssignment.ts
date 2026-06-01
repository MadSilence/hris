import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useInvalidateTimeOffPolicyAssignmentsQuery } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyAssignments/hooks/useTimeOffPolicyAssignments";
import {
  endTimeOffPolicyAssignmentAction,
  type EndTimeOffPolicyAssignmentActionInput,
} from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyAssignments/actions/endTimeOffPolicyAssignmentAction";

export const useEndTimeOffPolicyAssignment = () => {
  const invalidateAssignments = useInvalidateTimeOffPolicyAssignmentsQuery();

  return useMutation({
    mutationFn: async (payload: EndTimeOffPolicyAssignmentActionInput) => {
      const result = await endTimeOffPolicyAssignmentAction(payload);

      if (result.status === ActionStatus.ERROR) {
        throw new Error(
          result.errorMessage || "Failed to end policy assignment"
        );
      }

      return result;
    },
    onSuccess: (_, variables) => {
      invalidateAssignments(variables.policyId);
    },
  });
};
