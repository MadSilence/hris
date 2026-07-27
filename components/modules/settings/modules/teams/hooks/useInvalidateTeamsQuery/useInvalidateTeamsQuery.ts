import { useQueryClient } from "@tanstack/react-query";
import { TEAMS_QUERY_KEY } from "@/components/modules/settings/modules/teams/utils/teamQueryKeys";

export const useInvalidateTeamsQuery = () => {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: [TEAMS_QUERY_KEY] });
  };
};
