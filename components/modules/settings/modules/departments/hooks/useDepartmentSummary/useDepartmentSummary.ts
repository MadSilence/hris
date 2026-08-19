import { useQuery } from "@tanstack/react-query";
import { departmentQueryKeys } from "@/components/modules/settings/modules/departments/utils/departmentQueryKeys";
import { departmentsService } from "@/components/modules/settings/modules/departments/services/departmentsService/departmentsService";

export const useDepartmentSummary = (includeArchived = false) => {
  return useQuery({
    queryKey: departmentQueryKeys.summary(includeArchived),
    queryFn: () => departmentsService.summary(includeArchived),
  });
};
