"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTeamsService } from "@/api/modules/teams/services";
import { toActionError } from "@/lib/errors/withActionError";

/**
 * Restores the team. `restoreUnitIds` names the archived sub-units chosen to come back with it;
 * absent or empty, it comes back alone — which is what every caller did before the choice existed.
 */
export async function activateTeamAction(
  id: string,
  restoreUnitIds?: string[],
): Promise<ActivateTeamActionOutput> {
  try {
    await hrisTeamsService.activate(id, restoreUnitIds?.length ? { restoreUnitIds } : undefined);
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    return toActionError(error, "activateTeamAction");
  }
}

export type ActivateTeamActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};
