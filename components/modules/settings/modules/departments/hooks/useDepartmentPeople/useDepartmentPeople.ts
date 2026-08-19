import { useQuery } from "@tanstack/react-query";
import { departmentQueryKeys } from "@/components/modules/settings/modules/departments/utils/departmentQueryKeys";
import { departmentsService } from "@/components/modules/settings/modules/departments/services/departmentsService/departmentsService";

/**
 * Everyone in the company with their department membership. One request feeds both the people
 * search and the block view, so it is fetched whole and filtered on the client.
 */
export const useDepartmentPeople = (enabled = true) => {
  return useQuery({
    queryKey: departmentQueryKeys.people(),
    queryFn: () => departmentsService.people(),
    enabled,
    staleTime: 60_000,
  });
};
