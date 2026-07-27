import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useInvalidateTeamsQuery } from "@/components/modules/settings/modules/teams/hooks/useInvalidateTeamsQuery/useInvalidateTeamsQuery";
import {
  createTeamAction,
  type CreateTeamActionInput,
} from "@/components/modules/settings/modules/teams/actions/createTeamAction/createTeamAction";

export const useCreateTeam = () => {
  const invalidate = useInvalidateTeamsQuery();

  return useMutation({
    mutationFn: async (payload: CreateTeamActionInput) => {
      const result = await createTeamAction(payload);
      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage ?? "Failed to create team");
      }
      return result;
    },
    onSuccess: () => invalidate(),
  });
};
