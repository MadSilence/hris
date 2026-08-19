"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ActionStatus } from "@/components/models/ActionStatus";
import {
  assignmentApplyAction,
  unassignUserAction,
} from "@/components/audience/assignment/actions/assignmentActions";
import { TEAMS_QUERY_KEY } from "@/components/modules/settings/modules/teams/utils/teamQueryKeys";

const BASE_PATH = "/teams";

export type TeamMoveMode = "move" | "add";

export type MovePersonInput = {
  userId: string;
  /** null means "take them off the source team" — the drop landed on Unassigned. */
  targetTeamId: string | null;
  sourceTeamId: string | null;
  mode: TeamMoveMode;
};

/**
 * Team membership is many-to-many, so a "move" is remove-then-add and only touches the team the
 * person was dragged from; "add" leaves every existing membership alone.
 */
export const useMovePersonToTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, targetTeamId, sourceTeamId, mode }: MovePersonInput) => {
      if (!targetTeamId) {
        if (!sourceTeamId) return;
        const removed = await unassignUserAction(BASE_PATH, sourceTeamId, userId);
        if (removed.status === ActionStatus.ERROR) {
          throw new Error(removed.errorMessage ?? "Failed to remove the person");
        }
        return;
      }

      const added = await assignmentApplyAction(BASE_PATH, targetTeamId, {
        targetType: "USER",
        targetPayload: { userIds: [userId] },
      });
      if (added.status === ActionStatus.ERROR) {
        throw new Error(added.errorMessage ?? "Failed to add the person to the team");
      }

      if (mode === "move" && sourceTeamId && sourceTeamId !== targetTeamId) {
        const removed = await unassignUserAction(BASE_PATH, sourceTeamId, userId);
        if (removed.status === ActionStatus.ERROR) {
          // The add already landed; say so plainly instead of pretending the move failed whole.
          throw new Error(
            "Added to the new team, but removing them from the old one failed. Check both teams.",
          );
        }
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [TEAMS_QUERY_KEY] });
    },
  });
};
