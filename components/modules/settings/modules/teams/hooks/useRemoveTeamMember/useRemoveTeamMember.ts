import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useInvalidateTeamsQuery } from "@/components/modules/settings/modules/teams/hooks/useInvalidateTeamsQuery/useInvalidateTeamsQuery";
import { removeTeamMemberAction } from "@/components/modules/settings/modules/teams/actions/removeTeamMemberAction/removeTeamMemberAction";

export const useRemoveTeamMember = () => {
  const invalidate = useInvalidateTeamsQuery();

  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      const result = await removeTeamMemberAction(id, userId);
      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage ?? "Failed to remove member");
      }
      return result;
    },
    onSuccess: () => invalidate(),
  });
};
