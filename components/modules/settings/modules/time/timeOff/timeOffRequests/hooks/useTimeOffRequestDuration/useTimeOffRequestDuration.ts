import { useQuery } from "@tanstack/react-query";
import { TIME_OFF_QUERY_KEY } from "@/components/modules/settings/modules/time/timeOff/utils";
import { timeOffRequestsService } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/services/timeOffRequestsService";

/**
 * Live preview of a request's counted duration (working days minus holidays, or calendar days) from the
 * backend — the authoritative number the request form should show. Enabled only for a valid range.
 */
export const useTimeOffRequestDuration = (
  assignmentId: string | undefined,
  startDate: string,
  endDate: string,
) => {
  const enabled = Boolean(assignmentId && startDate && endDate && startDate <= endDate);
  return useQuery({
    queryKey: [TIME_OFF_QUERY_KEY, "duration", assignmentId, startDate, endDate],
    queryFn: () => timeOffRequestsService.previewDuration(assignmentId as string, startDate, endDate),
    enabled,
  });
};
