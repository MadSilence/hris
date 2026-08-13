import { useQuery } from "@tanstack/react-query";
import { getLeaveTypeQueryKey } from "@/components/modules/settings/modules/time/timeOff/utils";
import { leaveTypesService } from "@/components/modules/settings/modules/time/timeOff/leaveTypes/services/leaveTypesService";

export const useLeaveType = (id: string | undefined) => {
  return useQuery({
    queryKey: getLeaveTypeQueryKey(id ?? ""),
    queryFn: () => leaveTypesService.getById(id as string),
    enabled: !!id,
  });
};
