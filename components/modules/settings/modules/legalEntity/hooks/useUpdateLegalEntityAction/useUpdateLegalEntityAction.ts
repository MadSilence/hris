import { useMutation } from "@tanstack/react-query";
import type { UpdateLegalEntityActionInput } from "@/components/modules/settings/modules/legalEntity/actions/updateLegalEntityAction";
import { updateLegalEntityAction } from "@/components/modules/settings/modules/legalEntity/actions/updateLegalEntityAction";
import { useInvalidateLegalEntityQuery } from "@/components/modules/settings/modules/legalEntity/hooks/useLegalEntity";

export const useUpdateLegalEntityAction = () => {
  const invalidate = useInvalidateLegalEntityQuery();

  return useMutation({
    mutationFn: (payload: UpdateLegalEntityActionInput) =>
      updateLegalEntityAction(payload),
    onSuccess: () => {
      invalidate();
    },
  });
};
