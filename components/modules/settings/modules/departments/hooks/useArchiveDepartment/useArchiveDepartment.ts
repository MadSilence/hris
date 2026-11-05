import { useTranslations } from "next-intl";
import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useInvalidateDepartmentsQuery } from "@/components/modules/settings/modules/departments/hooks/useInvalidateDepartmentsQuery/useInvalidateDepartmentsQuery";
import {
  archiveDepartmentAction,
  type ArchiveDepartmentActionInput,
} from "@/components/modules/settings/modules/departments/actions/archiveDepartmentAction/archiveDepartmentAction";

export const useArchiveDepartment = () => {
  const t = useTranslations("structure.departments");
  const invalidate = useInvalidateDepartmentsQuery();

  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & Partial<ArchiveDepartmentActionInput>) => {
      const hasPayload = Object.keys(payload).length > 0;
      const result = await archiveDepartmentAction(
        id,
        hasPayload ? (payload as ArchiveDepartmentActionInput) : undefined,
      );
      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage ?? t("errors.archive"));
      }
      return result;
    },
    onSuccess: () => invalidate(),
  });
};
