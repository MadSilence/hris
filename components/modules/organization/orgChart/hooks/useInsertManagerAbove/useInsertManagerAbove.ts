"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import { ORG_CHART_QK } from "@/components/modules/organization/orgChart/hooks/useOrgChart/useOrgChart";
import { insertManagerAboveAction } from "@/components/modules/organization/orgChart/actions/insertManagerAboveAction";
import { showActionError } from "@/lib/errors/errorToast";

/**
 * "Add Manager Above" from the chart's side panel: one call, because the server moves both reporting
 * lines in one transaction. A refusal (a person from the target's own branch, a right that does not
 * reach one of the two) arrives as the refusal card, like a refused drag.
 */
export const useInsertManagerAbove = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, managerId }: { userId: string; managerId: string }) => {
      const result = await insertManagerAboveAction(userId, managerId);
      if (result.status === ActionStatus.ERROR) {
        showActionError(result);
        throw new Error(result.errorMessage ?? "Failed to add a manager above");
      }
      return result;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [ORG_CHART_QK] });
    },
  });
};
