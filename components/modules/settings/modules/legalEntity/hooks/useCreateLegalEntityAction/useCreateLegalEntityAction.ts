import { useMutation } from "@tanstack/react-query";
import type { CreateLegalEntityActionInput } from "@/components/modules/settings/modules/legalEntity/actions/createLegalEntityAction";
import { createLegalEntityAction, } from "@/components/modules/settings/modules/legalEntity/actions/createLegalEntityAction";
import { useInvalidateLegalEntityQuery } from "@/components/modules/settings/modules/legalEntity/hooks/useLegalEntity";

export const useCreateLegalEntityAction = () => {
  const invalidate = useInvalidateLegalEntityQuery();

  return useMutation({
    mutationFn: (payload: CreateLegalEntityActionInput) =>
      createLegalEntityAction(payload),
    onSuccess: () => {
      invalidate();
    },
  });
};
