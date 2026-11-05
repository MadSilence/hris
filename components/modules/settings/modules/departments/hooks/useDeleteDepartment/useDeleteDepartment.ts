import { useTranslations } from "next-intl";
import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useInvalidateDepartmentsQuery } from "@/components/modules/settings/modules/departments/hooks/useInvalidateDepartmentsQuery/useInvalidateDepartmentsQuery";
import {
  deleteDepartmentAction,
  type DeleteDepartmentActionInput,
} from "@/components/modules/settings/modules/departments/actions/deleteDepartmentAction/deleteDepartmentAction";

export const useDeleteDepartment = () => {
  const t = useTranslations("structure.departments");
  const invalidate = useInvalidateDepartmentsQuery();

  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & DeleteDepartmentActionInput) => {
      const result = await deleteDepartmentAction(id, payload);
      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage ?? t("errors.delete"));
      }
      return result;
    },
    onSuccess: () => invalidate(),
  });
};
