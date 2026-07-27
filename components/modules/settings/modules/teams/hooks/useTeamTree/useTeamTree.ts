import { useQuery } from "@tanstack/react-query";
import { teamQueryKeys } from "@/components/modules/settings/modules/teams/utils/teamQueryKeys";
import { teamsService } from "@/components/modules/settings/modules/teams/services/teamsService/teamsService";

export const useTeamTree = (includeArchived = false) => {
  return useQuery({
    queryKey: teamQueryKeys.tree(includeArchived),
    queryFn: () => teamsService.tree(true, includeArchived),
  });
};
