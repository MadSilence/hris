import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useInvalidateTeamsQuery } from "@/components/modules/settings/modules/teams/hooks/useInvalidateTeamsQuery/useInvalidateTeamsQuery";
import { archiveTeamAction } from "@/components/modules/settings/modules/teams/actions/archiveTeamAction/archiveTeamAction";

export const useArchiveTeam = () => {
  const invalidate = useInvalidateTeamsQuery();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await archiveTeamAction(id);
      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage ?? "Failed to archive team");
      }
      return result;
    },
    onSuccess: () => invalidate(),
  });
};
