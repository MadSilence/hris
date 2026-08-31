"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTeamsService } from "@/api/modules/teams/services";
import type { DeleteTeamRequest } from "@/api/modules/teams/dto";
import { toActionError } from "@/lib/errors/withActionError";

export const deleteTeamAction = async (
  id: string,
  submission: DeleteTeamActionInput,
): Promise<DeleteTeamActionOutput> => {
  try {
    await hrisTeamsService.delete(id, submission);
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    return toActionError(error, "deleteTeamAction");
  }
};

export type DeleteTeamActionInput = DeleteTeamRequest;
export type DeleteTeamActionOutput = { status: ActionStatus; errorMessage?: string };
