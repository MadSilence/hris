import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useInvalidateTeamsQuery } from "@/components/modules/settings/modules/teams/hooks/useInvalidateTeamsQuery/useInvalidateTeamsQuery";
import { addTeamMemberAction } from "@/components/modules/settings/modules/teams/actions/addTeamMemberAction/addTeamMemberAction";

export const useAddTeamMember = () => {
  const invalidate = useInvalidateTeamsQuery();

  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      const result = await addTeamMemberAction(id, userId);
      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage ?? "Failed to add member");
      }
      return result;
    },
    onSuccess: () => invalidate(),
  });
};
