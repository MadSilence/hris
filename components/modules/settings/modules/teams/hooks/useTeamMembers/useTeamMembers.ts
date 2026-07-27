import { useQuery } from "@tanstack/react-query";
import { teamQueryKeys } from "@/components/modules/settings/modules/teams/utils/teamQueryKeys";
import { teamsService } from "@/components/modules/settings/modules/teams/services/teamsService/teamsService";

export const useTeamMembers = (id: string, page = 0, size = 20) => {
  return useQuery({
    queryKey: teamQueryKeys.members(id, page, size),
    queryFn: () => teamsService.getMembers(id, page, size),
    enabled: !!id,
  });
};
