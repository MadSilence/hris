"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import { ORG_CHART_QK } from "@/components/modules/organization/orgChart/hooks/useOrgChart/useOrgChart";
import { setManagerAction } from "@/components/modules/organization/orgChart/actions/setManagerAction";
import { showActionError } from "@/lib/errors/errorToast";

export const useSetManager = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, managerId }: { userId: string; managerId: string | null }) => {
      const result = await setManagerAction(userId, managerId);
      if (result.status === ActionStatus.ERROR) {
        // A refused move used to snap the node back in silence — a circular line from a stale chart,
        // or a right revoked since the page loaded, looked exactly like a drop that missed. The
        // context (the drag) is over by the time the answer arrives, so it is the refusal card.
        showActionError(result);
        throw new Error(result.errorMessage ?? "Failed to update the reporting line");
      }
      return result;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [ORG_CHART_QK] });
    },
  });
};
