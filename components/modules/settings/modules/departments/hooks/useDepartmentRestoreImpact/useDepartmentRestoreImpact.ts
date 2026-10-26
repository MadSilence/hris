import { useQuery } from "@tanstack/react-query";
import { departmentQueryKeys } from "@/components/modules/settings/modules/departments/utils/departmentQueryKeys";
import { departmentsService } from "@/components/modules/settings/modules/departments/services/departmentsService/departmentsService";

/**
 * The archived sub-units that could come back with the department being restored. Asked only once
 * Unarchive is pressed, and asked fresh — the list is what the reader decides on — so nothing is kept
 * in the cache and a window focus does not refetch it behind an open dialog.
 */
export const useDepartmentRestoreImpact = (id: string | null) =>
  useQuery({
    queryKey: departmentQueryKeys.restoreImpact(id),
    queryFn: () => departmentsService.restoreImpact(id as string),
    enabled: id !== null,
    staleTime: 0,
    gcTime: 0,
    retry: 1,
    refetchOnWindowFocus: false,
  });
