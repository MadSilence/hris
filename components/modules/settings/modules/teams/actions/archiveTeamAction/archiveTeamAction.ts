"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTeamsService } from "@/api/modules/teams/services";
import type { ArchiveTeamRequest } from "@/api/modules/teams/dto";
import { toActionError } from "@/lib/errors/withActionError";

export const archiveTeamAction = async (
  id: string,
  submission?: ArchiveTeamActionInput,
): Promise<ArchiveTeamActionOutput> => {
  try {
    await hrisTeamsService.archive(id, submission);
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    return toActionError(error, "archiveTeamAction");
  }
};

export type ArchiveTeamActionInput = ArchiveTeamRequest;
export type ArchiveTeamActionOutput = { status: ActionStatus; errorMessage?: string };
