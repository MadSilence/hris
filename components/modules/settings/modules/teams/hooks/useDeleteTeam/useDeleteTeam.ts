import { useTranslations } from "next-intl";
import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useInvalidateTeamsQuery } from "@/components/modules/settings/modules/teams/hooks/useInvalidateTeamsQuery/useInvalidateTeamsQuery";
import {
  deleteTeamAction,
  type DeleteTeamActionInput,
} from "@/components/modules/settings/modules/teams/actions/deleteTeamAction/deleteTeamAction";

export const useDeleteTeam = () => {
  const t = useTranslations("structure.teams");
  const invalidate = useInvalidateTeamsQuery();

  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & DeleteTeamActionInput) => {
      const result = await deleteTeamAction(id, payload);
      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage ?? t("errors.delete"));
      }
      return result;
    },
    onSuccess: () => invalidate(),
  });
};
