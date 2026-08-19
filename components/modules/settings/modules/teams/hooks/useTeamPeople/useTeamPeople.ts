import { useQuery } from "@tanstack/react-query";
import { teamQueryKeys } from "@/components/modules/settings/modules/teams/utils/teamQueryKeys";
import { teamsService } from "@/components/modules/settings/modules/teams/services/teamsService/teamsService";

/**
 * Everyone in the company with their team membership. One request feeds both the people
 * search and the block view, so it is fetched whole and filtered on the client.
 */
export const useTeamPeople = (enabled = true) => {
  return useQuery({
    queryKey: teamQueryKeys.people(),
    queryFn: () => teamsService.people(),
    enabled,
    staleTime: 60_000,
  });
};
