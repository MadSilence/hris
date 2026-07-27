import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useInvalidateTeamsQuery } from "@/components/modules/settings/modules/teams/hooks/useInvalidateTeamsQuery/useInvalidateTeamsQuery";
import { activateTeamAction } from "@/components/modules/settings/modules/teams/actions/activateTeamAction/activateTeamAction";

export const useActivateTeam = () => {
  const invalidate = useInvalidateTeamsQuery();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await activateTeamAction(id);
      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage ?? "Failed to activate team");
      }
      return result;
    },
    onSuccess: () => invalidate(),
  });
};
