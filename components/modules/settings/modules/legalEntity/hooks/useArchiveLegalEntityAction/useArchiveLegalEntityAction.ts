import { useMutation } from "@tanstack/react-query";
import {
  archiveLegalEntityAction,
  restoreLegalEntityAction,
  type ArchiveLegalEntityActionInput,
} from "@/components/modules/settings/modules/legalEntity/actions/archiveLegalEntityAction";
import { useInvalidateLegalEntityQuery } from "@/components/modules/settings/modules/legalEntity/hooks/useLegalEntity";

export const useArchiveLegalEntityAction = () => {
  const invalidate = useInvalidateLegalEntityQuery();

  return useMutation({
    mutationFn: (payload: ArchiveLegalEntityActionInput) => archiveLegalEntityAction(payload),
    onSuccess: () => invalidate(),
  });
};

export const useRestoreLegalEntityAction = () => {
  const invalidate = useInvalidateLegalEntityQuery();

  return useMutation({
    mutationFn: (id: string) => restoreLegalEntityAction({ id }),
    onSuccess: () => invalidate(),
  });
};
