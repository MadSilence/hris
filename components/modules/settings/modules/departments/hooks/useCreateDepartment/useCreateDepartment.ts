import { useTranslations } from "next-intl";
import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useInvalidateDepartmentsQuery } from "@/components/modules/settings/modules/departments/hooks/useInvalidateDepartmentsQuery/useInvalidateDepartmentsQuery";
import {
  createDepartmentAction,
  type CreateDepartmentActionInput,
} from "@/components/modules/settings/modules/departments/actions/createDepartmentAction/createDepartmentAction";

export const useCreateDepartment = () => {
  const t = useTranslations("structure.departments");
  const invalidate = useInvalidateDepartmentsQuery();

  return useMutation({
    mutationFn: async (payload: CreateDepartmentActionInput) => {
      const result = await createDepartmentAction(payload);
      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage ?? t("errors.create"));
      }
      return result;
    },
    onSuccess: () => invalidate(),
  });
};
