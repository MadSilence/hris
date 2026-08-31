"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTeamsService } from "@/api/modules/teams/services";
import { toActionError } from "@/lib/errors/withActionError";

export const activateTeamAction = async (id: string): Promise<ActivateTeamActionOutput> => {
  try {
    await hrisTeamsService.activate(id);
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    return toActionError(error, "activateTeamAction");
  }
};

export type ActivateTeamActionOutput = { status: ActionStatus; errorMessage?: string };
