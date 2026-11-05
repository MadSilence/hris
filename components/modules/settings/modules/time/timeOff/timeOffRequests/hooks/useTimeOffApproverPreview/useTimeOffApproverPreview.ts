import { useQuery } from "@tanstack/react-query";
import { TIME_OFF_QUERY_KEY } from "@/components/modules/settings/modules/time/timeOff/utils";
import { timeOffRequestsService } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/services/timeOffRequestsService";

/** Who a request against this assignment would go to first — "Goes to …" in the request form (C7). */
export const useTimeOffApproverPreview = (assignmentId: string | undefined) =>
  useQuery({
    queryKey: [TIME_OFF_QUERY_KEY, "approvers", assignmentId],
    queryFn: () => timeOffRequestsService.previewApprovers(assignmentId as string),
    enabled: Boolean(assignmentId),
  });
