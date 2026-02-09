import { useMutation } from "@tanstack/react-query";
import type { DeleteOfficeActionInput } from "@/components/modules/settings/modules/office/actions/deleteOfficeAction";
import { deleteOfficeAction } from "@/components/modules/settings/modules/office/actions/deleteOfficeAction";
import { useInvalidateOfficeQuery } from "@/components/modules/settings/modules/office/hooks/useOffice";

export const useDeleteOfficeAction = () => {
  const invalidate = useInvalidateOfficeQuery();

  return useMutation({
    mutationFn: (payload: DeleteOfficeActionInput) =>
      deleteOfficeAction(payload),
    onSuccess: () => {
      invalidate();
    },
  });
};
