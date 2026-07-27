import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useInvalidateTeamsQuery } from "@/components/modules/settings/modules/teams/hooks/useInvalidateTeamsQuery/useInvalidateTeamsQuery";
import { setTeamLeadAction } from "@/components/modules/settings/modules/teams/actions/setTeamLeadAction/setTeamLeadAction";

export const useSetTeamLead = () => {
  const invalidate = useInvalidateTeamsQuery();

  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      const result = await setTeamLeadAction(id, userId);
      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage ?? "Failed to set team lead");
      }
      return result;
    },
    onSuccess: () => invalidate(),
  });
};
