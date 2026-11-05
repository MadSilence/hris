import { useTranslations } from "next-intl";
import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useInvalidateTeamsQuery } from "@/components/modules/settings/modules/teams/hooks/useInvalidateTeamsQuery/useInvalidateTeamsQuery";
import {
  archiveTeamAction,
  type ArchiveTeamActionInput,
} from "@/components/modules/settings/modules/teams/actions/archiveTeamAction/archiveTeamAction";

export const useArchiveTeam = () => {
  const t = useTranslations("structure.teams");
  const invalidate = useInvalidateTeamsQuery();

  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & Partial<ArchiveTeamActionInput>) => {
      const hasPayload = Object.keys(payload).length > 0;
      const result = await archiveTeamAction(
        id,
        hasPayload ? (payload as ArchiveTeamActionInput) : undefined,
      );
      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage ?? t("errors.archive"));
      }
      return result;
    },
    onSuccess: () => invalidate(),
  });
};
