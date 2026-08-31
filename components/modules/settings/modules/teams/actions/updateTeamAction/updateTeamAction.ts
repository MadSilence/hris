"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTeamsService } from "@/api/modules/teams/services";
import type { UpdateTeamRequest } from "@/api/modules/teams/dto";
import type { UpdateResponse } from "@/api/models/misc";
import { toActionError } from "@/lib/errors/withActionError";

export const updateTeamAction = async (
  id: string,
  submission: UpdateTeamActionInput,
): Promise<UpdateTeamActionOutput> => {
  try {
    const data = await hrisTeamsService.update(id, submission);
    return { status: ActionStatus.SUCCESS, data };
  } catch (error) {
    return toActionError(error, "updateTeamAction");
  }
};

export type UpdateTeamActionInput = UpdateTeamRequest;
export type UpdateTeamActionOutput = {
  status: ActionStatus;
  data?: UpdateResponse;
  errorMessage?: string;
};
