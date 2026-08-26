"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ActionStatus } from "@/components/models/ActionStatus";
import {
  assignmentApplyAction,
  unassignUserAction,
} from "@/components/audience/assignment/actions/assignmentActions";
import { assignmentSkippedEverything } from "@/components/audience/assignment/assignmentSkips";
import { DEPARTMENTS_QUERY_KEY } from "@/components/modules/settings/modules/departments/utils/departmentQueryKeys";

const BASE_PATH = "/departments";

export type MovePersonInput = {
  userId: string;
  /** null means "take them out of the structure" — the drop landed on Unassigned. */
  targetDepartmentId: string | null;
  sourceDepartmentId: string | null;
};

/**
 * Department membership is single-valued, so assigning to a new department already moves the
 * person; only the drop onto Unassigned needs an explicit unassign.
 */
export const useMovePersonToDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, targetDepartmentId, sourceDepartmentId }: MovePersonInput) => {
      if (targetDepartmentId) {
        const result = await assignmentApplyAction(BASE_PATH, targetDepartmentId, {
          targetType: "USER",
          targetPayload: { userIds: [userId] },
        });
        if (result.status === ActionStatus.ERROR) {
          throw new Error(result.errorMessage ?? "Failed to move the person");
        }

        // The engine answers 200 while quietly assigning nobody — an archived person, someone
        // already there. Without this the dialog closed on "success" and the chip never moved.
        const skipped = assignmentSkippedEverything(result.data);
        if (skipped) throw new Error(skipped);

        return;
      }

      if (!sourceDepartmentId) return;
      const result = await unassignUserAction(BASE_PATH, sourceDepartmentId, userId);
      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage ?? "Failed to remove the person");
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [DEPARTMENTS_QUERY_KEY] });
    },
  });
};
