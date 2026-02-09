import { useMutation } from "@tanstack/react-query";
import type { CreateOfficeActionInput } from "@/components/modules/settings/modules/office/actions/createOfficeAction";
import { createOfficeAction } from "@/components/modules/settings/modules/office/actions/createOfficeAction";
import { useInvalidateOfficeQuery } from "@/components/modules/settings/modules/office/hooks/useOffice";

export const useCreateOfficeAction = () => {
  const invalidate = useInvalidateOfficeQuery();

  return useMutation({
    mutationFn: (payload: CreateOfficeActionInput) =>
      createOfficeAction(payload),
    onSuccess: () => {
      invalidate();
    },
  });
};
