import { useTranslations } from "next-intl";
import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useInvalidateDepartmentsQuery } from "@/components/modules/settings/modules/departments/hooks/useInvalidateDepartmentsQuery/useInvalidateDepartmentsQuery";
import { moveDepartmentAction } from "@/components/modules/settings/modules/departments/actions/moveDepartmentAction";

export const useMoveDepartment = () => {
  const t = useTranslations("structure.departments");
  const invalidate = useInvalidateDepartmentsQuery();

  return useMutation({
    mutationFn: async ({ id, parentId }: { id: string; parentId: string | null }) => {
      const result = await moveDepartmentAction(id, { parentId });
      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage ?? t("errors.move"));
      }
      return result;
    },
    onSuccess: () => invalidate(),
  });
};
