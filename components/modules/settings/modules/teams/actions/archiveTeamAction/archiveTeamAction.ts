"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTeamsService } from "@/api/modules/teams/services";

export const archiveTeamAction = async (id: string): Promise<ArchiveTeamActionOutput> => {
  try {
    await hrisTeamsService.archive(id);
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    console.error("archiveTeamAction error:", error);
    return {
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred while archiving the team. Please try again.",
    };
  }
};

export type ArchiveTeamActionOutput = { status: ActionStatus; errorMessage?: string };
