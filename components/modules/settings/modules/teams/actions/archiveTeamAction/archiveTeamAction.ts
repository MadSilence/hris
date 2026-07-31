"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTeamsService } from "@/api/modules/teams/services";
import type { ArchiveTeamRequest } from "@/api/modules/teams/dto";

export const archiveTeamAction = async (
  id: string,
  submission?: ArchiveTeamActionInput,
): Promise<ArchiveTeamActionOutput> => {
  try {
    await hrisTeamsService.archive(id, submission);
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    console.error("archiveTeamAction error:", error);
    return {
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred while archiving the team. Please try again.",
    };
  }
};

export type ArchiveTeamActionInput = ArchiveTeamRequest;
export type ArchiveTeamActionOutput = { status: ActionStatus; errorMessage?: string };
