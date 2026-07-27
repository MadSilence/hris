import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useInvalidateTeamsQuery } from "@/components/modules/settings/modules/teams/hooks/useInvalidateTeamsQuery/useInvalidateTeamsQuery";
import {
  updateTeamAction,
  type UpdateTeamActionInput,
} from "@/components/modules/settings/modules/teams/actions/updateTeamAction/updateTeamAction";

export const useUpdateTeam = () => {
  const invalidate = useInvalidateTeamsQuery();

  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & UpdateTeamActionInput) => {
      const result = await updateTeamAction(id, payload);
      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage ?? "Failed to update team");
      }
      return result;
    },
    onSuccess: () => invalidate(),
  });
};
