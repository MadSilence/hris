import { useQueryClient } from "@tanstack/react-query";
import { DEPARTMENTS_QUERY_KEY } from "@/components/modules/settings/modules/departments/utils/departmentQueryKeys";

export const useInvalidateDepartmentsQuery = () => {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: [DEPARTMENTS_QUERY_KEY] });
  };
};
