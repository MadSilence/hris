"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import { ORG_CHART_QK } from "@/components/modules/organization/orgChart/hooks/useOrgChart/useOrgChart";
import { setManagerAction } from "@/components/modules/organization/orgChart/actions/setManagerAction";

export const useSetManager = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, managerId }: { userId: string; managerId: string | null }) => {
      const result = await setManagerAction(userId, managerId);
      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage ?? "Failed to update the reporting line");
      }
      return result;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [ORG_CHART_QK] });
    },
  });
};
