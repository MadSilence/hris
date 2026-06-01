import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useInvalidateTimeOffPolicyAssignmentsQuery } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyAssignments/hooks/useTimeOffPolicyAssignments";
import {
  createTimeOffPolicyAssignmentAction,
  type CreateTimeOffPolicyAssignmentActionInput,
} from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyAssignments/actions/createTimeOffPolicyAssignmentAction";

export const useCreateTimeOffPolicyAssignment = () => {
  const invalidateAssignments = useInvalidateTimeOffPolicyAssignmentsQuery();

  return useMutation({
    mutationFn: async (payload: CreateTimeOffPolicyAssignmentActionInput) => {
      const result = await createTimeOffPolicyAssignmentAction(payload);

      if (result.status === ActionStatus.ERROR) {
        throw new Error(
          result.errorMessage || "Failed to create policy assignment"
        );
      }

      return result;
    },
    onSuccess: (_, variables) => {
      invalidateAssignments(variables.policyId);
    },
  });
};
