import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useInvalidateTeamsQuery } from "@/components/modules/settings/modules/teams/hooks/useInvalidateTeamsQuery/useInvalidateTeamsQuery";
import { moveTeamAction } from "@/components/modules/settings/modules/teams/actions/moveTeamAction";

export const useMoveTeam = () => {
  const invalidate = useInvalidateTeamsQuery();

  return useMutation({
    mutationFn: async ({ id, parentId }: { id: string; parentId: string | null }) => {
      const result = await moveTeamAction(id, { parentId });
      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage ?? "Failed to move the team");
      }
      return result;
    },
    onSuccess: () => invalidate(),
  });
};
