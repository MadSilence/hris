import { useMutation } from "@tanstack/react-query";
import type { DeleteLegalEntityActionInput } from "@/components/modules/settings/modules/legalEntity/actions/deleteLegalEntityAction";
import { deleteLegalEntityAction, } from "@/components/modules/settings/modules/legalEntity/actions/deleteLegalEntityAction";
import { useInvalidateLegalEntityQuery } from "@/components/modules/settings/modules/legalEntity/hooks/useLegalEntity";

export const useDeleteLegalEntityAction = () => {
  const invalidate = useInvalidateLegalEntityQuery();

  return useMutation({
    mutationFn: (payload: DeleteLegalEntityActionInput) =>
      deleteLegalEntityAction(payload),
    onSuccess: () => {
      invalidate();
    },
  });
};
