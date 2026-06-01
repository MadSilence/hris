import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  assertTimeOffId,
  getTimeOffPolicyApprovalSettingsQueryKey,
} from "@/components/modules/settings/modules/time/timeOff/utils";
import { timeOffPolicyApprovalSettingsService } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyApprovalSettings/services/timeOffPolicyApprovalSettingsService";

type UseTimeOffPolicyApprovalSettingsArgs = {
  policyId: string;
};

export const useTimeOffPolicyApprovalSettings = ({
  policyId,
}: UseTimeOffPolicyApprovalSettingsArgs) => {
  return useQuery({
    queryKey: getTimeOffPolicyApprovalSettingsQueryKey(policyId),
    queryFn: () => {
      assertTimeOffId(policyId, "policyId");
      return timeOffPolicyApprovalSettingsService.getByPolicyId(policyId);
    },
    enabled: Boolean(policyId && policyId !== "undefined"),
  });
};

export const useInvalidateTimeOffPolicyApprovalSettingsQuery = () => {
  const queryClient = useQueryClient();

  return (policyId: string) => {
    void queryClient.invalidateQueries({
      queryKey: getTimeOffPolicyApprovalSettingsQueryKey(policyId),
    });
  };
};
