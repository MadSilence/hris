import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useInvalidateTeamsQuery } from "@/components/modules/settings/modules/teams/hooks/useInvalidateTeamsQuery/useInvalidateTeamsQuery";
import { activateTeamAction } from "@/components/modules/settings/modules/teams/actions/activateTeamAction/activateTeamAction";

/** A bare id restores the team alone; the object form also names the sub-units to bring back. */
export type ActivateTeamInput = string | { id: string; restoreUnitIds?: string[] };

export const useActivateTeam = () => {
  const invalidate = useInvalidateTeamsQuery();

  return useMutation({
    mutationFn: async (input: ActivateTeamInput) => {
      const { id, restoreUnitIds } = typeof input === "string" ? { id: input, restoreUnitIds: undefined } : input;
      const result = await activateTeamAction(id, restoreUnitIds);
      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage ?? "Failed to activate team");
      }
      return result;
    },
    onSuccess: () => invalidate(),
  });
};
