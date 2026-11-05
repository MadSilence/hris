import { useTranslations } from "next-intl";
import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useInvalidateTeamsQuery } from "@/components/modules/settings/modules/teams/hooks/useInvalidateTeamsQuery/useInvalidateTeamsQuery";
import {
  updateTeamAction,
  type UpdateTeamActionInput,
} from "@/components/modules/settings/modules/teams/actions/updateTeamAction/updateTeamAction";

export const useUpdateTeam = () => {
  const t = useTranslations("structure.teams");
  const invalidate = useInvalidateTeamsQuery();

  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & UpdateTeamActionInput) => {
      const result = await updateTeamAction(id, payload);
      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage ?? t("errors.update"));
      }
      return result;
    },
    onSuccess: () => invalidate(),
    // A refusal can mean the tree is stale (E00409: someone else saved first). The open dialog keeps
    // the node it was opened with; refetching means reopening it starts from the current version.
    onError: () => invalidate(),
  });
};
