import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useInvalidateTeamsQuery } from "@/components/modules/settings/modules/teams/hooks/useInvalidateTeamsQuery/useInvalidateTeamsQuery";
import {
  deleteTeamAction,
  type DeleteTeamActionInput,
} from "@/components/modules/settings/modules/teams/actions/deleteTeamAction/deleteTeamAction";

export const useDeleteTeam = () => {
  const invalidate = useInvalidateTeamsQuery();

  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & DeleteTeamActionInput) => {
      const result = await deleteTeamAction(id, payload);
      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage ?? "Failed to delete team");
      }
      return result;
    },
    onSuccess: () => invalidate(),
  });
};
