"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTeamsService } from "@/api/modules/teams/services";
import type { CreateTeamRequest } from "@/api/modules/teams/dto";
import type { CreateResponse } from "@/api/models/misc";
import { toActionError } from "@/lib/errors/withActionError";

export const createTeamAction = async (
  submission: CreateTeamActionInput,
): Promise<CreateTeamActionOutput> => {
  try {
    const data = await hrisTeamsService.create(submission);
    return { status: ActionStatus.SUCCESS, data };
  } catch (error) {
    return toActionError(error, "createTeamAction");
  }
};

export type CreateTeamActionInput = CreateTeamRequest;
export type CreateTeamActionOutput = {
  status: ActionStatus;
  data?: CreateResponse;
  errorMessage?: string;
};
