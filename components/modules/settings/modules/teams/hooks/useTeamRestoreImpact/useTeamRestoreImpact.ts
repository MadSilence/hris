import { useQuery } from "@tanstack/react-query";
import { teamQueryKeys } from "@/components/modules/settings/modules/teams/utils/teamQueryKeys";
import { teamsService } from "@/components/modules/settings/modules/teams/services/teamsService/teamsService";

/**
 * The archived sub-units that could come back with the team being restored. Asked only once
 * Unarchive is pressed, and asked fresh — the list is what the reader decides on — so nothing is kept
 * in the cache and a window focus does not refetch it behind an open dialog.
 */
export const useTeamRestoreImpact = (id: string | null) =>
  useQuery({
    queryKey: teamQueryKeys.restoreImpact(id),
    queryFn: () => teamsService.restoreImpact(id as string),
    enabled: id !== null,
    staleTime: 0,
    gcTime: 0,
    retry: 1,
    refetchOnWindowFocus: false,
  });
