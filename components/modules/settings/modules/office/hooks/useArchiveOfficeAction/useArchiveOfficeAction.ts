import { useMutation } from "@tanstack/react-query";
import {
  archiveOfficeAction,
  restoreOfficeAction,
  type ArchiveOfficeActionInput,
} from "@/components/modules/settings/modules/office/actions/archiveOfficeAction";
import { useInvalidateOfficeQuery } from "@/components/modules/settings/modules/office/hooks/useOffice";

export const useArchiveOfficeAction = () => {
  const invalidate = useInvalidateOfficeQuery();

  return useMutation({
    mutationFn: (payload: ArchiveOfficeActionInput) => archiveOfficeAction(payload),
    onSuccess: () => invalidate(),
  });
};

export const useRestoreOfficeAction = () => {
  const invalidate = useInvalidateOfficeQuery();

  return useMutation({
    mutationFn: (id: string) => restoreOfficeAction({ id }),
    onSuccess: () => invalidate(),
  });
};
