import { useQuery } from "@tanstack/react-query";
import { departmentQueryKeys } from "@/components/modules/settings/modules/departments/utils/departmentQueryKeys";
import { departmentsService } from "@/components/modules/settings/modules/departments/services/departmentsService/departmentsService";

export const useDepartmentMembers = (id: string, page = 0, size = 20) => {
  return useQuery({
    queryKey: departmentQueryKeys.members(id, page, size),
    queryFn: () => departmentsService.getMembers(id, page, size),
    enabled: !!id,
  });
};
